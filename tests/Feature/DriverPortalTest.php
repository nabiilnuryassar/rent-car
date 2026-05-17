<?php

use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn ($r) => Role::findOrCreate($r));
});

function makeDriverWithUser(): array
{
    $user = User::factory()->create();
    $user->assignRole('driver');
    $driver = Driver::factory()->for($user)->create([
        'status' => DriverStatus::Available,
    ]);

    return [$user, $driver];
}

test('driver dashboard returns mobile-first page with stats', function () {
    [$user, $driver] = makeDriverWithUser();

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    Customer::factory()->for($customerUser)->create();
    $vehicle = Vehicle::factory()->create();

    RentalOrder::factory()->count(3)->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    RentalOrder::factory()->count(2)->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Completed,
    ]);

    $response = $this->actingAs($user)->get('/driver/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('driver/dashboard')
        ->has('driver')
        ->has('stats')
        ->where('stats.active_count', 3)
        ->where('stats.completed_count', 2)
        ->has('assignedOrders', 3),
    );
});

test('driver orders index shows active and history orders', function () {
    [$user, $driver] = makeDriverWithUser();

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    Customer::factory()->for($customerUser)->create();
    $vehicle = Vehicle::factory()->create();

    RentalOrder::factory()->count(2)->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    RentalOrder::factory()->count(1)->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Completed,
    ]);

    $response = $this->actingAs($user)->get('/driver/orders');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('driver/orders/index')
        ->has('activeOrders', 2)
        ->has('completedOrders', 1),
    );
});

test('driver can view their own assigned order detail', function () {
    [$user, $driver] = makeDriverWithUser();

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    Customer::factory()->for($customerUser)->create();
    $vehicle = Vehicle::factory()->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    $response = $this->actingAs($user)->get("/driver/orders/{$order->order_number}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('driver/orders/show')
        ->where('order.id', $order->id)
        ->where('order.order_number', $order->order_number),
    );
});

test('driver cannot view another drivers order', function () {
    [$user, $driver] = makeDriverWithUser();
    [$otherUser, $otherDriver] = makeDriverWithUser();

    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    Customer::factory()->for($customerUser)->create();
    $vehicle = Vehicle::factory()->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $otherDriver->id,
        'status' => OrderStatus::Ongoing,
    ]);

    $response = $this->actingAs($user)->get("/driver/orders/{$order->order_number}");

    $response->assertForbidden();
});

test('driver can toggle status from available to off_duty', function () {
    [$user, $driver] = makeDriverWithUser();

    $response = $this->actingAs($user)->post('/driver/status', [
        'status' => 'off_duty',
    ]);

    $response->assertRedirect();
    expect($driver->fresh()->status)->toBe(DriverStatus::OffDuty);
});

test('driver cannot change status while reserved or on duty', function () {
    [$user, $driver] = makeDriverWithUser();
    $driver->update(['status' => DriverStatus::OnDuty]);

    $response = $this->actingAs($user)->post('/driver/status', [
        'status' => 'off_duty',
    ]);

    $response->assertRedirect();
    expect($driver->fresh()->status)->toBe(DriverStatus::OnDuty);
});

test('driver can update profile name and email', function () {
    [$user, $driver] = makeDriverWithUser();

    $response = $this->actingAs($user)->put('/driver/profile', [
        'name' => 'New Name',
        'email' => 'new@driver.test',
        'phone' => '08123456789',
    ]);

    $response->assertRedirect();
    expect($user->fresh()->name)->toBe('New Name')
        ->and($user->fresh()->email)->toBe('new@driver.test')
        ->and($driver->fresh()->phone)->toBe('08123456789');
});

test('non-driver users cannot access driver routes', function () {
    $customer = User::factory()->create();
    $customer->assignRole('customer');

    $this->actingAs($customer)->get('/driver/dashboard')->assertForbidden();
    $this->actingAs($customer)->get('/driver/orders')->assertForbidden();
    $this->actingAs($customer)->get('/driver/status')->assertForbidden();
    $this->actingAs($customer)->get('/driver/profile')->assertForbidden();
});

test('admin and kasir do not see driver routes either', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->get('/driver/dashboard')->assertForbidden();
});
