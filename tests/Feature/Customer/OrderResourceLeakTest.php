<?php

use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Support\Arr;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn (string $role) => Role::findOrCreate($role));
});

it('does not expose driver email and payment verifier id in customer order payload', function (): void {
    $customerUser = User::factory()->create();
    $customerUser->assignRole('customer');
    $customer = Customer::factory()->for($customerUser)->create();

    $driverUser = User::factory()->create(['email' => 'driver-private@example.test']);
    $driverUser->assignRole('driver');
    $driver = Driver::factory()->for($driverUser)->create();

    $vehicleCategory = VehicleCategory::factory()->create();
    $vehicle = Vehicle::factory()->for($vehicleCategory, 'category')->create();

    $order = RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
    ]);

    $payment = Payment::factory()->create([
        'orderable_id' => $order->id,
        'orderable_type' => RentalOrder::class,
        'status' => PaymentStatus::Paid->value,
        'verified_by' => User::factory()->create()->id,
    ]);
    unset($payment);

    $response = $this->actingAs($customerUser)->get("/orders/{$order->order_number}");

    $response->assertOk();
    $page = $response->viewData('page');
    $orderPayload = data_get($page, 'props.order');

    expect(Arr::has($orderPayload, 'driver.user.email'))->toBeFalse()
        ->and(Arr::has($orderPayload, 'driver.user.password'))->toBeFalse()
        ->and(Arr::has($orderPayload, 'payments.0.verified_by'))->toBeFalse()
        ->and(data_get($orderPayload, 'driver.user.name'))->not->toBeNull()
        ->and(data_get($orderPayload, 'driver.phone'))->not->toBeNull()
        ->and(data_get($orderPayload, 'payments.0.status'))->toBe('paid');
});
