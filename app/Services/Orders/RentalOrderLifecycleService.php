<?php

namespace App\Services\Orders;

use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\VehicleStatus;
use App\Models\RentalOrder;
use App\Models\User;
use App\Notifications\OrderDispatched;
use App\Services\Audit\AuditLogger;
use App\Services\Pricing\RentalPricingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalOrderLifecycleService
{
    public function __construct(private readonly RentalPricingService $pricingService) {}

    public function dispatch(RentalOrder $order): void
    {
        DB::transaction(function () use ($order): void {
            $order->update(['status' => OrderStatus::Ongoing]);
            $order->vehicle->update(['status' => VehicleStatus::InUse]);
            $order->driver->update(['status' => DriverStatus::OnDuty]);
        });

        $order->loadMissing('driver.user');
        $order->driver?->user?->notify(new OrderDispatched($order));
    }

    public function processReturn(RentalOrder $order, Carbon $actualReturnAt): array
    {
        return DB::transaction(function () use ($order, $actualReturnAt): array {
            $order = RentalOrder::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->status !== OrderStatus::Ongoing) {
                throw ValidationException::withMessages([
                    'status' => "Pengembalian kendaraan hanya dapat dilakukan pada pesanan yang sedang berjalan. Status saat ini: {$order->status->value}.",
                ]);
            }

            $order->update(['actual_return_at' => $actualReturnAt]);

            $expectedReturn = $order->end_at;
            $isLate = $actualReturnAt->gt($expectedReturn);

            if ($isLate) {
                $overtime = $this->pricingService->calculateOvertime(
                    $order->vehicle->category,
                    $expectedReturn,
                    $actualReturnAt,
                );

                $order->payments()->create([
                    'method' => PaymentMethod::BankTransfer->value,
                    'status' => PaymentStatus::Unpaid->value,
                    'amount' => $overtime['overtime_total'],
                ]);

                $order->update(['status' => OrderStatus::WaitingOvertimePayment]);

                return array_merge($overtime, ['is_late' => true]);
            }

            $this->completeOrder($order);

            return ['is_late' => false, 'hours' => 0, 'overtime_total' => 0];
        });
    }

    public function completeOrder(RentalOrder $order): void
    {
        DB::transaction(function () use ($order): void {
            $order = RentalOrder::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            $allowedStatuses = [OrderStatus::Ongoing, OrderStatus::WaitingOvertimePayment];
            if (! in_array($order->status, $allowedStatuses, true)) {
                throw ValidationException::withMessages([
                    'status' => "Pesanan tidak dapat diselesaikan pada status saat ini: {$order->status->value}.",
                ]);
            }

            $order->update(['status' => OrderStatus::Completed]);
            $order->vehicle->update(['status' => VehicleStatus::Available]);

            if ($order->driver) {
                $order->driver->update(['status' => DriverStatus::Available]);
            }

            $order->customer->increment('total_completed_orders');
        });
    }

    public function cancelOrder(RentalOrder $order, ?string $reason = null, ?User $actor = null): RentalOrder
    {
        if (in_array($order->status, [OrderStatus::Completed, OrderStatus::Cancelled], true)) {
            throw ValidationException::withMessages([
                'status' => "Pesanan dengan status {$order->status->value} tidak dapat dibatalkan.",
            ]);
        }

        return DB::transaction(function () use ($order, $reason, $actor): RentalOrder {
            $previousStatus = $order->status;

            $order->update(['status' => OrderStatus::Cancelled]);

            if ($order->vehicle && $order->vehicle->status === VehicleStatus::InUse) {
                $order->vehicle->update(['status' => VehicleStatus::Available]);
            }

            if ($order->driver && $order->driver->status === DriverStatus::OnDuty) {
                $order->driver->update(['status' => DriverStatus::Available]);
            }

            if ($actor) {
                AuditLogger::log($actor, 'order_cancelled', $order, [
                    'reason' => $reason,
                    'actor_id' => $actor->id,
                    'previous_status' => $previousStatus->value,
                ]);
            }

            return $order->refresh();
        });
    }
}
