<?php

use App\Enums\UserRole;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate(UserRole::Admin->value);
    Role::findOrCreate(UserRole::Cashier->value);
    Role::findOrCreate(UserRole::Customer->value);
    Role::findOrCreate(UserRole::Driver->value);
});

test('GET /login renders 200 for guests', function (): void {
    $this->get('/login')->assertOk();
});

test('GET /register renders 200 for guests', function (): void {
    $this->get('/register')->assertOk();
});

test('user without any role is redirected to catalog after fallback assignment', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect(route('catalog.index'));

    expect($user->fresh()->hasRole(UserRole::Customer->value))->toBeTrue();
});
