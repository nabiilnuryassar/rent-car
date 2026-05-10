<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\ShuttleOrder;
use App\Models\ShuttleTariff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShuttleOrder>
 */
class ShuttleOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => 'SHT-'.strtoupper($this->faker->unique()->bothify('??###')),
            'customer_id' => Customer::factory(),
            'shuttle_tariff_id' => ShuttleTariff::factory(),
            'pickup_address' => $this->faker->address,
            'destination_address' => $this->faker->address,
            'estimated_distance_km' => $this->faker->randomFloat(2, 5, 100),
            'estimated_duration_minutes' => $this->faker->numberBetween(30, 180),
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+1 month'),
            'status' => $this->faker->randomElement(OrderStatus::cases()),
            'total_amount' => $this->faker->numberBetween(100000, 1000000),
        ];
    }
}
