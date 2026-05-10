<?php

use App\Enums\CustomerType;
use App\Enums\DriverStatus;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;

test('a customer profile belongs to a user and stores contact details', function () {
    $user = User::factory()->create();

    $customer = Customer::factory()->for($user)->create([
        'phone' => '081234567890',
        'address' => 'Jl. Merdeka No. 1',
        'customer_type' => CustomerType::New,
    ]);

    expect($customer->user->is($user))->toBeTrue()
        ->and($customer->phone)->toBe('081234567890')
        ->and($customer->customer_type)->toBe(CustomerType::New);
});

test('a driver profile belongs to a user and casts availability status', function () {
    $user = User::factory()->create();

    $driver = Driver::factory()->for($user)->create([
        'license_number' => 'SIM-A-123456',
        'phone' => '081298765432',
        'status' => DriverStatus::Available,
    ]);

    expect($driver->user->is($user))->toBeTrue()
        ->and($driver->license_number)->toBe('SIM-A-123456')
        ->and($driver->status)->toBe(DriverStatus::Available);
});

test('a vehicle belongs to a category and casts operational status', function () {
    $category = VehicleCategory::factory()->create([
        'name' => 'MPV',
        'class_level' => 2,
        'is_active' => true,
    ]);

    $vehicle = Vehicle::factory()->for($category, 'category')->create([
        'plate_number' => 'B 1234 RNT',
        'brand' => 'Toyota',
        'model' => 'Avanza',
        'year' => 2024,
        'status' => VehicleStatus::Available,
    ]);

    expect($vehicle->category->is($category))->toBeTrue()
        ->and($vehicle->category->class_level)->toBe(2)
        ->and($vehicle->status)->toBe(VehicleStatus::Available);
});
