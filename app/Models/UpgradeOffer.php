<?php

namespace App\Models;

use App\Enums\OfferStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['rental_order_id', 'original_vehicle_category_id', 'upgraded_vehicle_id', 'status'])]
class UpgradeOffer extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OfferStatus::class,
        ];
    }

    public function rentalOrder(): BelongsTo
    {
        return $this->belongsTo(RentalOrder::class);
    }

    public function originalCategory(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'original_vehicle_category_id');
    }

    public function upgradedVehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'upgraded_vehicle_id');
    }
}
