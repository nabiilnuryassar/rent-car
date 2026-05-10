<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\RentalOrder;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RentalOrder>
 */
class RentalOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startAt = $this->faker->dateTimeBetween('now', '+1 month');
        $rentalUnit = $this->faker->randomElement(RentalUnit::cases());
        $duration = $this->faker->numberBetween(3, 24);

        return [
            'order_number' => 'ORD-'.strtoupper($this->faker->unique()->bothify('??###')),
            'customer_id' => Customer::factory(),
            'vehicle_id' => Vehicle::factory(),
            'driver_id' => Driver::factory(),
            'status' => $this->faker->randomElement(OrderStatus::cases()),
            'start_at' => $startAt,
            'end_at' => (clone $startAt)->modify("+{$duration} hours"),
            'actual_return_at' => null,
            'total_amount' => $this->faker->numberBetween(150000, 2000000),
            'rental_unit' => $rentalUnit,
            'duration' => $duration,
            'is_out_of_town' => $this->faker->boolean(20),
            'pickup_option' => $this->faker->randomElement(PickupOption::cases()),
            'delivery_address' => $this->faker->address,
        ];
    }
}
