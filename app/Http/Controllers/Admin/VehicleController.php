<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVehicleRequest;
use App\Http\Requests\Admin\UpdateVehicleRequest;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            ->when(request('search'), function ($q, $search): void {
                $like = '%'.$search.'%';
                $q->where(function ($sub) use ($like): void {
                    $sub->where('plate_number', 'like', $like)
                        ->orWhere('brand', 'like', $like)
                        ->orWhere('model', 'like', $like);
                });
            })
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        $categories = VehicleCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/vehicles/index', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'filters' => request()->only(['status', 'category', 'search']),
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

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, string>|null  $existingImages
     * @return array<string, mixed>
     */
    private function handleImageUpload(array $data, ?array $existingImages = null): array
    {
        $existing = $existingImages ?? [];

        if (isset($data['images']) && is_array($data['images'])) {
            $uploadedPaths = [];
            foreach ($data['images'] as $image) {
                if ($image instanceof UploadedFile) {
                    $uploadedPaths[] = $image->store('vehicles', 'public');
                }
            }
            // Cap total images at 5 (matches form label "Maksimum 5 gambar").
            $data['images'] = array_values(array_slice(array_merge($existing, $uploadedPaths), 0, 5));
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

    public function destroyImage(Vehicle $vehicle, int $index): RedirectResponse
    {
        $images = $vehicle->images ?? [];

        if (! array_key_exists($index, $images)) {
            return back()->with('error', 'Gambar tidak ditemukan.');
        }

        $path = $images[$index];
        Storage::disk('public')->delete($path);

        array_splice($images, $index, 1);
        $vehicle->update(['images' => $images]);

        return back()->with('success', 'Gambar berhasil dihapus.');
    }
}
