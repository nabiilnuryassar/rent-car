<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

function makeAdminForCashValidation(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function makeOrderPaymentForCashValidation(int $amount = 500000): Payment
{
    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $customer = Customer::factory()->for($customerUser)->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::PendingPayment,
        'total_amount' => $amount,
    ]);

    return Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Unpaid->value,
        'amount' => $amount,
    ]);
}

it('rejects cash payment amount below bill amount', function (): void {
    $admin = makeAdminForCashValidation();
    $payment = makeOrderPaymentForCashValidation(500000);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/cash", ['amount' => 1])
        ->assertSessionHasErrors('amount');

    expect($payment->fresh()->status)->toBe(PaymentStatus::Unpaid);
});

it('accepts cash payment with exact bill amount', function (): void {
    $admin = makeAdminForCashValidation();
    $payment = makeOrderPaymentForCashValidation(500000);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/cash", ['amount' => 500000])
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Paid);
});
