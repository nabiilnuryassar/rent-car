<?php

namespace App\Http\Controllers\Driver;

use App\Enums\DriverStatus;
use App\Http\Controllers\Controller;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatusController extends Controller
{
    public function index(Request $request): Response
    {
        $driver = $request->user()->driver;

        return Inertia::render('driver/status', [
            'driver' => $driver ? [
                'id' => $driver->id,
                'status' => $driver->status?->value,
            ] : null,
            'statuses' => collect(DriverStatus::cases())
                ->map(fn ($s) => ['value' => $s->value, 'label' => match ($s) {
                    DriverStatus::Available => 'Tersedia',
                    DriverStatus::Reserved => 'Dipesan',
                    DriverStatus::OnDuty => 'Sedang Bertugas',
                    DriverStatus::OffDuty => 'Sedang Off',
                    DriverStatus::Inactive => 'Tidak Aktif',
                }])
                ->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:available,off_duty'],
        ]);

        $driver = $request->user()->driver;

        abort_if(! $driver, 404);

        // Drivers can only toggle between Available and Off Duty.
        // Reserved/OnDuty are managed by the system based on order lifecycle.
        if (in_array($driver->status?->value, ['reserved', 'on_duty'], true)) {
            return back()->with('error', 'Status tidak dapat diubah saat sedang dalam tugas.');
        }

        $driver->update(['status' => $request->string('status')->toString()]);

        AuditLogger::log($request->user(), 'driver.status_changed', $driver, [
            'new_status' => $driver->status->value,
        ]);

        return back()->with('success', 'Status berhasil diperbarui.');
    }
}
