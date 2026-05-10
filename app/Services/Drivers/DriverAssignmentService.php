<?php

namespace App\Services\Drivers;

use App\Models\Customer;
use App\Models\Driver;
use Carbon\Carbon;
use InvalidArgumentException;

class DriverAssignmentService
{
    public function __construct(private readonly DriverAvailabilityService $availabilityService) {}

    public function assign(Customer $customer, ?int $requestedDriverId, Carbon $startAt, Carbon $endAt): Driver
    {
        $isLoyal = $customer->isLoyalCustomer();
        $availableDrivers = $this->availabilityService->getAvailableDrivers($startAt, $endAt);

        if ($availableDrivers->isEmpty()) {
            throw new InvalidArgumentException('Tidak ada pengemudi yang tersedia untuk jadwal ini.');
        }

        if ($isLoyal && $requestedDriverId) {
            $driver = $availableDrivers->find($requestedDriverId);

            if (! $driver) {
                throw new InvalidArgumentException('Pengemudi yang dipilih tidak tersedia untuk jadwal ini.');
            }

            return $driver;
        }

        if (! $isLoyal && $requestedDriverId) {
            throw new InvalidArgumentException('Pelanggan baru tidak dapat memilih pengemudi secara manual.');
        }

        return $availableDrivers->first();
    }
}
