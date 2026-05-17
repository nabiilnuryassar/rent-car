<?php

use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Notifications\DriverAssignedToOrder;
use App\Notifications\OrderDispatched;
use App\Services\Orders\RentalOrderLifecycleService;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    collect(['admin', 'kasir', 'customer', 'driver'])->each(fn ($r) => Role::findOrCreate($r));
});

function makeCustomerUserForNotificationTest(): User
{
    $user = User::factory()->create();
    $user->assignRole('customer');
    Customer::factory()->for($user)->create(['total_completed_orders' => 0]);

    return $user;
}

function makeDriverUserForNotificationTest(): User
{
    $user = User::factory()->create();
    $user->assignRole('driver');

    return $user;
}

test('driver receives DriverAssignedToOrder notification when customer creates rental order', function () {
    Notification::fake();

    $customerUser = makeCustomerUserForNotificationTest();
    $driverUser = makeDriverUserForNotificationTest();

    $category = VehicleCategory::factory()->create(['class_level' => 1, 'is_active' => true]);
    PricingRule::factory()->create([
        'vehicle_category_id' => $category->id,
        'rental_unit' => RentalUnit::Day->value,
        'min_duration' => 1,
        'max_duration' => 30,
        'base_rate' => 200000,
    ]);

    $vehicle = Vehicle::factory()->for($category, 'category')->create(['status' => VehicleStatus::Available]);
    Driver::factory()->for($driverUser)->create(['status' => DriverStatus::Available]);

    $response = $this->actingAs($customerUser)->post('/orders', [
        'vehicle_id' => $vehicle->id,
        'rental_unit' => RentalUnit::Day->value,
        'duration' => 2,
        'start_at' => '2026-08-01 10:00:00',
        'pickup_option' => PickupOption::PickupAtOffice->value,
        'is_out_of_town' => false,
    ]);

    $response->assertRedirect();

    $order = RentalOrder::query()->where('customer_id', $customerUser->customer->id)->firstOrFail();

    Notification::assertSentTo(
        $driverUser,
        DriverAssignedToOrder::class,
        fn (DriverAssignedToOrder $notification) => $notification->order->is($order),
    );
});

test('driver receives OrderDispatched notification when admin dispatches order', function () {
    Notification::fake();

    $customerUser = makeCustomerUserForNotificationTest();
    $driverUser = makeDriverUserForNotificationTest();

    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);
    $driver = Driver::factory()->for($driverUser)->create(['status' => DriverStatus::Available]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::ReadyToDispatch,
    ]);

    app(RentalOrderLifecycleService::class)->dispatch($order);

    Notification::assertSentTo(
        $driverUser,
        OrderDispatched::class,
        fn (OrderDispatched $notification) => $notification->order->is($order),
    );
});

test('driver dashboard returns drivers unread notifications', function () {
    $driverUser = makeDriverUserForNotificationTest();
    $driver = Driver::factory()->for($driverUser)->create(['status' => DriverStatus::Available]);

    $customerUser = makeCustomerUserForNotificationTest();
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::Available]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $customerUser->customer->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $driverUser->notify(new DriverAssignedToOrder($order));

    $response = $this->actingAs($driverUser)->get('/driver/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('driver/dashboard')
        ->has('notifications', 1)
        ->where('notifications.0.type', 'DriverAssignedToOrder')
        ->where('notifications.0.data.order_id', $order->id)
        ->where('notifications.0.data.order_number', $order->order_number)
        ->has('assignedOrders', 1),
    );
});
