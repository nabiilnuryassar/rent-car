<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\UpgradeOffer;
use App\Notifications\DriverAssignedToOrder;
use App\Services\Vehicles\VehicleUpgradeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class UpgradeOfferController extends Controller
{
    public function __construct(private readonly VehicleUpgradeService $upgradeService) {}

    public function accept(UpgradeOffer $upgradeOffer): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if($upgradeOffer->rentalOrder->customer_id !== $customer->id, 403);
        abort_if($upgradeOffer->status !== OfferStatus::Pending, 409, 'Tawaran upgrade tidak lagi aktif.');

        DB::transaction(function () use ($upgradeOffer): void {
            $upgradeOffer->update(['status' => OfferStatus::Accepted]);
            $order = $upgradeOffer->rentalOrder;
            $order->update([
                'vehicle_id' => $upgradeOffer->upgraded_vehicle_id,
                'status' => OrderStatus::PendingPayment,
            ]);

            if ($order->payments()->count() === 0) {
                $order->payments()->create([
                    'method' => 'bank_transfer',
                    'status' => PaymentStatus::Unpaid->value,
                    'amount' => $order->total_amount,
                ]);
            }
        });

        $order = $upgradeOffer->rentalOrder->fresh(['driver.user', 'vehicle', 'customer.user']);
        $order?->driver?->user?->notify(new DriverAssignedToOrder($order));

        return redirect()->route('customer.orders.show', $upgradeOffer->rentalOrder)
            ->with('success', 'Upgrade kendaraan berhasil diterima. Silakan lakukan pembayaran.');
    }

    public function reject(UpgradeOffer $upgradeOffer): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if($upgradeOffer->rentalOrder->customer_id !== $customer->id, 403);
        abort_if($upgradeOffer->status !== OfferStatus::Pending, 409, 'Tawaran upgrade tidak lagi aktif.');

        DB::transaction(function () use ($upgradeOffer): void {
            $upgradeOffer->update(['status' => OfferStatus::Rejected]);
            $upgradeOffer->rentalOrder->update(['status' => OrderStatus::Cancelled]);
        });

        return redirect()->route('customer.orders.index')
            ->with('info', 'Tawaran upgrade ditolak dan pesanan dibatalkan.');
    }
}
