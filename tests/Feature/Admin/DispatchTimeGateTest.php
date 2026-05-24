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

function makeAdminForDispatchTimeGate(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

it('rejects dispatch if start time is outside configured dispatch window', function (): void {
    config(['rental.dispatch_window_hours' => 24]);
    $admin = makeAdminForDispatchTimeGate();
    $order = RentalOrder::factory()->create([
        'status' => OrderStatus::ReadyToDispatch,
        'start_at' => now()->addDays(3),
    ]);

    Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Paid->value,
    ]);

    $this->actingAs($admin)
        ->post("/admin/orders/{$order->order_number}/dispatch")
        ->assertSessionHasErrors('start_at');

    expect($order->fresh()->status)->toBe(OrderStatus::ReadyToDispatch);
});

it('allows dispatch within configured dispatch window', function (): void {
    config(['rental.dispatch_window_hours' => 24]);
    $admin = makeAdminForDispatchTimeGate();
    $order = RentalOrder::factory()->create([
        'status' => OrderStatus::ReadyToDispatch,
        'start_at' => now()->addHours(6),
    ]);

    Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::Paid->value,
    ]);

    $this->actingAs($admin)
        ->post("/admin/orders/{$order->order_number}/dispatch")
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::Ongoing);
});
