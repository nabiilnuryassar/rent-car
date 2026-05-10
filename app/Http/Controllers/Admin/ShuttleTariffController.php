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
    public function index(): Response
    {
        $tariffs = ShuttleTariff::query()
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/shuttle-tariffs/index', [
            'tariffs' => $tariffs,
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
