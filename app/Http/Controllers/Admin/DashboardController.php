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

        // Time windows for trend calculation.
        $startOfThisWeek = $today->copy()->startOfWeek();
        $startOfLastWeek = $today->copy()->subWeek()->startOfWeek();
        $endOfLastWeek = $today->copy()->subWeek()->endOfWeek();
        $startOfThisMonth = $today->copy()->startOfMonth();
        $startOfLastMonth = $today->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $today->copy()->subMonth()->endOfMonth();
        $yesterday = $today->copy()->subDay();

        if ($isAdmin) {
            $mtdRevenue = (float) Payment::where('status', PaymentStatus::Paid->value)
                ->whereBetween('paid_at', [$startOfThisMonth, $today->copy()->endOfDay()])
                ->sum('amount');

            $lastMonthRevenue = (float) Payment::where('status', PaymentStatus::Paid->value)
                ->whereBetween('paid_at', [$startOfLastMonth, $endOfLastMonth])
                ->sum('amount');

            $maintenanceToday = Vehicle::where('status', 'maintenance')->count();
            $maintenanceYesterday = Vehicle::where('status', 'maintenance')
                ->whereDate('updated_at', '<=', $yesterday)
                ->count();

            $stats = [
                'orders_today' => RentalOrder::whereDate('created_at', $today)->count(),
                'pending_payment' => Payment::where('status', PaymentStatus::Unpaid->value)->count(),
                'waiting_verification' => Payment::where('status', PaymentStatus::WaitingVerification->value)->count(),
                'available_vehicles' => Vehicle::where('status', 'available')->count(),
                'in_use_vehicles' => Vehicle::where('status', 'in_use')->count(),
                'available_drivers' => Driver::where('status', 'available')->count(),
                'on_duty_drivers' => Driver::where('status', 'on_duty')->count(),
                'mtd_revenue' => $mtdRevenue,
                'last_month_revenue' => $lastMonthRevenue,
                'revenue_growth_pct' => $this->growthPct($mtdRevenue, $lastMonthRevenue),
                'maintenance_alerts' => $maintenanceToday,
                'maintenance_delta' => $maintenanceToday - $maintenanceYesterday,
                'orders_this_week' => RentalOrder::whereBetween('created_at', [$startOfThisWeek, $today->copy()->endOfDay()])->count(),
                'orders_last_week' => RentalOrder::whereBetween('created_at', [$startOfLastWeek, $endOfLastWeek])->count(),
            ];

            $stats['orders_growth_pct'] = $this->growthPct($stats['orders_this_week'], $stats['orders_last_week']);

            $recentOrders = RentalOrder::query()
                ->with(['customer.user', 'vehicle.category'])
                ->orderByDesc('id')
                ->limit(5)
                ->get();
        } else {
            // Cashier-focused stats: only payment-related KPIs.
            $mtdRevenue = (float) Payment::where('status', PaymentStatus::Paid->value)
                ->whereBetween('paid_at', [$startOfThisMonth, $today->copy()->endOfDay()])
                ->sum('amount');

            $lastMonthRevenue = (float) Payment::where('status', PaymentStatus::Paid->value)
                ->whereBetween('paid_at', [$startOfLastMonth, $endOfLastMonth])
                ->sum('amount');

            $stats = [
                'orders_today' => RentalOrder::whereDate('created_at', $today)->count(),
                'pending_payment' => Payment::where('status', PaymentStatus::Unpaid->value)->count(),
                'waiting_verification' => Payment::where('status', PaymentStatus::WaitingVerification->value)->count(),
                'paid_today' => Payment::where('status', PaymentStatus::Paid->value)
                    ->whereDate('paid_at', $today)
                    ->count(),
                'paid_yesterday' => Payment::where('status', PaymentStatus::Paid->value)
                    ->whereDate('paid_at', $yesterday)
                    ->count(),
                'mtd_revenue' => $mtdRevenue,
                'last_month_revenue' => $lastMonthRevenue,
                'revenue_growth_pct' => $this->growthPct($mtdRevenue, $lastMonthRevenue),
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

    /**
     * Calculate percentage growth between two periods.
     * Returns null when previous period was zero (no baseline).
     */
    private function growthPct(float|int $current, float|int $previous): ?float
    {
        if ($previous == 0) {
            return $current > 0 ? null : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
