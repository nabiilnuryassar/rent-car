<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Models\ShuttleOrder;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShuttleOrderLifecycleService
{
    public function cancelOrder(ShuttleOrder $order, ?string $reason = null, ?User $actor = null): ShuttleOrder
    {
        if (in_array($order->status, [OrderStatus::Completed, OrderStatus::Cancelled], true)) {
            throw ValidationException::withMessages([
                'status' => "Pesanan dengan status {$order->status->value} tidak dapat dibatalkan.",
            ]);
        }

        return DB::transaction(function () use ($order, $reason, $actor): ShuttleOrder {
            $previousStatus = $order->status;

            $order->update(['status' => OrderStatus::Cancelled]);

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
