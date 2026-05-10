<?php

namespace App\Services\Receipts;

use App\Models\Payment;
use App\Models\Receipt;

class ReceiptService
{
    public function __construct(private readonly ReceiptNumberGenerator $generator) {}

    public function generateForPayment(Payment $payment): Receipt
    {
        if ($payment->receipt()->exists()) {
            return $payment->receipt;
        }

        $receiptNumber = $this->generator->generate();

        return $payment->receipt()->create([
            'receipt_number' => $receiptNumber,
            'issued_at' => now(),
        ]);
    }
}
