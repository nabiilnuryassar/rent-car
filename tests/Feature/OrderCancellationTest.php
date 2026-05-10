<?php

use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Enums\VehicleStatus;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\RentalOrder;
use App\Models\ShuttleOrder;
use App\Models\ShuttleTariff;
use App\Models\User;
use App\Models\Vehicle;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn ($r) => Role::findOrCreate($r));
});

function makeCustomerUser(): User
{
    $user = User::factory()->create();
    $user->assignRole('customer');
    Customer::factory()->for($user)->create(['total_completed_orders' => 0]);

    return $user;
}

function makeAdminUser(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

test('customer can cancel own pending_payment rental order', function () {
    $user = makeCustomerUser();
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::Available]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $user->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $response = $this->actingAs($user)
        ->post("/customer/rental-orders/{$order->id}/cancel", ['reason' => 'Berubah pikiran']);

    $response->assertRedirect(route('customer.rental-orders.show', $order));
    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled);
});

test('customer can cancel own pending_payment shuttle order', function () {
    $user = makeCustomerUser();
    $tariff = ShuttleTariff::factory()->create();

    $order = ShuttleOrder::factory()->create([
        'customer_id' => $user->customer->id,
        'shuttle_tariff_id' => $tariff->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $response = $this->actingAs($user)
        ->post("/customer/shuttle-orders/{$order->id}/cancel", ['reason' => 'Ganti rencana']);

    $response->assertRedirect(route('customer.shuttle-orders.show', $order));
    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled);
});

test('customer cannot cancel ongoing rental order', function () {
    $user = makeCustomerUser();
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::InUse]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::OnDuty]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $user->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    $response = $this->actingAs($user)
        ->from(route('customer.rental-orders.show', $order))
        ->post("/customer/rental-orders/{$order->id}/cancel", ['reason' => 'Coba batal']);

    $response->assertSessionHasErrors('status');
    expect($order->refresh()->status)->toBe(OrderStatus::Ongoing);
});

test('customer cannot cancel another customers rental order', function () {
    $owner = makeCustomerUser();
    $outsider = makeCustomerUser();

    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::Available]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $owner->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $response = $this->actingAs($outsider)
        ->post("/customer/rental-orders/{$order->id}/cancel", ['reason' => 'Bukan milik saya']);

    $response->assertForbidden();
    expect($order->refresh()->status)->toBe(OrderStatus::PendingPayment);
});

test('admin can cancel ongoing order with reason and release vehicle and driver', function () {
    $admin = makeAdminUser();
    $customerUser = makeCustomerUser();

    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::InUse]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::OnDuty]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    $response = $this->actingAs($admin)
        ->post("/admin/orders/{$order->id}/cancel", ['reason' => 'Force cancel by admin']);

    $response->assertRedirect(route('admin.orders.show', $order));

    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($vehicle->refresh()->status)->toBe(VehicleStatus::Available)
        ->and($driver->refresh()->status)->toBe(DriverStatus::Available);
});

test('admin cannot cancel completed order', function () {
    $admin = makeAdminUser();
    $customerUser = makeCustomerUser();

    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::Available]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Completed,
    ]);

    $response = $this->actingAs($admin)
        ->from(route('admin.orders.show', $order))
        ->post("/admin/orders/{$order->id}/cancel", ['reason' => 'Mencoba batal']);

    $response->assertSessionHasErrors('status');
    expect($order->refresh()->status)->toBe(OrderStatus::Completed);
});

test('admin cancel requires reason of at least 3 chars', function () {
    $admin = makeAdminUser();
    $customerUser = makeCustomerUser();

    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::Available]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $response = $this->actingAs($admin)
        ->from(route('admin.orders.show', $order))
        ->post("/admin/orders/{$order->id}/cancel", ['reason' => 'ab']);

    $response->assertSessionHasErrors('reason');
});

test('audit log is created on rental order cancellation', function () {
    $admin = makeAdminUser();
    $customerUser = makeCustomerUser();

    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::InUse]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => DriverStatus::OnDuty]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    $this->actingAs($admin)
        ->post("/admin/orders/{$order->id}/cancel", ['reason' => 'Kendaraan rusak di jalan']);

    $log = AuditLog::query()
        ->where('action', 'order_cancelled')
        ->where('subject_type', $order->getMorphClass())
        ->where('subject_id', $order->id)
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->user_id)->toBe($admin->id)
        ->and($log->metadata['reason'])->toBe('Kendaraan rusak di jalan')
        ->and($log->metadata['previous_status'])->toBe(OrderStatus::Ongoing->value);
});
