<?php

namespace App\Services\Receipts;

use App\Models\Receipt;
use Illuminate\Support\Facades\DB;

class ReceiptNumberGenerator
{
    public function generate(): string
    {
        return DB::transaction(function (): string {
            $today = now()->format('Ymd');
            $prefix = "RCV-{$today}-";

            $lastReceipt = Receipt::query()
                ->where('receipt_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $sequence = $lastReceipt
                ? ((int) substr($lastReceipt->receipt_number, -4)) + 1
                : 1;

            return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
        });
    }
}
