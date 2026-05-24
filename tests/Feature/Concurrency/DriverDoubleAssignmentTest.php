<?php

use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\PricingRule;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

function makeCustomerUserForDriverRace(): User
{
    $user = User::factory()->create();
    $user->assignRole('customer');
    Customer::factory()->for($user)->create(['total_completed_orders' => 0]);

    return $user;
}

it('does not assign the same driver to two bookings in the same period', function (): void {
    $category = VehicleCategory::factory()->create(['class_level' => 1, 'is_active' => true]);
    $vehicleA = Vehicle::factory()->for($category, 'category')->create(['status' => 'available']);
    $vehicleB = Vehicle::factory()->for($category, 'category')->create(['status' => 'available']);

    PricingRule::factory()->create([
        'vehicle_category_id' => $category->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 500000,
    ]);

    Driver::factory()->for(User::factory())->create(['status' => 'available']);

    $customerA = makeCustomerUserForDriverRace();
    $customerB = makeCustomerUserForDriverRace();
    $startAt = now()->addDays(3)->startOfHour()->toDateTimeString();

    $first = $this->actingAs($customerA)->post('/orders', [
        'vehicle_id' => $vehicleA->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => $startAt,
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ]);

    $second = $this->actingAs($customerB)->post('/orders', [
        'vehicle_id' => $vehicleB->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => $startAt,
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ]);

    $first->assertRedirect();
    $second->assertSessionHasErrors('driver_id');
});
