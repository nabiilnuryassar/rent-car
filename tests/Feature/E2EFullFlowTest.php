<?php

use App\Enums\CustomerType;
use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\Payment;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn ($r) => Role::findOrCreate($r));
});

test('UC1+UC2+UC3+UC9+UC11+UC12+UC16+UC17+UC20: full rental flow with transfer payment', function () {
    Storage::fake('public');

    // === Setup all actors ===
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $kasir = User::factory()->create();
    $kasir->assignRole('kasir');

    $driverUser = User::factory()->create();
    $driverUser->assignRole('driver');
    $driver = Driver::factory()->for($driverUser)->create([
        'status' => DriverStatus::Available,
    ]);

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $customer = Customer::factory()->for($customerUser)->create([
        'customer_type' => CustomerType::New,
        'total_completed_orders' => 0,
    ]);

    // === Vehicle setup ===
    $category = VehicleCategory::factory()->create([
        'class_level' => 1,
        'is_active' => true,
    ]);
    PricingRule::factory()->create([
        'vehicle_category_id' => $category->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 200000,
    ]);
    $vehicle = Vehicle::factory()->for($category, 'category')->create([
        'status' => VehicleStatus::Available,
    ]);

    // === STEP 1 (UC1): Customer login \u2014 implicit via actingAs ===

    // === STEP 2-3 (UC2 + UC3 + UC4 + UC5): Customer browses & creates rental order ===
    $orderResp = $this->actingAs($customerUser)->post('/orders', [
        'vehicle_id' => $vehicle->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => now()->addDay()->format('Y-m-d H:i:s'),
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ]);
    $orderResp->assertRedirect();

    $order = RentalOrder::query()
        ->where('customer_id', $customer->id)
        ->firstOrFail();

    expect($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->driver_id)->toBe($driver->id);

    $payment = $order->payments()->firstOrFail();
    expect($payment->status)->toBe(PaymentStatus::Unpaid);

    // === STEP 4 (UC9): Customer uploads transfer proof ===
    $proofFile = UploadedFile::fake()->create('proof.jpg', 100, 'image/jpeg');
    $uploadResp = $this->actingAs($customerUser)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => $proofFile,
        ]);
    $uploadResp->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::WaitingVerification)
        ->and($payment->fresh()->method)->toBe(PaymentMethod::BankTransfer);

    // === STEP 5 (UC11): Kasir approves transfer ===
    $approveResp = $this->actingAs($kasir)
        ->post("/admin/payments/{$payment->id}/approve");
    $approveResp->assertRedirect();

    $payment->refresh();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::Paid)
        ->and($payment->verified_by)->toBe($kasir->id)
        ->and($order->status->value)->toBe('ready_to_dispatch');

    // === STEP 6 (UC12): Receipt auto-generated ===
    $receipt = $payment->receipt()->firstOrFail();
    expect($receipt->receipt_number)->not->toBeEmpty();

    // === STEP 7 (UC24): Customer can view receipt ===
    $receiptResp = $this->actingAs($customerUser)
        ->get("/receipts/{$receipt->receipt_number}");
    $receiptResp->assertOk();

    // === STEP 8 (UC16): Admin dispatches order ===
    $dispatchResp = $this->actingAs($admin)
        ->post("/admin/orders/{$order->order_number}/dispatch");
    $dispatchResp->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Ongoing)
        ->and($vehicle->fresh()->status)->toBe(VehicleStatus::InUse)
        ->and($driver->fresh()->status)->toBe(DriverStatus::OnDuty);

    // === STEP 9 (UC27): Driver views assigned order ===
    $driverDashResp = $this->actingAs($driverUser)->get('/driver/dashboard');
    $driverDashResp->assertOk();
    $driverDashResp->assertInertia(fn ($page) => $page
        ->where('stats.active_count', 1)
        ->has('assignedOrders', 1),
    );

    $driverOrderResp = $this->actingAs($driverUser)
        ->get("/driver/orders/{$order->order_number}");
    $driverOrderResp->assertOk();

    // === STEP 10 (UC17 + UC20): Admin records return on time ===
    $returnResp = $this->actingAs($admin)
        ->post("/admin/orders/{$order->order_number}/return", [
            'actual_return_at' => $order->end_at->format('Y-m-d H:i:s'),
        ]);
    $returnResp->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Completed)
        ->and($vehicle->fresh()->status)->toBe(VehicleStatus::Available)
        ->and($driver->fresh()->status)->toBe(DriverStatus::Available)
        ->and($customer->fresh()->total_completed_orders)->toBe(1);
});

test('UC10 + UC12 + UC24: cash payment flow generates receipt', function () {
    $kasir = User::factory()->create();
    $kasir->assignRole('kasir');

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $customer = Customer::factory()->for($customerUser)->create();

    $vehicle = Vehicle::factory()->create();
    $driverUser = User::factory()->create();
    $driverUser->assignRole('driver');
    $driver = Driver::factory()->for($driverUser)->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::PendingPayment,
        'total_amount' => 400000,
    ]);

    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::Cash,
        'status' => PaymentStatus::Unpaid,
        'amount' => 400000,
    ]);

    $cashResp = $this->actingAs($kasir)
        ->post("/admin/payments/{$payment->id}/cash", [
            'amount' => 400000,
        ]);
    $cashResp->assertRedirect();

    $payment->refresh();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::Paid)
        ->and($payment->method)->toBe(PaymentMethod::Cash)
        ->and($order->status->value)->toBe('ready_to_dispatch')
        ->and($payment->receipt()->exists())->toBeTrue();
});

test('UC11 reject flow: kasir rejects bad transfer proof', function () {
    Storage::fake('public');

    $kasir = User::factory()->create();
    $kasir->assignRole('kasir');

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $customer = Customer::factory()->for($customerUser)->create();

    $vehicle = Vehicle::factory()->create();
    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'vehicle_id' => $vehicle->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer,
        'status' => PaymentStatus::WaitingVerification,
        'transfer_proof_url' => 'transfer-proofs/test.jpg',
    ]);

    $rejectResp = $this->actingAs($kasir)
        ->post("/admin/payments/{$payment->id}/reject", [
            'rejection_reason' => 'Bukti transfer buram dan tidak terbaca',
        ]);
    $rejectResp->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Rejected);
});

test('admin dashboard returns dashboard data', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/admin/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboards/admin')
        ->where('isAdmin', true)
        ->has('stats')
        ->has('quickVerifications')
        ->has('pendingCash')
        ->has('trend'),
    );
});

test('kasir dashboard returns cashier-focused stats', function () {
    $kasir = User::factory()->create();
    $kasir->assignRole('kasir');

    $response = $this->actingAs($kasir)->get('/admin/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboards/admin')
        ->where('isAdmin', false)
        ->has('stats.paid_today')
        ->has('stats.mtd_revenue')
        ->has('pendingCash'),
    );
});
