<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
    Role::findOrCreate(UserRole::Cashier->value);
    Role::findOrCreate(UserRole::Customer->value);
});

function makeOfficeUserForDashboardOrdering(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('admin dashboard quick verifications are newest first', function (): void {
    $admin = makeOfficeUserForDashboardOrdering(UserRole::Admin->value);
    $customer = Customer::factory()->create();

    $oldOrder = RentalOrder::factory()->for($customer)->create(['order_number' => 'ORD-DASH-OLD']);
    $newOrder = RentalOrder::factory()->for($customer)->create(['order_number' => 'ORD-DASH-NEW']);

    $old = Payment::factory()->create([
        'orderable_id' => $oldOrder->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::WaitingVerification->value,
        'created_at' => now()->subDays(2),
    ]);

    $new = Payment::factory()->create([
        'orderable_id' => $newOrder->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::WaitingVerification->value,
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboards/admin')
            ->where('quickVerifications.0.id', $new->id)
            ->where('quickVerifications.1.id', $old->id)
        );
});

test('cashier dashboard pending cash payments are newest first', function (): void {
    $cashier = makeOfficeUserForDashboardOrdering(UserRole::Cashier->value);
    $customer = Customer::factory()->create();

    $oldOrder = RentalOrder::factory()->for($customer)->create(['order_number' => 'ORD-CASH-OLD']);
    $newOrder = RentalOrder::factory()->for($customer)->create(['order_number' => 'ORD-CASH-NEW']);

    $old = Payment::factory()->create([
        'orderable_id' => $oldOrder->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::Cash->value,
        'status' => PaymentStatus::Unpaid->value,
        'created_at' => now()->subDays(2),
    ]);

    $new = Payment::factory()->create([
        'orderable_id' => $newOrder->id,
        'orderable_type' => RentalOrder::class,
        'method' => PaymentMethod::Cash->value,
        'status' => PaymentStatus::Unpaid->value,
        'created_at' => now(),
    ]);

    $this->actingAs($cashier)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboards/admin')
            ->where('pendingCash.0.id', $new->id)
            ->where('pendingCash.1.id', $old->id)
        );
});

test('admin dashboard exposes inclusive active rentals KPI', function (): void {
    $admin = makeOfficeUserForDashboardOrdering(UserRole::Admin->value);
    $customer = Customer::factory()->create();
    $vehicle = Vehicle::factory()->create();
    $driver = Driver::factory()->create();

    foreach ([
        \App\Enums\OrderStatus::Paid,
        \App\Enums\OrderStatus::ReadyToDispatch,
        \App\Enums\OrderStatus::Ongoing,
        \App\Enums\OrderStatus::WaitingOvertimePayment,
    ] as $status) {
        RentalOrder::factory()->for($customer)->create([
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'order_number' => 'ORD-ACTIVE-'.$status->value,
            'status' => $status,
        ]);
    }

    RentalOrder::factory()->for($customer)->create([
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'order_number' => 'ORD-ACTIVE-COMPLETED',
        'status' => \App\Enums\OrderStatus::Completed,
    ]);
    RentalOrder::factory()->for($customer)->create([
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'order_number' => 'ORD-ACTIVE-CANCELLED',
        'status' => \App\Enums\OrderStatus::Cancelled,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboards/admin')
            ->where('stats.active_rentals', 4)
        );
});
