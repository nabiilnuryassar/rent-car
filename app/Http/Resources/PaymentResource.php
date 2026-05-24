<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status?->value ?? $this->status,
            'amount' => $this->amount,
            'method' => $this->method?->value ?? $this->method,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'transfer_proof_url' => $this->transfer_proof_url,
            'receipt' => $this->whenLoaded('receipt', fn (): ?array => $this->receipt ? [
                'id' => $this->receipt->id,
                'receipt_number' => $this->receipt->receipt_number,
            ] : null),
        ];
    }
}
