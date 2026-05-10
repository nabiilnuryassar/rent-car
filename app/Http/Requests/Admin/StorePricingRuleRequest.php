<?php

namespace App\Http\Requests\Admin;

use App\Enums\RentalUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePricingRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'vehicle_category_id' => ['required', 'exists:vehicle_categories,id'],
            'rental_unit' => ['required', Rule::enum(RentalUnit::class)],
            'min_duration' => ['required', 'integer', 'min:1'],
            'max_duration' => ['required', 'integer', 'gte:min_duration'],
            'base_rate' => ['required', 'integer', 'min:1000'],
            'discount_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'out_of_town_surcharge_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ];
    }
}
