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
                ->limit(5)
                ->get()
            : collect();

        $completedCount = $driver
            ? RentalOrder::where('driver_id', $driver->id)
                ->where('status', OrderStatus::Completed)
                ->count()
            : 0;

        $todayCount = $driver
            ? RentalOrder::where('driver_id', $driver->id)
                ->whereDate('start_at', today())
                ->whereNotIn('status', [OrderStatus::Completed, OrderStatus::Cancelled])
                ->count()
            : 0;

        return Inertia::render('driver/dashboard', [
            'driver' => $driver ? [
                'id' => $driver->id,
                'license_number' => $driver->license_number,
                'phone' => $driver->phone,
                'status' => $driver->status?->value,
                'professional_title' => $driver->professional_title,
            ] : null,
            'stats' => [
                'active_count' => $assignedOrders->count(),
                'today_count' => $todayCount,
                'completed_count' => $completedCount,
                'unread_notifications' => $notifications->count(),
            ],
            'notifications' => $notifications,
            'assignedOrders' => $assignedOrders,
        ]);
    }
}
