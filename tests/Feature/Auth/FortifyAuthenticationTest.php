<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::findOrCreate('customer');
});

test('a customer can register with phone number and receives the customer role', function () {
    $response = $this->post('/register', [
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertRedirect('/dashboard');

    $user = User::query()->where('email', 'budi@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('customer'))->toBeTrue()
        ->and(Hash::check('Password123!', $user->password))->toBeTrue();

    $customer = Customer::query()->whereBelongsTo($user)->first();

    expect($customer)->not->toBeNull()
        ->and($customer->phone)->toBe('081234567890');

    $this->assertAuthenticatedAs($user);
});

test('registration ignores protected intended URLs', function () {
    $this->withSession(['url.intended' => route('admin.dashboard')]);

    $response = $this->post('/register', [
        'name' => 'Intended Customer',
        'email' => 'intended-register@example.com',
        'phone' => '081234567892',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertRedirect('/dashboard');
});

test('registration rejects duplicate email addresses', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post('/register', [
        'name' => 'Existing Customer',
        'email' => 'existing@example.com',
        'phone' => '081234567891',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('a registered user can login and is redirected to the role dashboard', function () {
    $user = User::factory()->create([
        'email' => 'customer@example.com',
        'password' => Hash::make('password'),
    ]);
    $user->assignRole('customer');

    $response = $this->post('/login', [
        'email' => 'customer@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('login ignores protected intended URLs', function () {
    $user = User::factory()->create([
        'email' => 'intended-login@example.com',
        'password' => Hash::make('password'),
    ]);
    $user->assignRole('customer');

    $this->withSession(['url.intended' => route('admin.dashboard')]);

    $response = $this->post('/login', [
        'email' => 'intended-login@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('login rejects invalid credentials', function () {
    User::factory()->create([
        'email' => 'customer@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->post('/login', [
        'email' => 'customer@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});
