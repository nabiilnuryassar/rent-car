<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
    Storage::fake('public');
});

function makeCustomerAndOrderForUploadProof(OrderStatus $orderStatus): array
{
    $user = User::factory()->create();
    $user->assignRole('customer');
    $customer = Customer::factory()->for($user)->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'status' => $orderStatus,
    ]);

    return [$user, $order];
}

it('blocks upload proof when payment is already paid', function (): void {
    [$customerUser, $order] = makeCustomerAndOrderForUploadProof(OrderStatus::PendingPayment);
    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Paid->value,
    ]);

    $this->actingAs($customerUser)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => UploadedFile::fake()->create('proof.jpg', 100, 'image/jpeg'),
        ])
        ->assertStatus(409);
});

it('blocks upload proof when order is cancelled', function (): void {
    [$customerUser, $order] = makeCustomerAndOrderForUploadProof(OrderStatus::Cancelled);
    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Unpaid->value,
    ]);

    $this->actingAs($customerUser)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => UploadedFile::fake()->create('proof.jpg', 100, 'image/jpeg'),
        ])
        ->assertStatus(409);
});

it('removes old proof when customer re-uploads on rejected payment', function (): void {
    [$customerUser, $order] = makeCustomerAndOrderForUploadProof(OrderStatus::PendingPayment);
    Storage::disk('public')->put('transfer-proofs/old-proof.jpg', 'legacy');

    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Rejected->value,
        'transfer_proof_url' => 'transfer-proofs/old-proof.jpg',
    ]);

    $this->actingAs($customerUser)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => UploadedFile::fake()->create('new-proof.jpg', 100, 'image/jpeg'),
        ])
        ->assertRedirect();

    Storage::disk('public')->assertMissing('transfer-proofs/old-proof.jpg');
});

it('removes proof file when admin rejects a waiting verification payment', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    [$customerUser, $order] = makeCustomerAndOrderForUploadProof(OrderStatus::PendingPayment);
    unset($customerUser);

    Storage::disk('public')->put('transfer-proofs/waiting-proof.jpg', 'legacy');

    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::WaitingVerification->value,
        'transfer_proof_url' => 'transfer-proofs/waiting-proof.jpg',
    ]);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/reject", [
            'rejection_reason' => 'Bukti transfer tidak valid',
        ])
        ->assertRedirect();

    Storage::disk('public')->assertMissing('transfer-proofs/waiting-proof.jpg');
    expect($payment->fresh()->transfer_proof_url)->toBeNull()
        ->and($payment->fresh()->status)->toBe(PaymentStatus::Rejected);
});
