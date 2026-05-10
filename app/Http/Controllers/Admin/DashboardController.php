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

        $range = $request->string('range')->toString();
        $range = in_array($range, ['6m', '12m'], true) ? $range : '6m';

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

        $quickVerifications = Payment::query()
            ->where('status', PaymentStatus::WaitingVerification->value)
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
            'trend' => [
                'range' => $range,
                'data' => $this->trendService->monthly($range === '12m' ? 12 : 6),
            ],
        ]);
    }
}
