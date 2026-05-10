<?php

namespace App\Models;

use App\Enums\RentalUnit;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['vehicle_category_id', 'rental_unit', 'min_duration', 'max_duration', 'base_rate', 'discount_rate', 'out_of_town_surcharge_rate'])]
class PricingRule extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'rental_unit' => RentalUnit::class,
            'base_rate' => 'integer',
            'discount_rate' => 'decimal:2',
            'out_of_town_surcharge_rate' => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category_id');
    }
}
