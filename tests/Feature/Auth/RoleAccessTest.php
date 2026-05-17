<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    collect(['admin', 'kasir', 'customer', 'driver'])
        ->each(fn (string $role): Role => Role::findOrCreate($role));
});

test('authenticated users are redirected from the shared dashboard to their role dashboard', function (string $role, string $routeName) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertRedirect(route($routeName));
})->with([
    'admin' => ['admin', 'admin.dashboard'],
    'kasir' => ['kasir', 'admin.dashboard'],
    'customer' => ['customer', 'catalog.index'],
    'driver' => ['driver', 'driver.dashboard'],
]);

test('customers cannot access the admin dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');

    $response = $this->actingAs($user)->get('/admin/dashboard');

    $response->assertForbidden();
});

test('guests are redirected to login before accessing protected dashboards', function () {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/login');
});
