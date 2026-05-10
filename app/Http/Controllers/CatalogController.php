<?php

namespace App\Http\Controllers;

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
            ->get();

        $rentalUnits = RentalUnit::cases();
        $pickupOptions = PickupOption::cases();

        return Inertia::render('catalog/index', [
            'vehicles' => $vehicles,
            'filters' => ['search' => $search],
            'rentalUnits' => array_map(fn ($u) => ['value' => $u->value, 'label' => $u->value], $rentalUnits),
            'pickupOptions' => array_map(fn ($p) => ['value' => $p->value, 'label' => $p->value], $pickupOptions),
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
}
