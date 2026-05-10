<?php

namespace App\Services\Pricing;

use App\Models\ShuttleTariff;
use InvalidArgumentException;

class ShuttlePricingService
{
    /**
     * @return array{tariff_id: int, area_from: string, area_to: string, distance_km: float|string, duration_minutes: int, total: int}
     */
    public function calculateQuote(int $tariffId): array
    {
        $tariff = ShuttleTariff::find($tariffId);

        if (! $tariff) {
            throw new InvalidArgumentException('Tarif shuttle tidak ditemukan.');
        }

        return [
            'tariff_id' => $tariff->id,
            'area_from' => $tariff->area_from,
            'area_to' => $tariff->area_to,
            'distance_km' => $tariff->estimated_distance_km,
            'duration_minutes' => $tariff->estimated_duration_minutes,
            'total' => $tariff->tariff,
        ];
    }
}
