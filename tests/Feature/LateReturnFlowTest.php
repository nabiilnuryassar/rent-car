<?php

use App\Enums\CustomerType;
use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\RentalUnit;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\OvertimePenalty;
use App\Models\Payment;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn ($r) => Role::findOrCreate($r));

    // Admin user
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    // Kasir user
    $this->kasir = User::factory()->create();
    $this->kasir->assignRole('kasir');

    // Customer
    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $this->customer = Customer::factory()->for($customerUser)->create([
        'customer_type' => CustomerType::New,
        'total_completed_orders' => 0,
    ]);
    $this->customerUser = $customerUser;

    // Driver
    $driverUser = User::factory()->create();
    $driverUser->assignRole('driver');
    $this->driver = Driver::factory()->for($driverUser)->create([
        'status' => DriverStatus::OnDuty,
    ]);

    // Vehicle category with overtime penalty
    $this->category = VehicleCategory::factory()->create([
        'name' => 'SUV',
        'class_level' => 2,
        'is_active' => true,
    ]);

    PricingRule::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 300_000,
        'discount_rate' => 0,
        'out_of_town_surcharge_rate' => 0.20,
    ]);

    $this->overtimePenalty = OvertimePenalty::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'hourly_rate' => 100_000,
    ]);

    // Vehicle
    $this->vehicle = Vehicle::factory()->for($this->category, 'category')->create([
        'status' => VehicleStatus::InUse,
    ]);

    // Ongoing rental order: end_at in the past so we can simulate late return
    $endAt = Carbon::now()->subHours(2);
    $this->order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
        'status' => OrderStatus::Ongoing,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 1,
        'start_at' => $endAt->copy()->subDay(),
        'end_at' => $endAt,
        'actual_return_at' => null,
        'total_amount' => 300_000,
    ]);

    // Already-paid base payment (so order was previously dispatched legitimately)
    Payment::factory()->create([
        'orderable_id' => $this->order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Paid->value,
        'amount' => 300_000,
    ]);
});

