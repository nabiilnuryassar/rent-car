<?php

namespace Database\Factories;

use App\Models\ShuttleTariff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShuttleTariff>
 */
class ShuttleTariffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'area_from' => $this->faker->city,
            'area_to' => $this->faker->city,
            'estimated_distance_km' => $this->faker->randomFloat(2, 5, 100),
            'estimated_duration_minutes' => $this->faker->numberBetween(30, 180),
            'tariff' => $this->faker->numberBetween(100000, 500000),
        ];
    }
}
