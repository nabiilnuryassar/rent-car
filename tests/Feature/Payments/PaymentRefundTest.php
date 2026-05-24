<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

function makeAdminForRefundFlow(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

it('refunds paid payment and cancels related rental order', function (): void {
    $admin = makeAdminForRefundFlow();
    $order = RentalOrder::factory()->create(['status' => OrderStatus::ReadyToDispatch]);
    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Paid->value,
    ]);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/refund", ['reason' => 'Customer batal berangkat'])
        ->assertRedirect();

    $freshPayment = $payment->fresh();
    expect($freshPayment->status)->toBe(PaymentStatus::Refunded)
        ->and($freshPayment->refunded_by)->toBe($admin->id)
        ->and($freshPayment->refund_reason)->toBe('Customer batal berangkat')
        ->and($freshPayment->refunded_at)->not->toBeNull()
        ->and($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});

it('returns conflict when trying to refund unpaid payment', function (): void {
    $admin = makeAdminForRefundFlow();
    $order = RentalOrder::factory()->create(['status' => OrderStatus::PendingPayment]);
    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Unpaid->value,
    ]);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/refund", ['reason' => 'Tidak valid'])
        ->assertStatus(409);

    expect($payment->fresh()->status)->toBe(PaymentStatus::Unpaid);
});
