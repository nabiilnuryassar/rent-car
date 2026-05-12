<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVehicleCategoryRequest;
use App\Http\Requests\Admin\UpdateVehicleCategoryRequest;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VehicleCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = VehicleCategory::query()
            ->withCount('vehicles')
            ->when(request('search'), function ($q, $search): void {
                $like = '%'.$search.'%';
                $q->where('name', 'like', $like);
            })
            ->when(request()->filled('active'), function ($q): void {
                $q->where('is_active', (bool) request('active'));
            })
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/vehicle-categories/index', [
            'categories' => $categories,
            'filters' => request()->only(['search', 'active']),
        ]);
    }

    public function store(StoreVehicleCategoryRequest $request): RedirectResponse
    {
        VehicleCategory::create($request->validated());

        return redirect()->route('admin.vehicle-categories.index')
            ->with('success', 'Kategori kendaraan berhasil ditambahkan.');
    }

    public function update(UpdateVehicleCategoryRequest $request, VehicleCategory $vehicleCategory): RedirectResponse
    {
        $vehicleCategory->update($request->validated());

        return redirect()->route('admin.vehicle-categories.index')
            ->with('success', 'Kategori kendaraan berhasil diperbarui.');
    }

    public function destroy(VehicleCategory $vehicleCategory): RedirectResponse
    {
        $vehicleCategory->update(['is_active' => false]);

        return redirect()->route('admin.vehicle-categories.index')
            ->with('success', 'Kategori kendaraan berhasil dinonaktifkan.');
    }
}
