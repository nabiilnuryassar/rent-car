<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\RentalUnit;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\ShuttleOrder;
use App\Models\ShuttleTariff;
use App\Models\VehicleCategory;

test('a pricing rule belongs to a vehicle category and casts rental unit', function () {
    $category = VehicleCategory::factory()->create();
    $rule = PricingRule::factory()->for($category, 'category')->create([
        'rental_unit' => RentalUnit::Day,
        'base_rate' => 300000,
    ]);

    expect($rule->category->is($category))->toBeTrue()
        ->and($rule->rental_unit)->toBe(RentalUnit::Day)
        ->and($rule->base_rate)->toBe(300000);
});

test('a rental order has relationships and casts status', function () {
    $order = RentalOrder::factory()->create([
        'status' => OrderStatus::PendingPayment,
        'rental_unit' => RentalUnit::Hour,
    ]);

    expect($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->rental_unit)->toBe(RentalUnit::Hour)
        ->and($order->customer)->toBeInstanceOf(Customer::class);
});

test('a shuttle order uses a tariff and belongs to a customer', function () {
    $tariff = ShuttleTariff::factory()->create([
        'area_from' => 'A',
        'area_to' => 'B',
        'tariff' => 150000,
    ]);

    $order = ShuttleOrder::factory()->for($tariff, 'tariff')->create([
        'status' => OrderStatus::Paid,
    ]);

    expect($order->tariff->is($tariff))->toBeTrue()
        ->and($order->status)->toBe(OrderStatus::Paid)
        ->and($order->customer)->toBeInstanceOf(Customer::class);
});

test('a payment is polymorphic and links to orders', function () {
    $rentalOrder = RentalOrder::factory()->create();
    $payment = Payment::factory()->create([
        'orderable_id' => $rentalOrder->id,
        'orderable_type' => RentalOrder::class,
        'status' => PaymentStatus::Paid,
    ]);

    expect($payment->orderable->is($rentalOrder))->toBeTrue()
        ->and($payment->status)->toBe(PaymentStatus::Paid);

    expect($rentalOrder->payments->contains($payment))->toBeTrue();
});
