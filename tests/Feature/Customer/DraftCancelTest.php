<?php

use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\RentalOrder;
use App\Models\UpgradeOffer;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

it('allows customer to cancel draft order from auto-upgrade flow', function (): void {
    $user = User::factory()->create();
    $user->assignRole('customer');
    $customer = Customer::factory()->for($user)->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::Draft,
    ]);

    UpgradeOffer::create([
        'rental_order_id' => $order->id,
        'original_vehicle_category_id' => $order->vehicle->vehicle_category_id,
        'upgraded_vehicle_id' => $order->vehicle_id,
        'status' => OfferStatus::Pending,
    ]);

    $this->actingAs($user)
        ->post("/orders/{$order->order_number}/cancel", ['reason' => 'Tidak jadi sewa'])
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});
