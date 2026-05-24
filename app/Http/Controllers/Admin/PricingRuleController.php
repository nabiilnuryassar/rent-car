<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePricingRuleRequest;
use App\Http\Requests\Admin\UpdatePricingRuleRequest;
use App\Models\OvertimePenalty;
use App\Models\PricingRule;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PricingRuleController extends Controller
{
    public function index(\Illuminate\Http\Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $categoryId = $request->integer('category_id');
        $rentalUnit = $request->string('rental_unit')->toString();

        $pricingRules = PricingRule::query()
            ->with('category')
            ->when($categoryId, fn ($q) => $q->where('vehicle_category_id', $categoryId))
            ->when($rentalUnit, fn ($q) => $q->where('rental_unit', $rentalUnit))
            ->when($search !== '', fn ($q) => $q->whereHas(
                'category',
                fn ($cq) => $cq->where('name', 'like', "%{$search}%")
            ))
            ->orderBy('vehicle_category_id')
            ->orderBy('rental_unit')
            ->paginate(10, ['*'], 'pricing_page')
            ->withQueryString();

        $overtimePenalties = OvertimePenalty::query()
            ->with('category')
            ->when($categoryId, fn ($q) => $q->where('vehicle_category_id', $categoryId))
            ->when($search !== '', fn ($q) => $q->whereHas(
                'category',
                fn ($cq) => $cq->where('name', 'like', "%{$search}%")
            ))
            ->orderBy('vehicle_category_id')
            ->paginate(10, ['*'], 'overtime_page')
            ->withQueryString();

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/pricing/index', [
            'pricingRules' => $pricingRules,
            'overtimePenalties' => $overtimePenalties,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId ?: null,
                'rental_unit' => $rentalUnit ?: null,
            ],
        ]);
    }

    public function store(StorePricingRuleRequest $request): RedirectResponse
    {
        PricingRule::create($request->validated());

        return redirect()->route('admin.pricing-rules.index')
            ->with('success', 'Aturan harga berhasil ditambahkan.');
    }

    public function update(UpdatePricingRuleRequest $request, PricingRule $pricingRule): RedirectResponse
    {
        $pricingRule->update($request->validated());

        return redirect()->route('admin.pricing-rules.index')
            ->with('success', 'Aturan harga berhasil diperbarui.');
    }

    public function destroy(PricingRule $pricingRule): RedirectResponse
    {
        $pricingRule->delete();

        return redirect()->route('admin.pricing-rules.index')
            ->with('success', 'Aturan harga berhasil dihapus.');
    }
}
