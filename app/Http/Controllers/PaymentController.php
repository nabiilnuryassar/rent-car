<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\StoreCashPaymentRequest;
use App\Http\Requests\UploadTransferProofRequest;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Services\Audit\AuditLogger;
use App\Services\Orders\RentalOrderLifecycleService;
use App\Services\Receipts\ReceiptService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct(
        private readonly ReceiptService $receiptService,
        private readonly RentalOrderLifecycleService $lifecycleService,
    ) {}

    public function recordCash(StoreCashPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $actor = $request->user();
        abort_if(
            ! $actor || ! $actor->hasAnyRole(['admin', 'kasir']),
            403,
        );

        $orderable = $payment->orderable;

        $receipt = DB::transaction(function () use ($request, $payment, $actor, $orderable) {
            $payment->update([
                'method' => PaymentMethod::Cash->value,
                'status' => PaymentStatus::Paid->value,
                'amount' => $request->validated('amount'),
                'paid_at' => now(),
                'verified_by' => $actor->id,
                'verified_at' => now(),
            ]);

            $receipt = $this->receiptService->generateForPayment($payment);

            if ($orderable instanceof RentalOrder && $orderable->status === OrderStatus::WaitingOvertimePayment) {
                $this->lifecycleService->completeOrder($orderable);
            } else {
                $orderable->update(['status' => OrderStatus::ReadyToDispatch]);
            }

            return $receipt;
        });

        AuditLogger::log($actor, 'payment.cash_recorded', $payment, [
            'amount' => $payment->amount,
            'order_type' => class_basename($orderable),
            'order_id' => $orderable->id,
        ]);

        return redirect()->back()->with('success', "Pembayaran tunai berhasil dicatat. Kuitansi: {$receipt->receipt_number}");
    }

    public function uploadProof(UploadTransferProofRequest $request, Payment $payment): RedirectResponse
    {
        $actor = $request->user();
        abort_if(! $actor, 403);

        $orderStatus = data_get($payment->orderable, 'status');
        $blockedOrderStatuses = [OrderStatus::Cancelled, OrderStatus::Completed];
        abort_if(
            ! in_array($payment->status, [PaymentStatus::Unpaid, PaymentStatus::Rejected], true)
                || in_array($orderStatus, $blockedOrderStatuses, true),
            409,
            'Pembayaran tidak dapat menerima upload bukti pada status saat ini.',
        );

        if ($payment->transfer_proof_url) {
            Storage::disk('public')->delete($payment->transfer_proof_url);
        }

        $path = $request->file('proof')->store('transfer-proofs', 'public');

        $payment->update([
            'method' => PaymentMethod::BankTransfer->value,
            'status' => PaymentStatus::WaitingVerification->value,
            'transfer_proof_url' => $path,
            'paid_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Bukti transfer berhasil diunggah. Menunggu verifikasi.');
    }
}
