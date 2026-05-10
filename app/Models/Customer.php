<?php

namespace App\Models;

use App\Enums\CustomerType;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'phone', 'address', 'customer_type', 'total_completed_orders'])]
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory;

    protected $attributes = [
        'customer_type' => 'new',
        'total_completed_orders' => 0,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'customer_type' => CustomerType::class,
            'total_completed_orders' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rentalOrders(): HasMany
    {
        return $this->hasMany(RentalOrder::class);
    }

    public function shuttleOrders(): HasMany
    {
        return $this->hasMany(ShuttleOrder::class);
    }

    public function isLoyalCustomer(): bool
    {
        return $this->total_completed_orders >= 1;
    }
}
