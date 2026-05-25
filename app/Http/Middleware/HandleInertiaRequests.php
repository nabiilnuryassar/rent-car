<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Setting;
use App\Services\Notifications\CustomerNotificationDeriver;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => Inertia::defer(function () use ($request): array {
                $user = $request->user();

                if (! $user?->hasRole(UserRole::Customer->value) || ! $user->customer) {
                    return [];
                }

                return Cache::remember(
                    "customer.notifications.{$user->customer->id}",
                    now()->addSeconds(60),
                    fn () => app(CustomerNotificationDeriver::class)->forCustomer($user->customer),
                );
            }, 'sidebar'),
            'settings' => $this->settings(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function settings(): array
    {
        try {
            return Schema::hasTable('settings')
                ? Setting::pluck('value', 'key')->toArray()
                : [];
        } catch (QueryException) {
            return [];
        }
    }
}
