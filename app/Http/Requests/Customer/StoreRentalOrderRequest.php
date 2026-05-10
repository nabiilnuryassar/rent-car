<?php

namespace App\Http\Requests\Customer;

use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRentalOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('customer');
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'rental_unit' => ['required', Rule::enum(RentalUnit::class)],
            'duration' => ['required', 'integer', 'min:1'],
            'start_at' => ['required', 'date', 'after:now'],
            'pickup_option' => ['required', Rule::enum(PickupOption::class)],
            'delivery_address' => ['required_if:pickup_option,'.PickupOption::DeliverToCustomer->value, 'nullable', 'string', 'max:500'],
            'is_out_of_town' => ['boolean'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function after(): array
    {
        return [
            function ($validator): void {
                $rentalUnit = $this->input('rental_unit');
                $duration = (int) $this->input('duration');

                if ($rentalUnit === RentalUnit::Hour->value && $duration < 3) {
                    $validator->errors()->add('duration', 'Sewa per jam minimal 3 jam.');
                }
            },
        ];
    }
}
