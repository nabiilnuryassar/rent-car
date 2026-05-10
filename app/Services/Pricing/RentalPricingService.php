<?php

namespace App\Services\Pricing;

use App\Enums\RentalUnit;
use App\Models\OvertimePenalty;
use App\Models\PricingRule;
use App\Models\VehicleCategory;
use Carbon\Carbon;
use InvalidArgumentException;

class RentalPricingService
{
    /**
     * @return array{
     *     base_rate: int,
     *     duration: int,
     *     rental_unit: string,
     *     subtotal: int,
     *     discount_amount: int,
     *     surcharge_amount: int,
     *     surcharge_rate: float,
     *     total: int
     * }
     */
    public function calculateQuote(
        VehicleCategory $category,
        RentalUnit $unit,
        int $duration,
        bool $isOutOfTown = false,
    ): array {
        if ($unit === RentalUnit::Hour && $duration < 3) {
            throw new InvalidArgumentException('Minimum sewa per jam adalah 3 jam.');
        }

        $rule = PricingRule::query()
            ->where('vehicle_category_id', $category->id)
            ->where('rental_unit', $unit->value)
            ->where('min_duration', '<=', $duration)
            ->where('max_duration', '>=', $duration)
            ->first();

        if (! $rule) {
            throw new InvalidArgumentException(
                "Tidak ditemukan aturan harga untuk kategori {$category->name} dengan durasi {$duration} {$unit->value}."
            );
        }

        $baseRate = $rule->base_rate;
        $subtotal = $baseRate * $duration;
        $discountAmount = 0;

        if ($rule->discount_rate > 0) {
            $discountAmount = (int) round($subtotal * $rule->discount_rate);
            $subtotal -= $discountAmount;
        }

        $surchargeRate = $isOutOfTown ? ($rule->out_of_town_surcharge_rate ?: 0.20) : 0.0;
        $surchargeAmount = (int) round($subtotal * $surchargeRate);
        $total = $subtotal + $surchargeAmount;

        return [
            'base_rate' => $baseRate,
            'duration' => $duration,
            'rental_unit' => $unit->value,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'surcharge_amount' => $surchargeAmount,
            'surcharge_rate' => $surchargeRate,
            'total' => $total,
        ];
    }

    /**
     * @return array{hours: int, hourly_rate: int, overtime_total: int}
     */
    public function calculateOvertime(
        VehicleCategory $category,
        Carbon $expectedReturn,
        Carbon $actualReturn,
    ): array {
        if ($actualReturn->lte($expectedReturn)) {
            return ['hours' => 0, 'hourly_rate' => 0, 'overtime_total' => 0];
        }

        $penalty = OvertimePenalty::where('vehicle_category_id', $category->id)->firstOrFail();
        $diffInMinutes = $expectedReturn->diffInMinutes($actualReturn);
        $hours = (int) ceil($diffInMinutes / 60);
        $overtimeTotal = $hours * $penalty->hourly_rate;

        return [
            'hours' => $hours,
            'hourly_rate' => $penalty->hourly_rate,
            'overtime_total' => $overtimeTotal,
        ];
    }
}
