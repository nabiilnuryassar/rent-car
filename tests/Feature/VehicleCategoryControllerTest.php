<?php

use App\Models\User;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // Seed the roles required by spatie/laravel-permission
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'kasir', 'guard_name' => 'web']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('redirects unauthenticated users from vehicle categories index', function (): void {
    $response = $this->get('/admin/vehicle-categories');
    $response->assertRedirect('/login');
});

it('shows vehicle categories index to admin', function (): void {
    VehicleCategory::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get('/admin/vehicle-categories');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/vehicle-categories/index'));
});

it('can create a vehicle category', function (): void {
    $response = $this->actingAs($this->admin)->post('/admin/vehicle-categories', [
        'name' => 'MPV',
        'class_level' => 2,
        'description' => 'Multi Purpose Vehicle',
    ]);

    $response->assertRedirect('/admin/vehicle-categories');
    $this->assertDatabaseHas('vehicle_categories', ['name' => 'MPV', 'class_level' => 2]);
});

it('validates name is required', function (): void {
    $response = $this->actingAs($this->admin)->post('/admin/vehicle-categories', [
        'class_level' => 1,
    ]);

    $response->assertSessionHasErrors('name');
});

it('validates name is unique', function (): void {
    VehicleCategory::factory()->create(['name' => 'Sedan']);

    $response = $this->actingAs($this->admin)->post('/admin/vehicle-categories', [
        'name' => 'Sedan',
        'class_level' => 1,
    ]);

    $response->assertSessionHasErrors('name');
});

it('can update a vehicle category', function (): void {
    $category = VehicleCategory::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($this->admin)->put("/admin/vehicle-categories/{$category->id}", [
        'name' => 'New Name',
        'class_level' => 3,
        'is_active' => true,
    ]);

    $response->assertRedirect('/admin/vehicle-categories');
    $this->assertDatabaseHas('vehicle_categories', ['id' => $category->id, 'name' => 'New Name']);
});

it('can soft-deactivate a vehicle category via delete', function (): void {
    $category = VehicleCategory::factory()->create(['is_active' => true]);

    $this->actingAs($this->admin)->delete("/admin/vehicle-categories/{$category->id}");

    $this->assertDatabaseHas('vehicle_categories', ['id' => $category->id, 'is_active' => false]);
});

it('denies non-admin users from creating vehicle categories', function (): void {
    $customer = User::factory()->create();
    $customer->assignRole('customer');

    $response = $this->actingAs($customer)->post('/admin/vehicle-categories', [
        'name' => 'Infiltration',
        'class_level' => 1,
    ]);

    $response->assertForbidden();
});
