<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $customer = $user->customer;

        return Inertia::render('customer/profile/edit', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $customer?->phone ?? '',
                'address' => $customer?->address ?? '',
                'customer_type' => $customer?->customer_type?->value,
                'total_completed_orders' => (int) ($customer?->total_completed_orders ?? 0),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user->forceFill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ])->save();

        if ($user->customer) {
            $user->customer->forceFill([
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ])->save();
        }

        return back()->with('success', 'Profil diperbarui');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $request->user()->forceFill([
            'password' => Hash::make($request->input('password')),
        ])->save();

        return back()->with('success', 'Password berhasil diperbarui');
    }
}
