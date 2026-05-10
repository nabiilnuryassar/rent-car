<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\RentalOrder;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    public function show(Receipt $receipt): Response
    {
        $payment = $receipt->payment()->with('orderable')->firstOrFail();

        // Authorization: only owner or staff can see receipt
        $user = auth()->user();
        abort_unless($user, 403);

        $orderable = $payment->orderable;

        if ($user->hasRole('customer')) {
            abort_if($orderable->customer_id !== $user->customer?->id, 403);
        }

        return Inertia::render('receipts/show', [
            'receipt' => $receipt,
            'payment' => $payment,
            'orderable' => $orderable->load($orderable instanceof RentalOrder
                ? ['vehicle.category', 'driver.user', 'customer.user']
                : ['tariff', 'customer.user']),
        ]);
    }
}
