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
                'payment' => 'Pesanan ini belum memiliki pembayaran yang terverifikasi. Kendaraan belum dapat dikirim.',
            ]);
        }

        if ($order->status !== OrderStatus::ReadyToDispatch) {
            throw ValidationException::withMessages([
                'status' => "Pesanan tidak berada pada status yang dapat dikirim. Status saat ini: {$order->status->value}.",
            ]);
        }

        $windowHours = (int) config('rental.dispatch_window_hours', 24);
        if ($order->start_at && now()->lt($order->start_at->copy()->subHours($windowHours))) {
            throw ValidationException::withMessages([
                'start_at' => "Pesanan baru dapat dikirim {$windowHours} jam sebelum jadwal mulai.",
            ]);
        }
    }
}
