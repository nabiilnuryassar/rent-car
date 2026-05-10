<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShuttleTariffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'area_from' => ['required', 'string', 'max:255'],
            'area_to' => ['required', 'string', 'max:255'],
            'estimated_distance_km' => ['required', 'numeric', 'min:0.1'],
            'estimated_duration_minutes' => ['required', 'integer', 'min:1'],
            'tariff' => ['required', 'integer', 'min:10000'],
        ];
    }
}
