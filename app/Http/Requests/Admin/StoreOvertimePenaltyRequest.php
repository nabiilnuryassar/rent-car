<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreOvertimePenaltyRequest extends FormRequest
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
            'vehicle_category_id' => ['required', 'exists:vehicle_categories,id'],
            'hourly_rate' => ['required', 'integer', 'min:1000'],
        ];
    }
}
