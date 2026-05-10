<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Http\Requests\Customer\StoreRentalOrderRequest;
use App\Models\RentalOrder;
use App\Models\UpgradeOffer;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Notifications\DriverAssignedToOrder;
use App\Services\Drivers\DriverAssignmentService;
use App\Services\Orders\RentalOrderLifecycleService;
use App\Services\Pricing\RentalPricingService;
use App\Services\Vehicles\VehicleUpgradeService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly RentalPricingService $pricingService,
        private readonly DriverAssignmentService $driverAssignment,
        private readonly VehicleUpgradeService $upgradeService,
        private readonly RentalOrderLifecycleService $lifecycleService,
    ) {}

    public function index(Request $request): Response
    {
        $customer = auth()->user()->customer;
        
        $orders = RentalOrder::query()
            ->where('customer_id', $customer->id)
            ->with(['vehicle.category', 'payments'])
            ->orderByDesc('id')
            ->paginate(10);

        // Required data for booking form
        $categories = VehicleCategory::where('is_active', true)->orderBy('class_level')->get(['id', 'name', 'class_level']);
        $vehicles = Vehicle::where('status', 'available')->with('category')->orderBy('brand')->get();
        $rentalUnits = RentalUnit::cases();
        $pickupOptions = PickupOption::cases();

        return Inertia::render('customer/orders/index', [
            'orders' => $orders,
            'categories' => $categories,
            'vehicles' => $vehicles,
            'rentalUnits' => array_map(fn ($u) => ['value' => $u->value, 'label' => $u->value], $rentalUnits),
            'pickupOptions' => array_map(fn ($p) => ['value' => $p->value, 'label' => $p->value], $pickupOptions),
            'selectedVehicleId' => $request->query('vehicle_id'),
        ]);
    }

    public function store(StoreRentalOrderRequest $request): RedirectResponse
    {
        $customer = auth()->user()->customer;
        $vehicle = Vehicle::findOrFail($request->validated('vehicle_id'));
        $rentalUnit = RentalUnit::from($request->validated('rental_unit'));
        $duration = (int) $request->validated('duration');
        $isOutOfTown = (bool) $request->validated('is_out_of_town', false);

        $quote = $this->pricingService->calculateQuote(
            $vehicle->category,
            $rentalUnit,
            $duration,
            $isOutOfTown,
        );

        $startAt = Carbon::parse($request->validated('start_at'));
        $endAt = match ($rentalUnit) {
            RentalUnit::Hour => $startAt->copy()->addHours($duration),
            RentalUnit::Day => $startAt->copy()->addDays($duration),
            RentalUnit::Week => $startAt->copy()->addWeeks($duration),
            RentalUnit::Month => $startAt->copy()->addMonths($duration),
        };

        if (! $vehicle->isAvailableForPeriod($startAt, $endAt)) {
            $upgrade = $this->upgradeService->findUpgradeForPeriod($vehicle->category, $startAt, $endAt);

            if (! $upgrade) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'vehicle_id' => 'Kendaraan ini sudah dipesan dan tidak ada kendaraan kelas lebih tinggi yang tersedia.',
                ]);
            }

            $driver = $this->driverAssignment->assign(
                $customer,
                $request->validated('driver_id'),
                $startAt,
                $endAt,
            );

            $order = DB::transaction(function () use ($request, $customer, $vehicle, $upgrade, $driver, $quote, $startAt, $endAt, $rentalUnit, $duration, $isOutOfTown): RentalOrder {
                $order = RentalOrder::create([
                    'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                    'customer_id' => $customer->id,
                    'vehicle_id' => $upgrade->id,
                    'driver_id' => $driver->id,
                    'status' => OrderStatus::Draft,
                    'start_at' => $startAt,
                    'end_at' => $endAt,
                    'total_amount' => $quote['total'],
                    'rental_unit' => $rentalUnit->value,
                    'duration' => $duration,
                    'is_out_of_town' => $isOutOfTown,
                    'pickup_option' => $request->validated('pickup_option'),
                    'delivery_address' => $request->validated('delivery_address'),
                ]);

                UpgradeOffer::create([
                    'rental_order_id' => $order->id,
                    'original_vehicle_category_id' => $vehicle->category_id ?? $vehicle->vehicle_category_id,
                    'upgraded_vehicle_id' => $upgrade->id,
                    'status' => OfferStatus::Pending,
                ]);

                return $order;
            });

            $driver->user?->notify(new DriverAssignedToOrder($order));

            return redirect()->route('orders.show', $order)
                ->with('info', 'Kendaraan yang Anda pilih tidak tersedia. Kami menawarkan upgrade gratis ke kelas yang lebih tinggi dengan harga yang sama.');
        }

        $driver = $this->driverAssignment->assign(
            $customer,
            $request->validated('driver_id'),
            $startAt,
            $endAt,
        );

        $order = DB::transaction(function () use ($request, $customer, $vehicle, $driver, $quote, $startAt, $endAt, $rentalUnit, $duration, $isOutOfTown): RentalOrder {
            $order = RentalOrder::create([
                'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                'customer_id' => $customer->id,
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'status' => OrderStatus::PendingPayment,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'total_amount' => $quote['total'],
                'rental_unit' => $rentalUnit->value,
                'duration' => $duration,
                'is_out_of_town' => $isOutOfTown,
                'pickup_option' => $request->validated('pickup_option'),
                'delivery_address' => $request->validated('delivery_address'),
            ]);

            $order->payments()->create([
                'method' => 'bank_transfer',
                'status' => PaymentStatus::Unpaid->value,
                'amount' => $quote['total'],
            ]);

            return $order;
        });

        $driver->user?->notify(new DriverAssignedToOrder($order));

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order berhasil dibuat. Silakan lakukan pembayaran.');
    }

    public function show(RentalOrder $order): Response
    {
        $customer = auth()->user()->customer;
        abort_if($order->customer_id !== $customer->id, 403);

        return Inertia::render('customer/orders/show', [
            'order' => $order->load(['vehicle.category', 'driver.user', 'payments.receipt']),
        ]);
    }

    public function cancel(CancelOrderRequest $request, RentalOrder $order): RedirectResponse
    {
        $user = auth()->user();
        $customer = $user->customer;
        abort_if($order->customer_id !== $customer->id, 403);

        $cancellableStatuses = [
            OrderStatus::Draft,
            OrderStatus::PendingPayment,
            OrderStatus::WaitingVerification,
            OrderStatus::Paid,
            OrderStatus::ReadyToDispatch,
        ];

        if (! in_array($order->status, $cancellableStatuses, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'status' => 'Order ini tidak dapat dibatalkan pada status saat ini.',
            ]);
        }

        $this->lifecycleService->cancelOrder($order, $request->validated('reason'), $user);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order berhasil dibatalkan.');
    }
}