test('late return sets order to waiting_overtime_payment and creates unpaid overtime payment', function (): void {
    $endAt = $this->order->end_at;
    // 2.5 hours late → ceil(150/60) = 3 hours → 3 * 100_000 = 300_000
    $actualReturnAt = $endAt->copy()->addMinutes(150);

    $response = $this->actingAs($this->admin)
        ->post("/admin/orders/{$this->order->order_number}/return", [
            'actual_return_at' => $actualReturnAt->format('Y-m-d H:i:s'),
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('warning');

    $this->order->refresh();

    expect($this->order->status)->toBe(OrderStatus::WaitingOvertimePayment)
        ->and($this->order->actual_return_at)->not->toBeNull();

    // Vehicle and driver still occupied
    expect($this->vehicle->fresh()->status)->toBe(VehicleStatus::InUse)
        ->and($this->driver->fresh()->status)->toBe(DriverStatus::OnDuty);

    // Customer counter unchanged
    expect($this->customer->fresh()->total_completed_orders)->toBe(0);

    // Exactly one new unpaid overtime payment created
    $overtimePayment = $this->order->payments()
        ->where('status', PaymentStatus::Unpaid->value)
        ->first();

    expect($overtimePayment)->not->toBeNull()
        ->and($overtimePayment->amount)->toBe(300_000); // 3 hours * 100_000
});

test('approving overtime payment completes order and releases vehicle and driver', function (): void {
    $endAt = $this->order->end_at;
    $actualReturnAt = $endAt->copy()->addMinutes(150);

    // Process the late return first
    $this->actingAs($this->admin)
        ->post("/admin/orders/{$this->order->order_number}/return", [
            'actual_return_at' => $actualReturnAt->format('Y-m-d H:i:s'),
        ]);

    $this->order->refresh();
    expect($this->order->status)->toBe(OrderStatus::WaitingOvertimePayment);

    // Get the overtime payment and move it to waiting_verification (customer uploads proof)
    $overtimePayment = $this->order->payments()
        ->where('status', PaymentStatus::Unpaid->value)
        ->firstOrFail();

    $overtimePayment->update([
        'status' => PaymentStatus::WaitingVerification->value,
        'transfer_proof_url' => 'transfer-proofs/overtime-proof.jpg',
        'paid_at' => now(),
    ]);

    // Kasir approves the overtime payment
    $approveResponse = $this->actingAs($this->kasir)
        ->post("/admin/payments/{$overtimePayment->id}/approve");

    $approveResponse->assertRedirect();

    $this->order->refresh();

    expect($this->order->status)->toBe(OrderStatus::Completed)
        ->and($this->vehicle->fresh()->status)->toBe(VehicleStatus::Available)
        ->and($this->driver->fresh()->status)->toBe(DriverStatus::Available)
        ->and($this->customer->fresh()->total_completed_orders)->toBe(1);

    // Receipt generated for overtime payment
    $overtimePayment->refresh();
    expect($overtimePayment->status)->toBe(PaymentStatus::Paid)
        ->and($overtimePayment->receipt()->exists())->toBeTrue();
});

test('return for non-ongoing order returns session validation error and leaves order unchanged', function (): void {
    // Set order to completed (non-ongoing)
    $this->order->update(['status' => OrderStatus::Completed]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.orders.show', $this->order))
        ->post("/admin/orders/{$this->order->order_number}/return", [
            'actual_return_at' => now()->format('Y-m-d H:i:s'),
        ]);

    $response->assertSessionHasErrors('status');

    $this->order->refresh();
    expect($this->order->status)->toBe(OrderStatus::Completed)
        ->and($this->order->actual_return_at)->toBeNull();
});

test('return for waiting_overtime_payment order returns session validation error', function (): void {
    $this->order->update(['status' => OrderStatus::WaitingOvertimePayment]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.orders.show', $this->order))
        ->post("/admin/orders/{$this->order->order_number}/return", [
            'actual_return_at' => now()->format('Y-m-d H:i:s'),
        ]);

    $response->assertSessionHasErrors('status');

    $this->order->refresh();
    expect($this->order->status)->toBe(OrderStatus::WaitingOvertimePayment)
        ->and($this->order->actual_return_at)->toBeNull();
});

test('late return with no overtime penalty configured returns validation error and leaves order ongoing', function (): void {
    // Remove the overtime penalty for this category
    $this->overtimePenalty->delete();

    $endAt = $this->order->end_at;
    $actualReturnAt = $endAt->copy()->addHours(3);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.orders.show', $this->order))
        ->post("/admin/orders/{$this->order->order_number}/return", [
            'actual_return_at' => $actualReturnAt->format('Y-m-d H:i:s'),
        ]);

    $response->assertSessionHasErrors('overtime_penalty');

    $this->order->refresh();
    expect($this->order->status)->toBe(OrderStatus::Ongoing)
        ->and($this->order->actual_return_at)->toBeNull();

    // No overtime payment created
    $unpaidPayments = $this->order->payments()
        ->where('status', PaymentStatus::Unpaid->value)
        ->count();
    expect($unpaidPayments)->toBe(0);
});

test('complete endpoint is invalid for completed status', function (): void {
    $this->order->update(['status' => OrderStatus::Completed]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.orders.show', $this->order))
        ->post("/admin/orders/{$this->order->order_number}/complete");

    $response->assertSessionHasErrors('status');

    expect($this->order->fresh()->status)->toBe(OrderStatus::Completed);
});

test('complete endpoint is invalid for cancelled status', function (): void {
    $this->order->update(['status' => OrderStatus::Cancelled]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.orders.show', $this->order))
        ->post("/admin/orders/{$this->order->order_number}/complete");

    $response->assertSessionHasErrors('status');

    expect($this->order->fresh()->status)->toBe(OrderStatus::Cancelled);
});

test('complete endpoint is invalid for pending_payment status', function (): void {
    $this->order->update(['status' => OrderStatus::PendingPayment]);

    $response = $this->actingAs($this->admin)
        ->from(route('admin.orders.show', $this->order))
        ->post("/admin/orders/{$this->order->order_number}/complete");

    $response->assertSessionHasErrors('status');

    expect($this->order->fresh()->status)->toBe(OrderStatus::PendingPayment);
});

test('complete endpoint succeeds for waiting_overtime_payment status', function (): void {
    $this->order->update(['status' => OrderStatus::WaitingOvertimePayment]);

    $response = $this->actingAs($this->admin)
        ->post("/admin/orders/{$this->order->order_number}/complete");

    $response->assertRedirect();

    $this->order->refresh();
    expect($this->order->status)->toBe(OrderStatus::Completed)
        ->and($this->vehicle->fresh()->status)->toBe(VehicleStatus::Available)
        ->and($this->driver->fresh()->status)->toBe(DriverStatus::Available)
        ->and($this->customer->fresh()->total_completed_orders)->toBe(1);
});
