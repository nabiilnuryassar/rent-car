<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        $knownRoles = array_map(
            fn (UserRole $role): string => $role->value,
            UserRole::cases(),
        );

        return match (true) {
            $user->hasRole(UserRole::Admin->value) => redirect()->route('admin.dashboard'),
            $user->hasRole(UserRole::Cashier->value) => redirect()->route('admin.dashboard'),
            $user->hasRole(UserRole::Driver->value) => redirect()->route('driver.dashboard'),
            $user->hasRole(UserRole::Customer->value) => redirect()->route('catalog.index'),
            ! $user->hasAnyRole($knownRoles) => $this->assignCustomerFallback($request),
            default => redirect()->route('catalog.index'),
        };
    }

    private function assignCustomerFallback(Request $request): RedirectResponse
    {
        $user = $request->user();

        try {
            $user->assignRole(UserRole::Customer->value);
        } catch (QueryException $exception) {
            Log::warning('Customer role fallback assignment raced or failed.', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }

        Log::warning('Assigned customer fallback role to user without known roles.', [
            'user_id' => $user->id,
        ]);

        return redirect()->route('catalog.index');
    }
}
