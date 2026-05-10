<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreShuttleOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('customer');
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'shuttle_tariff_id' => ['required', 'exists:shuttle_tariffs,id'],
            'pickup_address' => ['required', 'string', 'max:500'],
            'destination_address' => ['required', 'string', 'max:500'],
            'scheduled_at' => ['required', 'date', 'after:now'],
        ];
    }
}
