<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Enums\RentalUnit;
use App\Enums\PickupOption;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $categoryId = $request->query('category');
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $minYear = $request->query('min_year');

        // Get all available vehicles with their categories and pricing rules
        $vehicles = Vehicle::query()
            ->with(['category.pricingRules'])
            ->where('status', 'available')
            ->whereHas('category', function ($query) {
                $query->where('is_active', true);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, fn ($q) => $q->where('vehicle_category_id', $categoryId))
            ->when($minYear, fn ($q) => $q->where('year', '>=', (int) $minYear))
            ->when($minPrice || $maxPrice, function ($q) use ($minPrice, $maxPrice) {
                $q->whereHas('category.pricingRules', function ($pq) use ($minPrice, $maxPrice) {
                    $pq->where('rental_unit', RentalUnit::Day->value);

                    if ($minPrice !== null && $minPrice !== '') {
                        $pq->where('base_rate', '>=', (int) $minPrice);
                    }

                    if ($maxPrice !== null && $maxPrice !== '') {
                        $pq->where('base_rate', '<=', (int) $maxPrice);
                    }
                });
            })
            ->orderBy('brand')
            ->paginate(4)
            ->withQueryString();

        $categories = VehicleCategory::query()
            ->where('is_active', true)
            ->orderBy('class_level')
            ->get(['id', 'name', 'class_level']);

        // Pre-load a short list of drivers so the booking wizard can offer
        // driver selection before the order is actually persisted.
        $drivers = Driver::with('user:id,name')
            ->where('status', 'available')
            ->orderByDesc('experience_years')
            ->limit(3)
            ->get(['id', 'user_id', 'professional_title', 'experience_years']);

        $rentalUnits = RentalUnit::cases();
        $pickupOptions = PickupOption::cases();

        return Inertia::render('catalog/index', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'drivers' => $drivers,
            'isLoyalCustomer' => auth()->user()?->customer?->isLoyalCustomer() ?? false,
            'filters' => [
                'search' => $search,
                'category' => $categoryId ? (int) $categoryId : null,
                'min_price' => $minPrice !== null && $minPrice !== '' ? (int) $minPrice : null,
                'max_price' => $maxPrice !== null && $maxPrice !== '' ? (int) $maxPrice : null,
                'min_year' => $minYear !== null && $minYear !== '' ? (int) $minYear : null,
            ],
            'rentalUnits' => array_map(fn ($u) => ['value' => $u->value, 'label' => $this->rentalUnitLabel($u)], $rentalUnits),
            'pickupOptions' => array_map(fn ($p) => ['value' => $p->value, 'label' => $this->pickupOptionLabel($p)], $pickupOptions),
        ]);
    }

    public function show(VehicleCategory $vehicleCategory): Response
    {
        $vehicles = $vehicleCategory->vehicles()
            ->with('category')
            ->whereIn('status', ['available'])
            ->orderBy('brand')
            ->get();

        $pricingRules = $vehicleCategory->pricingRules ?? collect();

        return Inertia::render('catalog/show', [
            'category' => $vehicleCategory,
            'vehicles' => $vehicles,
            'pricingRules' => $pricingRules,
        ]);
    }

    private function rentalUnitLabel(RentalUnit $unit): string
    {
        return match ($unit) {
            RentalUnit::Hour => 'Jam',
            RentalUnit::Day => 'Hari',
            RentalUnit::Week => 'Minggu',
            RentalUnit::Month => 'Bulan',
        };
    }

    private function pickupOptionLabel(PickupOption $option): string
    {
        return match ($option) {
            PickupOption::PickupAtOffice => 'Ambil di Kantor',
            PickupOption::DeliverToCustomer => 'Diantar ke Alamat Saya',
        };
    }
}
