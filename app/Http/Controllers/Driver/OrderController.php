<?php

namespace App\Http\Controllers\Driver;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\RentalOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $driver = $user->driver;

        if (! $driver) {
            return Inertia::render('driver/orders/index', [
                'activeOrders' => [],
                'completedOrders' => [],
            ]);
        }

        $activeOrders = RentalOrder::query()
            ->where('driver_id', $driver->id)
            ->whereNotIn('status', [OrderStatus::Completed, OrderStatus::Cancelled])
            ->with(['customer.user', 'vehicle.category'])
            ->orderBy('start_at')
            ->get();

        $completedOrders = RentalOrder::query()
            ->where('driver_id', $driver->id)
            ->whereIn('status', [OrderStatus::Completed, OrderStatus::Cancelled])
            ->with(['customer.user', 'vehicle.category'])
            ->orderByDesc('actual_return_at')
            ->limit(20)
            ->get();

        return Inertia::render('driver/orders/index', [
            'activeOrders' => $activeOrders,
            'completedOrders' => $completedOrders,
        ]);
    }

    public function show(Request $request, RentalOrder $rentalOrder): Response
    {
        $user = $request->user();
        $driver = $user->driver;

        abort_if(! $driver || $rentalOrder->driver_id !== $driver->id, 403);

        $rentalOrder->load([
            'customer.user',
            'vehicle.category',
            'driver.user',
            'payments.receipt',
        ]);

        return Inertia::render('driver/orders/show', [
            'order' => $rentalOrder,
        ]);
    }
}
