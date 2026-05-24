<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RefundPaymentRequest;
use App\Models\Payment;
use App\Services\Payments\PaymentRefundService;
use Illuminate\Http\RedirectResponse;

class PaymentRefundController extends Controller
{
    public function __construct(private readonly PaymentRefundService $refundService) {}

    public function __invoke(RefundPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->refundService->refund(
            $payment,
            $request->validated('reason'),
            $request->user(),
        );

        return redirect()->route('admin.payments.verification.index')
            ->with('success', 'Pembayaran berhasil di-refund dan pesanan dibatalkan.');
    }
}
