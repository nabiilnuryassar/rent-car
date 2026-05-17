<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\Vehicle;
use App\Services\Dashboard\DashboardTrendService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardTrendService $trendService) {}

    public function __invoke(Request $request): Response
    {
        $today = today();
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');

        $range = $request->string('range')->toString();
        $range = in_array($range, ['6m', '12m'], true) ? $range : '6m';

        if ($isAdmin) {
            $stats = [
                'orders_today' => RentalOrder::whereDate('created_at', $today)->count(),
                'pending_payment' => Payment::where('status', PaymentStatus::Unpaid->value)->count(),
                'waiting_verification' => Payment::where('status', PaymentStatus::WaitingVerification->value)->count(),
                'available_vehicles' => Vehicle::where('status', 'available')->count(),
                'in_use_vehicles' => Vehicle::where('status', 'in_use')->count(),
                'available_drivers' => Driver::where('status', 'available')->count(),
                'on_duty_drivers' => Driver::where('status', 'on_duty')->count(),
                'mtd_revenue' => Payment::where('status', PaymentStatus::Paid->value)
                    ->whereMonth('paid_at', $today->month)
                    ->whereYear('paid_at', $today->year)
                    ->sum('amount'),
                'maintenance_alerts' => Vehicle::where('status', 'maintenance')->count(),
            ];

            $recentOrders = RentalOrder::query()
                ->with(['customer.user', 'vehicle.category'])
                ->orderByDesc('id')
                ->limit(5)
                ->get();
        } else {
            // Cashier-focused stats: only payment-related KPIs
            $stats = [
                'orders_today' => RentalOrder::whereDate('created_at', $today)->count(),
                'pending_payment' => Payment::where('status', PaymentStatus::Unpaid->value)->count(),
                'waiting_verification' => Payment::where('status', PaymentStatus::WaitingVerification->value)->count(),
                'paid_today' => Payment::where('status', PaymentStatus::Paid->value)
                    ->whereDate('paid_at', $today)
                    ->count(),
                'mtd_revenue' => Payment::where('status', PaymentStatus::Paid->value)
                    ->whereMonth('paid_at', $today->month)
                    ->whereYear('paid_at', $today->year)
                    ->sum('amount'),
            ];

            $recentOrders = collect();
        }

        $quickVerifications = Payment::query()
            ->where('status', PaymentStatus::WaitingVerification->value)
            ->with(['orderable.customer.user', 'receipt'])
            ->orderBy('id', 'asc')
            ->limit(5)
            ->get();

        $pendingCash = Payment::query()
            ->where('status', PaymentStatus::Unpaid->value)
            ->with(['orderable.customer.user'])
            ->orderBy('id', 'asc')
            ->limit(5)
            ->get();

        return Inertia::render('dashboards/admin', [
            'isAdmin' => $isAdmin,
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'quickVerifications' => $quickVerifications,
            'pendingCash' => $pendingCash,
            'trend' => [
                'range' => $range,
                'data' => $this->trendService->monthly($range === '12m' ? 12 : 6),
            ],
        ]);
    }
}
