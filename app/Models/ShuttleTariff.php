<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['area_from', 'area_to', 'estimated_distance_km', 'estimated_duration_minutes', 'tariff'])]
class ShuttleTariff extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'estimated_distance_km' => 'decimal:2',
            'estimated_duration_minutes' => 'integer',
            'tariff' => 'integer',
        ];
    }
}
