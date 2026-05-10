<?php

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'kasir', 'guard_name' => 'web']);

    $this->customerUser = User::factory()->create();
    $this->customerUser->assignRole('customer');
    $this->customer = Customer::factory()->create(['user_id' => $this->customerUser->id]);

    $this->category = VehicleCategory::factory()->create(['name' => 'Sedan', 'is_active' => true, 'class_level' => 1]);
    $this->vehicle = Vehicle::factory()->create(['vehicle_category_id' => $this->category->id, 'status' => 'available']);

    PricingRule::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'rental_unit' => 'day',
        'base_rate' => 500000,
        'min_duration' => 1,
        'max_duration' => 30,
        'discount_rate' => 0,
    ]);

    $driverUser = User::factory()->create();
    $driverUser->assignRole('driver');
    $this->driver = Driver::factory()->create([
        'user_id' => $driverUser->id,
        'status' => 'available',
        'experience_years' => 5,
        'professional_title' => 'Sopir Profesional',
    ]);
});

// ── Catalog ───────────────────────────────────────────────────────────

it('shows catalog page with vehicles', function (): void {
    $response = $this->actingAs($this->customerUser)->get('/catalog');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('catalog/index')
        ->has('vehicles')
        ->has('rentalUnits')
        ->has('pickupOptions')
    );
});

it('filters catalog by search query', function (): void {
    Vehicle::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'brand' => 'Toyota',
        'model' => 'Alphard',
        'status' => 'available',
    ]);

    $response = $this->actingAs($this->customerUser)->get('/catalog?search=Alphard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('catalog/index')
        ->where('filters.search', 'Alphard')
    );
});

// ── Order Creation ────────────────────────────────────────────────────

it('creates an order and redirects to order show', function (): void {
    $response = $this->actingAs($this->customerUser)->post('/orders', [
        'vehicle_id' => $this->vehicle->id,
        'rental_unit' => 'day',
        'duration' => 3,
        'start_at' => now()->addDay()->format('Y-m-d H:i:s'),
        'pickup_option' => 'pickup_at_office',
        'is_out_of_town' => false,
    ]);

    $response->assertRedirect();
    $this->assertStringContainsString('/orders/', $response->headers->get('Location'));
    $this->assertDatabaseHas('rental_orders', [
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
    ]);
});

it('validates required fields when creating order', function (): void {
    $response = $this->actingAs($this->customerUser)->post('/orders', []);

    $response->assertSessionHasErrors(['vehicle_id', 'rental_unit', 'duration', 'start_at', 'pickup_option']);
});

it('validates minimum 3 hours for hourly rental', function (): void {
    PricingRule::factory()->create([
        'vehicle_category_id' => $this->category->id,
        'rental_unit' => 'hour',
        'base_rate' => 100000,
        'min_duration' => 1,
        'max_duration' => 24,
        'discount_rate' => 0,
    ]);

    $response = $this->actingAs($this->customerUser)->post('/orders', [
        'vehicle_id' => $this->vehicle->id,
        'rental_unit' => 'hour',
        'duration' => 1,
        'start_at' => now()->addDay()->format('Y-m-d H:i:s'),
        'pickup_option' => 'pickup_at_office',
    ]);

    $response->assertSessionHasErrors('duration');
});

// ── Order Show ────────────────────────────────────────────────────────

it('shows order detail to owner', function (): void {
    $order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
    ]);

    $response = $this->actingAs($this->customerUser)->get("/orders/{$order->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('customer/orders/show'));
});

it('denies order detail to non-owner', function (): void {
    $otherUser = User::factory()->create();
    $otherUser->assignRole('customer');
    Customer::factory()->create(['user_id' => $otherUser->id]);

    $order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
    ]);

    $response = $this->actingAs($otherUser)->get("/orders/{$order->id}");

    $response->assertForbidden();
});

// ── Driver Selection ──────────────────────────────────────────────────

it('shows driver selection page', function (): void {
    $order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
    ]);

    $response = $this->actingAs($this->customerUser)->get("/orders/{$order->id}/select-driver");

    $response->assertOk();
});

it('returns drivers as JSON for AJAX requests', function (): void {
    $order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
    ]);

    $response = $this->actingAs($this->customerUser)
        ->getJson("/orders/{$order->id}/select-driver");

    $response->assertOk();
    $response->assertJsonStructure(['drivers', 'currentDriverId']);
});

it('assigns a driver to an order', function (): void {
    $order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
    ]);

    $newDriverUser = User::factory()->create();
    $newDriverUser->assignRole('driver');
    $newDriver = Driver::factory()->create([
        'user_id' => $newDriverUser->id,
        'status' => 'available',
        'experience_years' => 10,
    ]);

    $response = $this->actingAs($this->customerUser)
        ->post("/orders/{$order->id}/assign-driver", [
            'driver_id' => $newDriver->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('rental_orders', [
        'id' => $order->id,
        'driver_id' => $newDriver->id,
    ]);
});

// ── Order Cancellation ────────────────────────────────────────────────

it('can cancel a pending order', function (): void {
    $order = RentalOrder::factory()->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $response = $this->actingAs($this->customerUser)
        ->post("/orders/{$order->id}/cancel", [
            'reason' => 'Berubah rencana',
        ]);

    $response->assertRedirect();
});

// ── Orders Index ──────────────────────────────────────────────────────

it('shows orders list for authenticated customer', function (): void {
    RentalOrder::factory()->count(3)->create([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $this->driver->id,
    ]);

    $response = $this->actingAs($this->customerUser)->get('/orders');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('customer/orders/index')
        ->has('orders.data', 3)
    );
});

it('redirects unauthenticated users from orders', function (): void {
    $response = $this->get('/orders');
    $response->assertRedirect('/login');
});
