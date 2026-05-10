<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOvertimePenaltyRequest;
use App\Http\Requests\Admin\UpdateOvertimePenaltyRequest;
use App\Models\OvertimePenalty;
use Illuminate\Http\RedirectResponse;

class OvertimePenaltyController extends Controller
{
    public function store(StoreOvertimePenaltyRequest $request): RedirectResponse
    {
        OvertimePenalty::create($request->validated());

        return redirect()->route('admin.pricing-rules.index')
            ->with('success', 'Denda overtime berhasil ditambahkan.');
    }

    public function update(UpdateOvertimePenaltyRequest $request, OvertimePenalty $overtimePenalty): RedirectResponse
    {
        $overtimePenalty->update($request->validated());

        return redirect()->route('admin.pricing-rules.index')
            ->with('success', 'Denda overtime berhasil diperbarui.');
    }

    public function destroy(OvertimePenalty $overtimePenalty): RedirectResponse
    {
        $overtimePenalty->delete();

        return redirect()->route('admin.pricing-rules.index')
            ->with('success', 'Denda overtime berhasil dihapus.');
    }
}
