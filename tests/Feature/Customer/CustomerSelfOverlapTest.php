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
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

it('rejects booking that overlaps customer active order', function (): void {
    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $customer = Customer::factory()->for($customerUser)->create();

    $category = VehicleCategory::factory()->create(['is_active' => true]);
    $vehicleA = Vehicle::factory()->for($category, 'category')->create();
    $vehicleB = Vehicle::factory()->for($category, 'category')->create();
    Driver::factory()->create(['status' => 'available']);

    PricingRule::factory()->create([
        'vehicle_category_id' => $category->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 500000,
    ]);

    RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'vehicle_id' => $vehicleA->id,
        'status' => OrderStatus::PendingPayment,
        'start_at' => Carbon::now()->addDays(2)->startOfHour(),
        'end_at' => Carbon::now()->addDays(4)->startOfHour(),
    ]);

    $this->actingAs($customerUser)
        ->post('/orders', [
            'vehicle_id' => $vehicleB->id,
            'rental_unit' => RentalUnit::Day->value,
            'duration' => 2,
            'start_at' => Carbon::now()->addDays(3)->startOfHour()->toDateTimeString(),
            'pickup_option' => PickupOption::PickupAtOffice->value,
            'is_out_of_town' => false,
        ])
        ->assertSessionHasErrors('start_at');
});
