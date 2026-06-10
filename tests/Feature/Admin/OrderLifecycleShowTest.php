<?php

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\RentalOrder;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
});

test('admin order show exposes configured dispatch window', function (): void {
    config(['rental.dispatch_window_hours' => 24]);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $order = RentalOrder::factory()->create([
        'order_number' => 'ORD-DISPATCH-WINDOW',
        'status' => OrderStatus::ReadyToDispatch,
        'start_at' => now()->addDays(2),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/show')
            ->where('order.order_number', 'ORD-DISPATCH-WINDOW')
            ->where('dispatchWindowHours', 24)
        );
});
