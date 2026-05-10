<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['order_number', 'customer_id', 'vehicle_id', 'driver_id', 'status', 'start_at', 'end_at', 'actual_return_at', 'total_amount', 'rental_unit', 'duration', 'is_out_of_town', 'pickup_option', 'delivery_address'])]
class RentalOrder extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'actual_return_at' => 'datetime',
            'total_amount' => 'integer',
            'rental_unit' => RentalUnit::class,
            'is_out_of_town' => 'boolean',
            'pickup_option' => PickupOption::class,
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'orderable');
    }

    public function upgradeOffer(): HasOne
    {
        return $this->hasOne(UpgradeOffer::class);
    }
}
