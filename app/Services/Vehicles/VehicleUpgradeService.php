<?php

namespace App\Services\Vehicles;

use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Carbon\CarbonInterface;

class VehicleUpgradeService
{
    /**
     * Find a free upgrade vehicle from a higher class category when the requested vehicle is unavailable.
     */
    public function findUpgrade(VehicleCategory $requestedCategory): ?Vehicle
    {
        return Vehicle::query()
            ->where('status', 'available')
            ->whereHas('category', fn ($q) => $q->where('class_level', '>', $requestedCategory->class_level)->where('is_active', true))
            ->with('category')
            ->first();
    }

    /**
     * Find a free upgrade vehicle that is also available for the given booking period.
     */
    public function findUpgradeForPeriod(
        VehicleCategory $requestedCategory,
        CarbonInterface $start,
        CarbonInterface $end,
    ): ?Vehicle {
        return Vehicle::query()
            ->availableForPeriod($start, $end)
            ->whereHas('category', fn ($q) => $q
                ->where('class_level', '>', $requestedCategory->class_level)
                ->where('is_active', true)
            )
            ->with('category')
            ->orderBy(VehicleCategory::query()->select('class_level')->whereColumn('vehicle_categories.id', 'vehicles.vehicle_category_id'))
            ->first();
    }
}
