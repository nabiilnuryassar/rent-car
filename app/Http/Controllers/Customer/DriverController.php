<?php

namespace App\Http\Controllers\Customer;

use App\Enums\DriverStatus;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    /**
     * Browseable list of available drivers for customers to explore.
     */
    public function index(): Response
    {
        $drivers = Driver::query()
            ->with('user:id,name')
            ->withCount(['rentalOrders as completed_jobs_count' => function ($q): void {
                $q->where('status', 'completed');
            }])
            ->where('status', DriverStatus::Available->value)
            ->orderByDesc('experience_years')
            ->orderBy('id')
            ->paginate(4)
            ->withQueryString()
            ->through(fn (Driver $driver): array => [
                'id' => $driver->id,
                'name' => $driver->user?->name ?? 'Pengemudi',
                'professional_title' => $driver->professional_title ?: 'Pengemudi Profesional',
                'experience_years' => (int) $driver->experience_years,
                'completed_jobs' => (int) ($driver->completed_jobs_count ?? 0),
                'status' => $driver->status instanceof DriverStatus
                    ? $driver->status->value
                    : (string) $driver->status,
            ]);

        return Inertia::render('customer/drivers/index', [
            'drivers' => $drivers,
        ]);
    }
}
