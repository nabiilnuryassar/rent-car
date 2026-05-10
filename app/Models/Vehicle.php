<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\VehicleStatus;
use Carbon\CarbonInterface;
use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['vehicle_category_id', 'plate_number', 'brand', 'model', 'year', 'status', 'current_location', 'images'])]
class Vehicle extends Model
{
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'available',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'status' => VehicleStatus::class,
            'images' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category_id');
    }

    public function rentalOrders(): HasMany
    {
        return $this->hasMany(RentalOrder::class);
    }

    /**
     * Scope vehicles that are bookable for the given period.
     *
     * A vehicle is bookable when its status is available AND no active rental
     * order overlaps the requested window. Orders considered active: any
     * status that is not cancelled or completed.
     */
    public function scopeAvailableForPeriod(Builder $query, CarbonInterface $start, CarbonInterface $end): Builder
    {
        $activeStatuses = collect(OrderStatus::cases())
            ->reject(fn (OrderStatus $s) => in_array($s, [OrderStatus::Cancelled, OrderStatus::Completed, OrderStatus::Draft], true))
            ->map(fn (OrderStatus $s) => $s->value)
            ->values()
            ->all();

        return $query
            ->where('status', VehicleStatus::Available)
            ->whereDoesntHave('rentalOrders', function (Builder $q) use ($start, $end, $activeStatuses): void {
                $q->whereIn('status', $activeStatuses)
                    ->where('start_at', '<', $end)
                    ->where('end_at', '>', $start);
            });
    }

    /**
     * Determine whether this vehicle is bookable for the given period.
     */
    public function isAvailableForPeriod(CarbonInterface $start, CarbonInterface $end): bool
    {
        return static::query()
            ->whereKey($this->getKey())
            ->availableForPeriod($start, $end)
            ->exists();
    }
}
