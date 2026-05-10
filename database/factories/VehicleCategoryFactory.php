<?php

namespace Database\Factories;

use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleCategory>
 */
class VehicleCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Sedan', 'MPV', 'Mobil Box', 'Bak Terbuka', 'Minibus']).' '.fake()->unique()->numberBetween(1, 999),
            'class_level' => fake()->numberBetween(1, 5),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
