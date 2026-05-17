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
        $tab = request('tab', 'transfer');
        $tab = in_array($tab, ['transfer', 'cash'], true) ? $tab : 'transfer';

        $payments = Payment::query()
            ->when($tab === 'transfer', fn ($q) => $q->where('status', PaymentStatus::WaitingVerification->value))
            ->when($tab === 'cash', fn ($q) => $q->where('status', PaymentStatus::Unpaid->value))
            ->when(request('method'), fn ($q, $method) => $q->where('method', $method))
            ->when(request('date_from'), fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when(request('date_to'), fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->with(['orderable.customer.user'])
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'tab' => $tab,
            'filters' => request()->only(['method', 'date_from', 'date_to', 'tab']),
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

        // Kasir doesn't have access to admin.orders.show — redirect them to verification list.
        if (auth()->user()->hasRole('kasir') && ! auth()->user()->hasRole('admin')) {
            return redirect()->route('admin.payments.verification.index')
                ->with('success', "Pembayaran disetujui. Kuitansi: {$receipt->receipt_number}");
        }

        return redirect()->route('admin.orders.show', $orderable)
            ->with('success', "Pembayaran disetujui. Kuitansi: {$receipt->receipt_number}");
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

        // Kasir doesn't have access to admin.orders.show — redirect them to verification list.
        if (auth()->user()->hasRole('kasir') && ! auth()->user()->hasRole('admin')) {
            return redirect()->route('admin.payments.verification.index')
                ->with('warning', 'Pembayaran ditolak. Pelanggan perlu mengunggah ulang bukti transfer.');
        }

        return redirect()->route('admin.orders.show', $payment->orderable)
            ->with('warning', 'Pembayaran ditolak. Pelanggan perlu mengunggah ulang bukti transfer.');
    }
}
