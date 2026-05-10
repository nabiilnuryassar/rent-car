<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminCancelOrderRequest;
use App\Models\RentalOrder;
use App\Services\Audit\AuditLogger;
use App\Services\Orders\OrderStatusService;
use App\Services\Orders\RentalOrderLifecycleService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderLifecycleController extends Controller
{
    public function __construct(
        private readonly RentalOrderLifecycleService $lifecycleService,
        private readonly OrderStatusService $statusService,
    ) {}

    public function index(): Response
    {
        $orders = RentalOrder::query()
            ->with(['customer.user', 'vehicle.category', 'driver.user', 'payments'])
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => request()->only(['status']),
        ]);
    }

    public function show(RentalOrder $rentalOrder): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $rentalOrder->load(['customer.user', 'vehicle.category', 'driver.user', 'payments.receipt']),
        ]);
    }

    public function dispatch(RentalOrder $rentalOrder): RedirectResponse
    {
        $this->statusService->assertCanDispatch($rentalOrder);

        $this->lifecycleService->dispatch($rentalOrder);

        AuditLogger::log(auth()->user(), 'order.dispatched', $rentalOrder, [
            'vehicle_id' => $rentalOrder->vehicle_id,
            'driver_id' => $rentalOrder->driver_id,
        ]);

        return redirect()->route('admin.orders.show', $rentalOrder)
            ->with('success', 'Kendaraan berhasil di-dispatch.');
    }

    public function processReturn(Request $request, RentalOrder $rentalOrder): RedirectResponse
    {
        $request->validate([
            'actual_return_at' => ['required', 'date'],
        ]);

        $result = $this->lifecycleService->processReturn(
            $rentalOrder,
            Carbon::parse($request->actual_return_at),
        );

        AuditLogger::log(auth()->user(), 'order.returned', $rentalOrder, [
            'is_late' => $result['is_late'],
            'overtime_hours' => $result['hours'] ?? 0,
            'overtime_total' => $result['overtime_total'] ?? 0,
        ]);

        $message = $result['is_late']
            ? 'Kendaraan dikembalikan terlambat. Denda overtime: Rp '.number_format($result['overtime_total'])
            : 'Kendaraan dikembalikan tepat waktu. Order selesai.';

        return redirect()->route('admin.orders.show', $rentalOrder)
            ->with($result['is_late'] ? 'warning' : 'success', $message);
    }

    public function complete(RentalOrder $rentalOrder): RedirectResponse
    {
        $this->lifecycleService->completeOrder($rentalOrder);

        AuditLogger::log(auth()->user(), 'order.completed', $rentalOrder);

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order berhasil diselesaikan.');
    }

    public function cancel(AdminCancelOrderRequest $request, RentalOrder $rentalOrder): RedirectResponse
    {
        if (in_array($rentalOrder->status, [OrderStatus::Completed, OrderStatus::Cancelled], true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'status' => "Order dengan status {$rentalOrder->status->value} tidak dapat dibatalkan.",
            ]);
        }

        $this->lifecycleService->cancelOrder(
            $rentalOrder,
            $request->validated('reason'),
            auth()->user(),
        );

        return redirect()->route('admin.orders.show', $rentalOrder)
            ->with('success', 'Order berhasil dibatalkan.');
    }
}
