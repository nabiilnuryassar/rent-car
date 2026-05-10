<?php

namespace Database\Factories;

use App\Enums\RentalUnit;
use App\Models\PricingRule;
use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PricingRule>
 */
class PricingRuleFactory extends Factory
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
            'rental_unit' => $this->faker->randomElement(RentalUnit::cases()),
            'min_duration' => 1,
            'max_duration' => 10,
            'base_rate' => $this->faker->numberBetween(50000, 500000),
            'discount_rate' => 0,
            'out_of_town_surcharge_rate' => 0.20,
        ];
    }
}
