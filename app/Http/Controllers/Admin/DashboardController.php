<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\Vehicle;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = today();

        $stats = [
            'orders_today' => RentalOrder::whereDate('created_at', $today)->count(),
            'pending_payment' => Payment::where('status', 'unpaid')->count(),
            'waiting_verification' => Payment::where('status', 'waiting_verification')->count(),
            'available_vehicles' => Vehicle::where('status', 'available')->count(),
            'in_use_vehicles' => Vehicle::where('status', 'in_use')->count(),
            'available_drivers' => Driver::where('status', 'available')->count(),
            'on_duty_drivers' => Driver::where('status', 'on_duty')->count(),
            'mtd_revenue' => Payment::where('status', 'verified')->whereMonth('paid_at', $today->month)->whereYear('paid_at', $today->year)->sum('amount'),
            'maintenance_alerts' => Vehicle::where('status', 'maintenance')->count(),
        ];

        $quickVerifications = Payment::query()
            ->where('status', 'waiting_verification')
            ->with(['orderable.customer.user', 'receipt'])
            ->orderBy('id', 'asc')
            ->limit(5)
            ->get();

        $recentOrders = RentalOrder::query()
            ->with(['customer.user', 'vehicle.category'])
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return Inertia::render('dashboards/admin', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'quickVerifications' => $quickVerifications,
        ]);
    }
}
