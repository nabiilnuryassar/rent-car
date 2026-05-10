<?php

namespace Database\Factories;

use App\Enums\VehicleStatus;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_category_id' => VehicleCategory::factory(),
            'plate_number' => strtoupper(fake()->unique()->bothify('? #### ??')),
            'brand' => fake()->randomElement(['Toyota', 'Daihatsu', 'Suzuki', 'Mitsubishi', 'Honda']),
            'model' => fake()->randomElement(['Avanza', 'Xenia', 'Ertiga', 'Xpander', 'Brio']),
            'year' => fake()->numberBetween(2018, 2026),
            'status' => VehicleStatus::Available,
            'current_location' => 'Pool Utama',
        ];
    }
}
