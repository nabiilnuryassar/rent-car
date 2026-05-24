<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShuttleTariffRequest;
use App\Http\Requests\Admin\UpdateShuttleTariffRequest;
use App\Models\ShuttleTariff;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShuttleTariffController extends Controller
{
    public function index(\Illuminate\Http\Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $tariffs = ShuttleTariff::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('area_from', 'like', "%{$search}%")
                        ->orWhere('area_to', 'like', "%{$search}%");
                });
            })
            ->orderBy('area_from')
            ->orderBy('area_to')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/shuttle-tariffs/index', [
            'tariffs' => $tariffs,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreShuttleTariffRequest $request): RedirectResponse
    {
        ShuttleTariff::create($request->validated());

        return redirect()->route('admin.shuttle-tariffs.index')
            ->with('success', 'Tarif shuttle berhasil ditambahkan.');
    }

    public function update(UpdateShuttleTariffRequest $request, ShuttleTariff $shuttleTariff): RedirectResponse
    {
        $shuttleTariff->update($request->validated());

        return redirect()->route('admin.shuttle-tariffs.index')
            ->with('success', 'Tarif shuttle berhasil diperbarui.');
    }

    public function destroy(ShuttleTariff $shuttleTariff): RedirectResponse
    {
        $shuttleTariff->delete();

        return redirect()->route('admin.shuttle-tariffs.index')
            ->with('success', 'Tarif shuttle berhasil dihapus.');
    }
}
