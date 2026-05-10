<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\RentalOrder;
use Illuminate\Validation\ValidationException;

class OrderStatusService
{
    public function assertCanDispatch(RentalOrder $order): void
    {
        $paidPayment = $order->payments()
            ->where('status', PaymentStatus::Paid->value)
            ->exists();

        if (! $paidPayment) {
            throw ValidationException::withMessages([
                'payment' => 'Order ini belum memiliki pembayaran yang terverifikasi. Tidak dapat melakukan dispatch.',
            ]);
        }

        if ($order->status !== OrderStatus::ReadyToDispatch) {
            throw ValidationException::withMessages([
                'status' => "Order tidak dalam status yang dapat di-dispatch. Status saat ini: {$order->status->value}.",
            ]);
        }
    }
}
