<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\RentalOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFrom = $request->date_from ? Carbon::parse($request->date_from)->startOfDay() : now()->startOfMonth();
        $dateTo = $request->date_to ? Carbon::parse($request->date_to)->endOfDay() : now()->endOfDay();

        $completedOrders = RentalOrder::query()
            ->where('status', 'completed')
            ->whereBetween('updated_at', [$dateFrom, $dateTo])
            ->with(['customer.user', 'vehicle.category', 'payments' => fn ($q) => $q->where('status', 'paid')])
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $totalRevenue = Payment::query()
            ->where('status', 'paid')
            ->whereHasMorph('orderable', [RentalOrder::class], fn ($q) => $q->where('status', 'completed'))
            ->whereBetween('paid_at', [$dateFrom, $dateTo])
            ->sum('amount');

        return Inertia::render('admin/reports/index', [
            'orders' => $completedOrders,
            'totalRevenue' => $totalRevenue,
            'totalTransactions' => $completedOrders->total(),
            'filters' => [
                'date_from' => $dateFrom->format('Y-m-d'),
                'date_to' => $dateTo->format('Y-m-d'),
            ],
        ]);
    }
}
