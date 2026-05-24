<?php

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class StoreCashPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'kasir']);
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        $payment = $this->route('payment');
        $minimum = $payment instanceof Payment ? (int) $payment->amount : 1;

        return [
            'amount' => ['required', 'integer', "min:{$minimum}"],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.min' => 'Jumlah pembayaran tunai tidak boleh kurang dari nominal tagihan.',
        ];
    }
}
