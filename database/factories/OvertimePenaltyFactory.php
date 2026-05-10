<?php

namespace Database\Factories;

use App\Models\OvertimePenalty;
use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OvertimePenalty>
 */
class OvertimePenaltyFactory extends Factory
{
    protected $model = OvertimePenalty::class;

    public function definition(): array
    {
        return [
            'vehicle_category_id' => VehicleCategory::factory(),
            'hourly_rate' => $this->faker->numberBetween(10000, 50000),
        ];
    }
}
