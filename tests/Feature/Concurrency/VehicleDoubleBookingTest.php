<?php

use App\Enums\OrderStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

function makeCustomerUserForVehicleRace(): User
{
    $user = User::factory()->create();
    $user->assignRole('customer');
    Customer::factory()->for($user)->create(['total_completed_orders' => 0]);

    return $user;
}

it('prevents two customers from booking the same vehicle for overlapping period', function (): void {
    $category = VehicleCategory::factory()->create(['class_level' => 9, 'is_active' => true]);
    $vehicle = Vehicle::factory()->for($category, 'category')->create(['status' => 'available']);

    PricingRule::factory()->create([
        'vehicle_category_id' => $category->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 500000,
    ]);

    Driver::factory()->count(2)->create(['status' => 'available']);

    $customerA = makeCustomerUserForVehicleRace();
    $customerB = makeCustomerUserForVehicleRace();

    $startAt = now()->addDays(3)->startOfHour()->toDateTimeString();
    $payload = [
        'vehicle_id' => $vehicle->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => $startAt,
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ];

    $first = $this->actingAs($customerA)->post('/orders', $payload);
    $second = $this->actingAs($customerB)->post('/orders', $payload);

    $first->assertRedirect();
    $second->assertSessionHasErrors('vehicle_id');

    expect(
        RentalOrder::query()
            ->where('vehicle_id', $vehicle->id)
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Completed->value, OrderStatus::Draft->value])
            ->count()
    )->toBe(1);
});
