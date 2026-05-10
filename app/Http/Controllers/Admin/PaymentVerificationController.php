<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VerifyPaymentRequest;
use App\Models\Payment;
use App\Services\Audit\AuditLogger;
use App\Services\Receipts\ReceiptService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentVerificationController extends Controller
{
    public function __construct(private readonly ReceiptService $receiptService) {}

    public function index(): Response
    {
        $payments = Payment::query()
            ->where('status', PaymentStatus::WaitingVerification->value)
            ->with('orderable')
            ->orderByDesc('id')
            ->paginate(15);

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
        ]);
    }

    public function approve(Payment $payment): RedirectResponse
    {
        abort_if(! auth()->user()->hasAnyRole(['admin', 'kasir']), 403);
        abort_if($payment->status !== PaymentStatus::WaitingVerification, 409, 'Pembayaran tidak dalam status menunggu verifikasi.');

        $payment->update([
            'status' => PaymentStatus::Paid->value,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        $receipt = $this->receiptService->generateForPayment($payment);

        $orderable = $payment->orderable;
        $orderable->update(['status' => 'ready_to_dispatch']);

        AuditLogger::log(auth()->user(), 'payment.approved', $payment, [
            'receipt_number' => $receipt->receipt_number,
            'amount' => $payment->amount,
        ]);

        return redirect()->route('admin.orders.show', $payment->orderable_id)
            ->with('success', "Pembayaran disetujui. Kwitansi: {$receipt->receipt_number}");
    }

    public function reject(VerifyPaymentRequest $request, Payment $payment): RedirectResponse
    {
        abort_if(! auth()->user()->hasAnyRole(['admin', 'kasir']), 403);
        abort_if($payment->status !== PaymentStatus::WaitingVerification, 409, 'Pembayaran tidak dalam status menunggu verifikasi.');

        $payment->update([
            'status' => PaymentStatus::Rejected->value,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        AuditLogger::log(auth()->user(), 'payment.rejected', $payment, [
            'reason' => $request->validated('rejection_reason'),
            'amount' => $payment->amount,
        ]);

        return redirect()->route('admin.orders.show', $payment->orderable_id)
            ->with('warning', 'Pembayaran ditolak. Customer perlu mengunggah ulang bukti transfer.');
    }
}
