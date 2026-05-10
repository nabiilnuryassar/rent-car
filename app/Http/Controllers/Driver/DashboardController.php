<?php

namespace App\Http\Controllers\Driver;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\RentalOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $driver = $user->driver;

        $notifications = $user->unreadNotifications()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => class_basename($notification->type),
                'data' => $notification->data,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at' => $notification->created_at?->toIso8601String(),
            ]);

        $assignedOrders = $driver
            ? RentalOrder::query()
                ->where('driver_id', $driver->id)
                ->whereNotIn('status', [OrderStatus::Completed, OrderStatus::Cancelled])
                ->with(['customer.user', 'vehicle.category'])
                ->orderBy('start_at')
                ->limit(10)
                ->get()
            : collect();

        return Inertia::render('dashboards/driver', [
            'notifications' => $notifications,
            'assignedOrders' => $assignedOrders,
        ]);
    }
}
