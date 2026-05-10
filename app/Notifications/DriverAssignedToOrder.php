<?php

namespace App\Notifications;

use App\Models\RentalOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DriverAssignedToOrder extends Notification
{
    use Queueable;

    public function __construct(public readonly RentalOrder $order) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $order = $this->order->loadMissing(['customer.user', 'vehicle']);
        $vehicle = $order->vehicle;

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer?->user?->name,
            'vehicle_label' => $vehicle
                ? trim($vehicle->brand.' '.$vehicle->model.' ('.$vehicle->plate_number.')')
                : null,
            'start_at' => $order->start_at?->toIso8601String(),
            'pickup_option' => $order->pickup_option?->value,
            'delivery_address' => $order->delivery_address,
        ];
    }
}
