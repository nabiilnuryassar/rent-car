<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDriverRequest;
use App\Http\Requests\Admin\UpdateDriverRequest;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    public function index(): Response
    {
        $drivers = Driver::query()
            ->with('user')
            ->when(request('status'), fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/drivers/index', [
            'drivers' => $drivers,
            'filters' => request()->only(['status']),
        ]);
    }

    public function store(StoreDriverRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
            ]);

            $user->assignRole(UserRole::Driver->value);

            Driver::create([
                'user_id' => $user->id,
                'license_number' => $request->validated('license_number'),
                'phone' => $request->validated('phone'),
                'professional_title' => $request->validated('professional_title'),
                'experience_years' => $request->validated('experience_years'),
            ]);
        });

        return redirect()->route('admin.drivers.index')
            ->with('success', 'Pengemudi berhasil ditambahkan.');
    }

    public function update(UpdateDriverRequest $request, Driver $driver): RedirectResponse
    {
        DB::transaction(function () use ($request, $driver): void {
            $driver->user->update([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
            ]);

            $driver->update([
                'license_number' => $request->validated('license_number'),
                'phone' => $request->validated('phone'),
                'status' => $request->validated('status'),
                'professional_title' => $request->validated('professional_title'),
                'experience_years' => $request->validated('experience_years'),
            ]);
        });

        return redirect()->route('admin.drivers.index')
            ->with('success', 'Data pengemudi berhasil diperbarui.');
    }

    public function destroy(Driver $driver): RedirectResponse
    {
        $driver->update(['status' => 'inactive']);

        return redirect()->route('admin.drivers.index')
            ->with('success', 'Pengemudi berhasil dinonaktifkan.');
    }
}
