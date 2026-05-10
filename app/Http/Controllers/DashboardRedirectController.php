<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        return match (true) {
            $user->hasRole(UserRole::Admin->value) => redirect()->route('admin.dashboard'),
            $user->hasRole(UserRole::Cashier->value) => redirect()->route('kasir.dashboard'),
            $user->hasRole(UserRole::Driver->value) => redirect()->route('driver.dashboard'),
            $user->hasRole(UserRole::Customer->value) => redirect()->route('catalog.index'),
            default => abort(403),
        };
    }
}
