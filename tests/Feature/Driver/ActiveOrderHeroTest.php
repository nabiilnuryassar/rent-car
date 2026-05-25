<?php

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Driver->value);
    Role::findOrCreate(UserRole::Customer->value);
});

test('driver dashboard exposes featured order with vehicle metadata', function (): void {
    $driverUser = User::factory()->create();
    $driverUser->assignRole(UserRole::Driver->value);
    $driver = Driver::factory()->create(['user_id' => $driverUser->id]);

    $customer = Customer::factory()->create();
    $vehicle = Vehicle::factory()->create([
        'images' => ['vehicles/hero-car.jpg'],
    ]);

    RentalOrder::factory()
        ->for($customer)
        ->for($vehicle)
        ->for($driver)
        ->create([
            'order_number' => 'ORD-DRIVER-HERO',
            'status' => OrderStatus::Ongoing,
            'start_at' => now()->addHour(),
        ]);

    $this->actingAs($driverUser)
        ->get(route('driver.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('driver/dashboard')
            ->where('featuredOrder.order_number', 'ORD-DRIVER-HERO')
            ->where('featuredOrder.vehicle.images.0', 'vehicles/hero-car.jpg')
        );
});

test('driver dashboard prefers ongoing order over earlier scheduled orders', function (): void {
    $driverUser = User::factory()->create();
    $driverUser->assignRole(UserRole::Driver->value);
    $driver = Driver::factory()->create(['user_id' => $driverUser->id]);
    $customer = Customer::factory()->create();

    RentalOrder::factory()
        ->for($customer)
        ->for($driver)
        ->create([
            'order_number' => 'ORD-EARLY',
            'status' => OrderStatus::ReadyToDispatch,
            'start_at' => now()->addHour(),
        ]);

    RentalOrder::factory()
        ->for($customer)
        ->for($driver)
        ->create([
            'order_number' => 'ORD-ONGOING',
            'status' => OrderStatus::Ongoing,
            'start_at' => now()->addDay(),
        ]);

    $this->actingAs($driverUser)
        ->get(route('driver.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('driver/dashboard')
            ->where('featuredOrder.order_number', 'ORD-ONGOING')
        );
});
