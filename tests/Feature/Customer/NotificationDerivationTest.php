<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Services\Notifications\CustomerNotificationDeriver;

test('deriver emits verified payment and dispatch ready notifications', function (): void {
    $customer = Customer::factory()->create();
    $order = RentalOrder::factory()->for($customer)->create([
        'order_number' => 'ORD-NOTIF-001',
        'status' => OrderStatus::ReadyToDispatch,
    ]);

    Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'status' => PaymentStatus::Paid->value,
        'paid_at' => now(),
    ]);

    $items = app(CustomerNotificationDeriver::class)->forCustomer($customer);

    expect($items)->not->toBeEmpty();
    expect(collect($items)->pluck('title')->all())->toContain('Pembayaran diverifikasi');
    expect(collect($items)->pluck('title')->all())->toContain('Kendaraan siap diantar');
});

test('deriver caps the number of items returned', function (): void {
    $customer = Customer::factory()->create();
    $vehicle = Vehicle::factory()->create();
    $driver = Driver::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        $order = RentalOrder::factory()->for($customer)->create([
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'order_number' => 'ORD-NOTIF-CAP-'.$i,
            'status' => OrderStatus::ReadyToDispatch,
        ]);

        Payment::factory()->create([
            'orderable_id' => $order->id,
            'orderable_type' => RentalOrder::class,
            'status' => PaymentStatus::Paid->value,
            'paid_at' => now(),
        ]);
    }

    $items = app(CustomerNotificationDeriver::class)->forCustomer($customer);

    expect(count($items))->toBeLessThanOrEqual(8);
});
