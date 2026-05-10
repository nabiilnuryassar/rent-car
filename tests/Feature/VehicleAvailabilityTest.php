<?php

use App\Enums\OrderStatus;
use App\Enums\VehicleStatus;
use App\Models\RentalOrder;
use App\Models\Vehicle;
use Carbon\Carbon;

test('available scope returns vehicles with no overlapping active orders', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);

    $start = Carbon::parse('2026-06-01 10:00:00');
    $end = Carbon::parse('2026-06-01 14:00:00');

    expect(Vehicle::query()->availableForPeriod($start, $end)->pluck('id'))
        ->toContain($vehicle->id);
});

test('vehicle is hidden from availability scope when an active order overlaps', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);

    RentalOrder::factory()->for($vehicle)->create([
        'status' => OrderStatus::Ongoing,
        'start_at' => Carbon::parse('2026-06-01 09:00:00'),
        'end_at' => Carbon::parse('2026-06-01 13:00:00'),
    ]);

    $requestedStart = Carbon::parse('2026-06-01 12:00:00');
    $requestedEnd = Carbon::parse('2026-06-01 15:00:00');

    expect(Vehicle::query()->availableForPeriod($requestedStart, $requestedEnd)->pluck('id'))
        ->not->toContain($vehicle->id)
        ->and($vehicle->isAvailableForPeriod($requestedStart, $requestedEnd))->toBeFalse();
});

test('vehicle stays available when order is cancelled or completed', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);

    RentalOrder::factory()->for($vehicle)->create([
        'status' => OrderStatus::Cancelled,
        'start_at' => Carbon::parse('2026-06-01 09:00:00'),
        'end_at' => Carbon::parse('2026-06-01 13:00:00'),
    ]);

    RentalOrder::factory()->for($vehicle)->create([
        'status' => OrderStatus::Completed,
        'start_at' => Carbon::parse('2026-06-01 14:00:00'),
        'end_at' => Carbon::parse('2026-06-01 18:00:00'),
    ]);

    $start = Carbon::parse('2026-06-01 10:00:00');
    $end = Carbon::parse('2026-06-01 16:00:00');

    expect($vehicle->isAvailableForPeriod($start, $end))->toBeTrue();
});

test('vehicle remains available for a period that does not overlap', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);

    RentalOrder::factory()->for($vehicle)->create([
        'status' => OrderStatus::Ongoing,
        'start_at' => Carbon::parse('2026-06-01 09:00:00'),
        'end_at' => Carbon::parse('2026-06-01 13:00:00'),
    ]);

    $start = Carbon::parse('2026-06-01 14:00:00');
    $end = Carbon::parse('2026-06-01 18:00:00');

    expect($vehicle->isAvailableForPeriod($start, $end))->toBeTrue();
});

test('vehicle with non-available status is excluded', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Maintenance]);

    $start = Carbon::parse('2026-06-01 10:00:00');
    $end = Carbon::parse('2026-06-01 14:00:00');

    expect($vehicle->isAvailableForPeriod($start, $end))->toBeFalse();
});
