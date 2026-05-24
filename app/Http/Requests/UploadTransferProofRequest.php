<?php

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class UploadTransferProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user || ! $user->hasRole('customer')) {
            return false;
        }

        $payment = $this->route('payment');
        if (! $payment instanceof Payment) {
            return false;
        }

        return (int) data_get($payment->orderable, 'customer_id') === (int) data_get($user, 'customer.id');
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
