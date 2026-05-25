<?php

namespace App\Services\Notifications;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RentalOrder;

class CustomerNotificationDeriver
{
    /**
     * @return array<int, array{id: string, title: string, body: string|null, created_at: string|null, read: bool, href: string|null}>
     */
    public function forCustomer(Customer $customer): array
    {
        $orders = $customer->rentalOrders()
            ->with(['payments' => fn ($query) => $query->latest()])
            ->latest()
            ->limit(10)
            ->get();

        $items = [];

        foreach ($orders as $order) {
            foreach ($order->payments as $payment) {
                $item = $this->itemForPayment($order, $payment);

                if ($item !== null) {
                    $items[] = $item;
                }
            }

            $orderItem = $this->itemForOrder($order);

            if ($orderItem !== null) {
                $items[] = $orderItem;
            }
        }

        return collect($items)
            ->sortByDesc('created_at')
            ->take(8)
            ->values()
            ->all();
    }

    /**
     * @return array{id: string, title: string, body: string|null, created_at: string|null, read: bool, href: string|null}|null
     */
    private function itemForPayment(RentalOrder $order, Payment $payment): ?array
    {
        $status = $payment->status;

        if ($status === PaymentStatus::Paid) {
            return $this->item(
                "payment-verified-{$payment->id}",
                'Pembayaran diverifikasi',
                "Pembayaran untuk pesanan {$order->order_number} sudah diverifikasi.",
                $payment->verified_at?->toIso8601String() ?? $payment->paid_at?->toIso8601String() ?? $payment->updated_at?->toIso8601String(),
                $order,
            );
        }

        if ($status === PaymentStatus::Rejected) {
            return $this->item(
                "payment-rejected-{$payment->id}",
                'Pembayaran ditolak',
                "Bukti pembayaran untuk pesanan {$order->order_number} perlu diperiksa ulang.",
                $payment->updated_at?->toIso8601String(),
                $order,
            );
        }

        if ($status === PaymentStatus::Refunded) {
            return $this->item(
                "payment-refunded-{$payment->id}",
                'Refund diproses',
                "Refund untuk pesanan {$order->order_number} sudah diproses.",
                $payment->refunded_at?->toIso8601String() ?? $payment->updated_at?->toIso8601String(),
                $order,
            );
        }

        return null;
    }

    /**
     * @return array{id: string, title: string, body: string|null, created_at: string|null, read: bool, href: string|null}|null
     */
    private function itemForOrder(RentalOrder $order): ?array
    {
        return match ($order->status) {
            OrderStatus::ReadyToDispatch => $this->item(
                "order-dispatch-ready-{$order->id}",
                'Kendaraan siap diantar',
                "Pesanan {$order->order_number} siap diproses oleh tim Urban8.",
                $order->updated_at?->toIso8601String(),
                $order,
            ),
            OrderStatus::Ongoing => $this->item(
                "order-ongoing-{$order->id}",
                'Sewa sedang berjalan',
                "Pesanan {$order->order_number} sedang aktif.",
                $order->updated_at?->toIso8601String(),
                $order,
            ),
            default => null,
        };
    }

    /**
     * @return array{id: string, title: string, body: string|null, created_at: string|null, read: bool, href: string|null}
     */
    private function item(string $id, string $title, ?string $body, ?string $createdAt, RentalOrder $order): array
    {
        return [
            'id' => $id,
            'title' => $title,
            'body' => $body,
            'created_at' => $createdAt,
            'read' => false,
            'href' => route('customer.orders.show', ['order' => $order->order_number]),
        ];
    }
}
