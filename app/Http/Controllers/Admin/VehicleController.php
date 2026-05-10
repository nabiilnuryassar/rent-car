<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVehicleRequest;
use App\Http\Requests\Admin\UpdateVehicleRequest;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(): Response
    {
        $vehicles = Vehicle::query()
            ->with('category')
            ->when(request('status'), fn ($q, $status) => $q->where('status', $status))
            ->when(request('category'), fn ($q, $cat) => $q->where('vehicle_category_id', $cat))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $categories = VehicleCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/vehicles/index', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'filters' => request()->only(['status', 'category']),
        ]);
    }

    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        $data = $this->handleImageUpload($request->validated());
        Vehicle::create($data);

        return redirect()->route('admin.vehicles.index')
            ->with('success', 'Kendaraan berhasil ditambahkan.');
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): RedirectResponse
    {
        $data = $this->handleImageUpload($request->validated(), $vehicle->images);
        $vehicle->update($data);

        return redirect()->route('admin.vehicles.index')
            ->with('success', 'Kendaraan berhasil diperbarui.');
    }

    private function handleImageUpload(array $data, ?array $existingImages = []): array
    {
        if (isset($data['images']) && is_array($data['images'])) {
            $uploadedPaths = [];
            foreach ($data['images'] as $image) {
                if ($image instanceof UploadedFile) {
                    $uploadedPaths[] = $image->store('vehicles', 'public');
                }
            }
            $data['images'] = array_merge($existingImages ?? [], $uploadedPaths);
        } else {
            unset($data['images']);
        }

        return $data;
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $vehicle->update(['status' => 'inactive']);

        return redirect()->route('admin.vehicles.index')
            ->with('success', 'Kendaraan berhasil dinonaktifkan.');
    }
}
