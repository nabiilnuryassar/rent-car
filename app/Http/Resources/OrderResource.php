<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status?->value ?? $this->status,
            'start_at' => $this->start_at?->toIso8601String(),
            'end_at' => $this->end_at?->toIso8601String(),
            'actual_return_at' => $this->actual_return_at?->toIso8601String(),
            'total_amount' => $this->total_amount,
            'rental_unit' => $this->rental_unit?->value ?? $this->rental_unit,
            'duration' => $this->duration,
            'is_out_of_town' => $this->is_out_of_town,
            'pickup_option' => $this->pickup_option?->value ?? $this->pickup_option,
            'delivery_address' => $this->delivery_address,
            'vehicle' => $this->whenLoaded('vehicle', fn (): ?array => $this->vehicle ? [
                'id' => $this->vehicle->id,
                'brand' => $this->vehicle->brand,
                'model' => $this->vehicle->model,
                'plate_number' => $this->vehicle->plate_number,
                'category' => $this->vehicle->relationLoaded('category') && $this->vehicle->category
                    ? [
                        'id' => $this->vehicle->category->id,
                        'name' => $this->vehicle->category->name,
                    ]
                    : null,
            ] : null),
            'driver' => $this->whenLoaded('driver', fn () => $this->driver ? DriverPublicResource::make($this->driver)->resolve() : null),
            'payments' => $this->whenLoaded('payments', fn () => PaymentResource::collection($this->payments)->resolve()),
        ];
    }
}
