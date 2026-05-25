<?php

use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\PricingRule;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
});

function makeAdminForVehicleOutOfRules(): User
{
    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

test('vehicle older than year cap is flagged out of rules', function (): void {
    $category = VehicleCategory::factory()->create();
    PricingRule::factory()->for($category, 'category')->create();

    Vehicle::factory()->for($category, 'category')->create([
        'year' => 1999,
        'status' => VehicleStatus::Available,
    ]);

    $this->actingAs(makeAdminForVehicleOutOfRules())
        ->get(route('admin.vehicles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/vehicles/index')
            ->where('vehicles.data.0.out_of_rules', true)
            ->where('vehicles.data.0.out_of_rules_reasons.0', 'Tahun kendaraan di bawah batas minimum 2000')
        );
});

test('vehicle category without pricing rules is flagged', function (): void {
    $category = VehicleCategory::factory()->create();

    Vehicle::factory()->for($category, 'category')->create([
        'year' => 2024,
        'status' => VehicleStatus::Available,
    ]);

    $this->actingAs(makeAdminForVehicleOutOfRules())
        ->get(route('admin.vehicles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/vehicles/index')
            ->where('vehicles.data.0.out_of_rules', true)
            ->where('vehicles.data.0.out_of_rules_reasons.0', 'Kategori kendaraan belum memiliki pricing rule')
        );
});

test('vehicle in maintenance is flagged out of rules', function (): void {
    $category = VehicleCategory::factory()->create();
    PricingRule::factory()->for($category, 'category')->create();

    Vehicle::factory()->for($category, 'category')->create([
        'year' => 2024,
        'status' => VehicleStatus::Maintenance,
    ]);

    $this->actingAs(makeAdminForVehicleOutOfRules())
        ->get(route('admin.vehicles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/vehicles/index')
            ->where('vehicles.data.0.out_of_rules', true)
            ->where('vehicles.data.0.out_of_rules_reasons.0', 'Status kendaraan tidak dapat digunakan untuk pemesanan')
        );
});

test('vehicle that complies with rules is not flagged', function (): void {
    $category = VehicleCategory::factory()->create();
    PricingRule::factory()->for($category, 'category')->create();

    Vehicle::factory()->for($category, 'category')->create([
        'year' => 2024,
        'status' => VehicleStatus::Available,
    ]);

    $this->actingAs(makeAdminForVehicleOutOfRules())
        ->get(route('admin.vehicles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/vehicles/index')
            ->where('vehicles.data.0.out_of_rules', false)
            ->where('vehicles.data.0.out_of_rules_reasons', [])
        );
});
