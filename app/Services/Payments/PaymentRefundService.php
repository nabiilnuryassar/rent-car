<?php

namespace App\Services\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Orders\RentalOrderLifecycleService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PaymentRefundService
{
    public function __construct(private readonly RentalOrderLifecycleService $lifecycleService) {}

    public function refund(Payment $payment, string $reason, User $actor): Payment
    {
        if ($payment->status !== PaymentStatus::Paid) {
            throw new HttpException(409, 'Hanya pembayaran berstatus paid yang dapat di-refund.');
        }

        return DB::transaction(function () use ($payment, $reason, $actor): Payment {
            $lockedPayment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPayment->status !== PaymentStatus::Paid) {
                throw new HttpException(409, 'Hanya pembayaran berstatus paid yang dapat di-refund.');
            }

            $lockedPayment->update([
                'status' => PaymentStatus::Refunded->value,
                'refunded_at' => now(),
                'refunded_by' => $actor->id,
                'refund_reason' => $reason,
            ]);

            $orderable = $lockedPayment->orderable;
            if ($orderable instanceof RentalOrder
                && ! in_array($orderable->status, [OrderStatus::Completed, OrderStatus::Cancelled], true)) {
                $this->lifecycleService->cancelOrder($orderable, "refund: {$reason}", $actor);
            }

            AuditLogger::log($actor, 'payment.refunded', $lockedPayment, [
                'amount' => $lockedPayment->amount,
                'reason' => $reason,
            ]);

            return $lockedPayment->refresh();
        });
    }
}
