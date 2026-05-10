<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Http\Requests\Customer\StoreShuttleOrderRequest;
use App\Models\ShuttleOrder;
use App\Models\ShuttleTariff;
use App\Services\Orders\ShuttleOrderLifecycleService;
use App\Services\Pricing\ShuttlePricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ShuttleOrderController extends Controller
{
    public function __construct(
        private readonly ShuttlePricingService $pricingService,
        private readonly ShuttleOrderLifecycleService $lifecycleService,
    ) {}

    public function index(): Response
    {
        $customer = auth()->user()->customer;
        $orders = ShuttleOrder::query()
            ->where('customer_id', $customer->id)
            ->with(['tariff', 'payments'])
            ->orderByDesc('id')
            ->paginate(10);

        return Inertia::render('customer/shuttle-orders/index', [
            'orders' => $orders,
        ]);
    }

    public function create(): Response
    {
        $tariffs = ShuttleTariff::orderBy('area_from')->get();

        return Inertia::render('customer/shuttle-orders/create', [
            'tariffs' => $tariffs,
        ]);
    }

    public function store(StoreShuttleOrderRequest $request): RedirectResponse
    {
        $customer = auth()->user()->customer;
        $quote = $this->pricingService->calculateQuote($request->validated('shuttle_tariff_id'));

        $order = DB::transaction(function () use ($request, $customer, $quote): ShuttleOrder {
            $tariff = ShuttleTariff::findOrFail($request->validated('shuttle_tariff_id'));

            $order = ShuttleOrder::create([
                'order_number' => 'SHT-'.strtoupper(Str::random(8)),
                'customer_id' => $customer->id,
                'shuttle_tariff_id' => $tariff->id,
                'pickup_address' => $request->validated('pickup_address'),
                'destination_address' => $request->validated('destination_address'),
                'estimated_distance_km' => $quote['distance_km'],
                'estimated_duration_minutes' => $quote['duration_minutes'],
                'scheduled_at' => $request->validated('scheduled_at'),
                'status' => OrderStatus::PendingPayment,
                'total_amount' => $quote['total'],
            ]);

            $order->payments()->create([
                'method' => 'bank_transfer',
                'status' => PaymentStatus::Unpaid->value,
                'amount' => $quote['total'],
            ]);

            return $order;
        });

        return redirect()->route('customer.shuttle-orders.show', $order)
            ->with('success', 'Order shuttle berhasil dibuat.');
    }

    public function show(ShuttleOrder $shuttleOrder): Response
    {
        $customer = auth()->user()->customer;
        abort_if($shuttleOrder->customer_id !== $customer->id, 403);

        return Inertia::render('customer/shuttle-orders/show', [
            'order' => $shuttleOrder->load(['tariff', 'payments.receipt']),
        ]);
    }

    public function cancel(CancelOrderRequest $request, ShuttleOrder $shuttleOrder): RedirectResponse
    {
        $user = auth()->user();
        $customer = $user->customer;
        abort_if($shuttleOrder->customer_id !== $customer->id, 403);

        $cancellableStatuses = [
            OrderStatus::Draft,
            OrderStatus::PendingPayment,
            OrderStatus::WaitingVerification,
            OrderStatus::Paid,
            OrderStatus::ReadyToDispatch,
        ];

        if (! in_array($shuttleOrder->status, $cancellableStatuses, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'status' => 'Order ini tidak dapat dibatalkan pada status saat ini.',
            ]);
        }

        $this->lifecycleService->cancelOrder($shuttleOrder, $request->validated('reason'), $user);

        return redirect()->route('customer.shuttle-orders.show', $shuttleOrder)
            ->with('success', 'Order shuttle berhasil dibatalkan.');
    }
}
