<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['order_number', 'customer_id', 'shuttle_tariff_id', 'pickup_address', 'destination_address', 'estimated_distance_km', 'estimated_duration_minutes', 'scheduled_at', 'status', 'total_amount'])]
class ShuttleOrder extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'scheduled_at' => 'datetime',
            'estimated_distance_km' => 'decimal:2',
            'total_amount' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function tariff(): BelongsTo
    {
        return $this->belongsTo(ShuttleTariff::class, 'shuttle_tariff_id');
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'orderable');
    }
}
