<?php

use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\UpgradeOffer;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn ($r) => Role::findOrCreate($r));
});

function makeLoggedInCustomer(): User
{
    $user = User::factory()->create();
    $user->assignRole('customer');
    Customer::factory()->for($user)->create(['total_completed_orders' => 0]);

    return $user;
}

test('booking with unavailable vehicle auto-triggers upgrade offer', function () {
    $user = makeLoggedInCustomer();

    $lowCategory = VehicleCategory::factory()->create(['class_level' => 1, 'is_active' => true]);
    $highCategory = VehicleCategory::factory()->create(['class_level' => 3, 'is_active' => true]);

    PricingRule::factory()->create([
        'vehicle_category_id' => $lowCategory->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 200000,
    ]);

    $requestedVehicle = Vehicle::factory()->for($lowCategory, 'category')->create(['status' => VehicleStatus::Available]);
    Vehicle::factory()->for($highCategory, 'category')->create(['status' => VehicleStatus::Available]);

    Driver::factory()->for(User::factory())->create(['status' => 'available']);

    // Create overlapping existing booking for the requested vehicle
    RentalOrder::factory()->for($requestedVehicle)->create([
        'status' => OrderStatus::Ongoing,
        'start_at' => Carbon::parse('2026-07-01 10:00:00'),
        'end_at' => Carbon::parse('2026-07-03 10:00:00'),
    ]);

    $response = $this->actingAs($user)->post('/customer/rental-orders', [
        'vehicle_id' => $requestedVehicle->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => '2026-07-02 10:00:00',
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ]);

    $response->assertRedirect();

    expect(RentalOrder::query()->where('customer_id', $user->customer->id)->count())->toBe(1)
        ->and(UpgradeOffer::query()->count())->toBe(1);

    $order = RentalOrder::query()->where('customer_id', $user->customer->id)->first();
    expect($order->status)->toBe(OrderStatus::Draft);

    $offer = UpgradeOffer::query()->first();
    expect($offer->status)->toBe(OfferStatus::Pending)
        ->and($offer->rental_order_id)->toBe($order->id);
});

test('booking fails when vehicle unavailable and no higher-class vehicle exists', function () {
    $user = makeLoggedInCustomer();

    $lowCategory = VehicleCategory::factory()->create(['class_level' => 5, 'is_active' => true]);
    PricingRule::factory()->create([
        'vehicle_category_id' => $lowCategory->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 200000,
    ]);

    $requestedVehicle = Vehicle::factory()->for($lowCategory, 'category')->create(['status' => VehicleStatus::Available]);

    RentalOrder::factory()->for($requestedVehicle)->create([
        'status' => OrderStatus::Ongoing,
        'start_at' => Carbon::parse('2026-07-01 10:00:00'),
        'end_at' => Carbon::parse('2026-07-05 10:00:00'),
    ]);

    $response = $this->actingAs($user)->post('/customer/rental-orders', [
        'vehicle_id' => $requestedVehicle->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => '2026-07-02 10:00:00',
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ]);

    $response->assertSessionHasErrors('vehicle_id');
    expect(RentalOrder::query()->where('customer_id', $user->customer->id)->count())->toBe(0);
});

test('accepting upgrade promotes order from draft to pending_payment and creates payment', function () {
    $user = makeLoggedInCustomer();

    $lowCategory = VehicleCategory::factory()->create(['class_level' => 1, 'is_active' => true]);
    $highCategory = VehicleCategory::factory()->create(['class_level' => 3, 'is_active' => true]);

    $upgradedVehicle = Vehicle::factory()->for($highCategory, 'category')->create(['status' => VehicleStatus::Available]);
    $driver = Driver::factory()->for(User::factory())->create(['status' => 'available']);

    $order = RentalOrder::factory()->create([
        'customer_id' => $user->customer->id,
        'vehicle_id' => $upgradedVehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Draft,
        'total_amount' => 400000,
    ]);

    $offer = UpgradeOffer::create([
        'rental_order_id' => $order->id,
        'original_vehicle_category_id' => $lowCategory->id,
        'upgraded_vehicle_id' => $upgradedVehicle->id,
        'status' => OfferStatus::Pending,
    ]);

    $response = $this->actingAs($user)->post("/customer/upgrade-offers/{$offer->id}/accept");

    $response->assertRedirect();
    $offer->refresh();
    $order->refresh();
    expect($offer->status)->toBe(OfferStatus::Accepted)
        ->and($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->payments()->count())->toBe(1);
});

test('rejecting upgrade cancels the draft order', function () {
    $user = makeLoggedInCustomer();

    $lowCategory = VehicleCategory::factory()->create(['class_level' => 1]);
    $highCategory = VehicleCategory::factory()->create(['class_level' => 3]);
    $vehicle = Vehicle::factory()->for($highCategory, 'category')->create();
    $driver = Driver::factory()->for(User::factory())->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $user->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::Draft,
    ]);

    $offer = UpgradeOffer::create([
        'rental_order_id' => $order->id,
        'original_vehicle_category_id' => $lowCategory->id,
        'upgraded_vehicle_id' => $vehicle->id,
        'status' => OfferStatus::Pending,
    ]);

    $response = $this->actingAs($user)->post("/customer/upgrade-offers/{$offer->id}/reject");

    $response->assertRedirect();
    $offer->refresh();
    $order->refresh();
    expect($offer->status)->toBe(OfferStatus::Rejected)
        ->and($order->status)->toBe(OrderStatus::Cancelled);
});
