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
                ->orderByRaw('CASE WHEN status = ? THEN 0 ELSE 1 END', [OrderStatus::Ongoing->value])
                ->orderBy('start_at')
                ->limit(5)
                ->get()
            : collect();

        $mappedAssignedOrders = $assignedOrders->map(fn (RentalOrder $order): array => [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status?->value,
            'start_at' => $order->start_at?->toIso8601String(),
            'end_at' => $order->end_at?->toIso8601String(),
            'pickup_option' => $order->pickup_option?->value,
            'delivery_address' => $order->delivery_address,
            'customer' => [
                'user' => [
                    'name' => $order->customer?->user?->name,
                ],
            ],
            'vehicle' => [
                'brand' => $order->vehicle?->brand,
                'model' => $order->vehicle?->model,
                'plate_number' => $order->vehicle?->plate_number,
                'images' => $order->vehicle?->images ?? [],
                'category' => [
                    'name' => $order->vehicle?->category?->name,
                ],
            ],
        ]);

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
            'assignedOrders' => $mappedAssignedOrders,
            'featuredOrder' => $mappedAssignedOrders->first(),
        ]);
    }
}
