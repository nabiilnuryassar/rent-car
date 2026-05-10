<?php

use App\Enums\RentalUnit;
use App\Models\OvertimePenalty;
use App\Models\PricingRule;
use App\Models\VehicleCategory;
use App\Services\Pricing\RentalPricingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function (): void {
    $this->service = new RentalPricingService;

    $this->category = VehicleCategory::factory()->create([
        'name' => 'Sedan',
        'class_level' => 1,
    ]);

    PricingRule::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'rental_unit' => 'day',
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 500_000,
        'discount_rate' => 0,
        'out_of_town_surcharge_rate' => 0.20,
    ]);
});

it('calculates daily rate correctly', function (): void {
    $quote = $this->service->calculateQuote($this->category, RentalUnit::Day, 3);

    expect($quote['total'])->toBe(1_500_000)
        ->and($quote['base_rate'])->toBe(500_000)
        ->and($quote['duration'])->toBe(3)
        ->and($quote['surcharge_amount'])->toBe(0);
});

it('applies out-of-town surcharge correctly', function (): void {
    $quote = $this->service->calculateQuote($this->category, RentalUnit::Day, 2, isOutOfTown: true);

    expect((float) $quote['surcharge_rate'])->toBe(0.20)
        ->and($quote['surcharge_amount'])->toBe(200_000)
        ->and($quote['total'])->toBe(1_200_000);
});

it('throws when no pricing rule is found for duration', function (): void {
    expect(fn () => $this->service->calculateQuote($this->category, RentalUnit::Day, 100))
        ->toThrow(InvalidArgumentException::class);
});

it('throws for hourly rental under 3 hours', function (): void {
    PricingRule::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'rental_unit' => 'hour',
        'min_duration' => 3,
        'max_duration' => 12,
        'base_rate' => 80_000,
    ]);

    expect(fn () => $this->service->calculateQuote($this->category, RentalUnit::Hour, 2))
        ->toThrow(InvalidArgumentException::class, 'Minimum sewa per jam adalah 3 jam.');
});

it('calculates overtime correctly', function (): void {
    OvertimePenalty::create([
        'vehicle_category_id' => $this->category->id,
        'hourly_rate' => 100_000,
    ]);

    $expected = Carbon::parse('2025-01-01 12:00:00');
    $actual = Carbon::parse('2025-01-01 14:30:00');

    $overtime = $this->service->calculateOvertime($this->category, $expected, $actual);

    expect($overtime['hours'])->toBe(3) // ceil(150/60)
        ->and($overtime['overtime_total'])->toBe(300_000);
});

it('returns zero overtime when returned on time', function (): void {
    $expected = Carbon::parse('2025-01-01 12:00:00');
    $actual = Carbon::parse('2025-01-01 11:50:00');

    $overtime = $this->service->calculateOvertime($this->category, $expected, $actual);

    expect($overtime['hours'])->toBe(0)
        ->and($overtime['overtime_total'])->toBe(0);
});
