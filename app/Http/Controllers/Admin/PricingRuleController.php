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
    public function index(): Response
    {
        $pricingRules = PricingRule::query()
            ->with('category')
            ->orderBy('vehicle_category_id')
            ->orderBy('rental_unit')
            ->get();

        $overtimePenalties = OvertimePenalty::with('category')->orderBy('vehicle_category_id')->get();
        $categories = VehicleCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/pricing/index', [
            'pricingRules' => $pricingRules,
            'overtimePenalties' => $overtimePenalties,
            'categories' => $categories,
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
