<?php

use App\Models\Customer;
use App\Models\Driver;
use App\Models\OvertimePenalty;
use App\Models\RentalOrder;
use App\Models\ShuttleOrder;
use App\Models\User;
use App\Models\VehicleCategory;

test('driver has many rental orders', function () {
    $driver = Driver::factory()->for(User::factory())->create();
    $order = RentalOrder::factory()->for($driver)->create();

    expect($driver->rentalOrders)->toHaveCount(1)
        ->and($driver->rentalOrders->first()->is($order))->toBeTrue();
});

test('vehicle category has one overtime penalty', function () {
    $category = VehicleCategory::factory()->create();
    $penalty = OvertimePenalty::factory()->for($category, 'category')->create([
        'hourly_rate' => 25000,
    ]);

    expect($category->overtimePenalty)->not->toBeNull()
        ->and($category->overtimePenalty->is($penalty))->toBeTrue()
        ->and((int) $category->overtimePenalty->hourly_rate)->toBe(25000);
});

test('customer has many rental orders and shuttle orders', function () {
    $customer = Customer::factory()->for(User::factory())->create();

    RentalOrder::factory()->for($customer)->count(2)->create();
    ShuttleOrder::factory()->for($customer)->count(1)->create();

    expect($customer->rentalOrders)->toHaveCount(2)
        ->and($customer->shuttleOrders)->toHaveCount(1);
});

test('customer is loyal when completed orders count is at least one', function () {
    $new = Customer::factory()->for(User::factory())->create([
        'total_completed_orders' => 0,
    ]);

    $loyal = Customer::factory()->for(User::factory())->create([
        'total_completed_orders' => 3,
    ]);

    expect($new->isLoyalCustomer())->toBeFalse()
        ->and($loyal->isLoyalCustomer())->toBeTrue();
});
