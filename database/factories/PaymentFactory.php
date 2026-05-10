<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\RentalOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'orderable_id' => RentalOrder::factory(),
            'orderable_type' => RentalOrder::class,
            'method' => $this->faker->randomElement(PaymentMethod::cases()),
            'status' => $this->faker->randomElement(PaymentStatus::cases()),
            'amount' => $this->faker->numberBetween(150000, 2000000),
            'paid_at' => $this->faker->optional(0.8)->dateTimeThisMonth(),
            'transfer_proof_url' => null,
            'verified_at' => null,
            'verified_by' => null,
        ];
    }
}
