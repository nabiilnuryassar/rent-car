<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\StoreCashPaymentRequest;
use App\Http\Requests\UploadTransferProofRequest;
use App\Models\Payment;
use App\Services\Audit\AuditLogger;
use App\Services\Receipts\ReceiptService;
use Illuminate\Http\RedirectResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly ReceiptService $receiptService) {}

    public function recordCash(StoreCashPaymentRequest $request, Payment $payment): RedirectResponse
    {
        abort_if(
            ! auth()->user()->hasAnyRole(['admin', 'kasir']),
            403,
        );

        $payment->update([
            'method' => PaymentMethod::Cash->value,
            'status' => PaymentStatus::Paid->value,
            'amount' => $request->validated('amount'),
            'paid_at' => now(),
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        $receipt = $this->receiptService->generateForPayment($payment);

        $orderable = $payment->orderable;
        $orderable->update(['status' => 'ready_to_dispatch']);

        AuditLogger::log(auth()->user(), 'payment.cash_recorded', $payment, [
            'amount' => $payment->amount,
            'order_type' => class_basename($orderable),
            'order_id' => $orderable->id,
        ]);

        return redirect()->back()->with('success', "Pembayaran tunai berhasil dicatat. Kuitansi: {$receipt->receipt_number}");
    }

    public function uploadProof(UploadTransferProofRequest $request, Payment $payment): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if($payment->orderable->customer_id !== $customer->id, 403);

        $path = $request->file('proof')->store('transfer-proofs', 'local');

        $payment->update([
            'method' => PaymentMethod::BankTransfer->value,
            'status' => PaymentStatus::WaitingVerification->value,
            'transfer_proof_url' => $path,
            'paid_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Bukti transfer berhasil diunggah. Menunggu verifikasi.');
    }
}
