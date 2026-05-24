<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('shows paid payments in refund tab for admin', function () {
    foreach (UserRole::cases() as $role) {
        Role::findOrCreate($role->value);
    }

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $customerUser = User::factory()->create();
    $customerUser->assignRole(UserRole::Customer->value);
    $customer = Customer::factory()->create(['user_id' => $customerUser->id]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'order_number' => 'ORD-REFUND-UI',
        'status' => OrderStatus::ReadyToDispatch,
        'total_amount' => 500000,
    ]);

    Payment::factory()->create([
        'orderable_type' => $order->getMorphClass(),
        'orderable_id' => $order->id,
        'amount' => 500000,
        'method' => PaymentMethod::BankTransfer,
        'status' => PaymentStatus::Paid,
        'paid_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.payments.verification.index', ['tab' => 'paid']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/payments/index')
            ->where('tab', 'paid')
            ->has('payments.data', 1)
            ->where('payments.data.0.orderable.order_number', 'ORD-REFUND-UI')
        );
});
