<?php

namespace App\Services\Drivers;

use App\Models\Driver;
use App\Models\RentalOrder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class DriverAvailabilityService
{
    /**
     * Return drivers available for a given time slot.
     *
     * @return Collection<int, Driver>
     */
    public function getAvailableDrivers(Carbon $startAt, Carbon $endAt): Collection
    {
        $busyDriverIds = RentalOrder::query()
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where(function ($query) use ($startAt, $endAt): void {
                $query->whereBetween('start_at', [$startAt, $endAt])
                    ->orWhereBetween('end_at', [$startAt, $endAt])
                    ->orWhere(function ($q) use ($startAt, $endAt): void {
                        $q->where('start_at', '<=', $startAt)->where('end_at', '>=', $endAt);
                    });
            })
            ->pluck('driver_id');

        return Driver::query()
            ->with('user')
            ->where('status', 'available')
            ->whereNotIn('id', $busyDriverIds)
            ->get();
    }
}
