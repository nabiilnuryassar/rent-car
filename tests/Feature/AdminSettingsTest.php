<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'kasir', 'guard_name' => 'web']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('shows settings page to admin', function (): void {
    $response = $this->actingAs($this->admin)->get('/admin/settings');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/settings/index'));
});

it('saves company settings', function (): void {
    $response = $this->actingAs($this->admin)->post('/admin/settings', [
        'company_name' => 'URBAN 8 Rent',
        'company_phone' => '081234567890',
        'company_address' => 'Jl. Test No. 123',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('settings', ['key' => 'company_name', 'value' => 'URBAN 8 Rent']);
    $this->assertDatabaseHas('settings', ['key' => 'company_phone', 'value' => '081234567890']);
});

it('denies settings access to non-admin', function (): void {
    $customer = User::factory()->create();
    $customer->assignRole('customer');

    $response = $this->actingAs($customer)->get('/admin/settings');

    $response->assertForbidden();
});
