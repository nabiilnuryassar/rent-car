<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\RentalOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverSelectionController extends Controller
{
    public function show(RentalOrder $order)
    {
        $customer = auth()->user()->customer;
        abort_if($order->customer_id !== $customer->id, 403);

        // Fetch top 3 drivers ordered by experience
        $drivers = Driver::with('user')
            ->where('status', 'available')
            ->orderByDesc('experience_years')
            ->limit(3)
            ->get();

        // Return JSON for AJAX requests from the multi-step modal
        if (request()->wantsJson()) {
            return response()->json([
                'drivers' => $drivers,
                'currentDriverId' => $order->driver_id,
            ]);
        }

        return Inertia::render('customer/orders/select-driver', [
            'order' => $order,
            'drivers' => $drivers,
            'currentDriverId' => $order->driver_id,
        ]);
    }

    public function update(Request $request, RentalOrder $order)
    {
        $customer = auth()->user()->customer;
        abort_if($order->customer_id !== $customer->id, 403);

        $request->validate([
            'driver_id' => ['required', 'exists:drivers,id'],
        ]);

        $order->update([
            'driver_id' => $request->driver_id,
        ]);

        return redirect()->route('customer.orders.show', $order)
            ->with('success', 'Pengemudi berhasil dipilih.');
    }
}
