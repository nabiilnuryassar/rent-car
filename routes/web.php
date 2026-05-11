<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DashboardTrendExportController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\OrderLifecycleController;
use App\Http\Controllers\Admin\OvertimePenaltyController;
use App\Http\Controllers\Admin\PaymentVerificationController;
use App\Http\Controllers\Admin\PricingRuleController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShuttleTariffController;
use App\Http\Controllers\Admin\VehicleCategoryController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\Customer\DriverSelectionController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\RentalOrderController;
use App\Http\Controllers\Customer\ShuttleOrderController;
use App\Http\Controllers\Customer\UpgradeOfferController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Driver\DashboardController as DriverDashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReceiptController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', fn () => Inertia::render('welcome'))->name('home');
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');

Route::middleware('auth')->group(function (): void {
    Route::get('/catalog/{vehicleCategory}', [CatalogController::class, 'show'])->name('catalog.show');
    Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');

    // Admin routes
    Route::middleware('role:'.UserRole::Admin->value)
        ->prefix('admin')
        ->name('admin.')
        ->group(function (): void {
            Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
            Route::get('/dashboard/trend/export', DashboardTrendExportController::class)->name('dashboard.trend.export');

            // Master data
            Route::resource('vehicle-categories', VehicleCategoryController::class)->except(['show']);
            Route::resource('vehicles', VehicleController::class)->except(['show']);
            Route::delete('vehicles/{vehicle}/images/{index}', [VehicleController::class, 'destroyImage'])
                ->whereNumber('index')
                ->name('vehicles.images.destroy');
            Route::resource('drivers', DriverController::class)->except(['show']);

            // Pricing & tariffs
            Route::resource('pricing-rules', PricingRuleController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('overtime-penalties', OvertimePenaltyController::class)->only(['store', 'update', 'destroy']);
            Route::resource('shuttle-tariffs', ShuttleTariffController::class)->except(['show', 'edit', 'create']);

            // Payment verification
            Route::get('payments/verification', [PaymentVerificationController::class, 'index'])->name('payments.verification.index');
            Route::post('payments/{payment}/approve', [PaymentVerificationController::class, 'approve'])->name('payments.approve');
            Route::post('payments/{payment}/reject', [PaymentVerificationController::class, 'reject'])->name('payments.reject');

            // Order lifecycle
            Route::get('orders', [OrderLifecycleController::class, 'index'])->name('orders.index');
            Route::get('orders/{rentalOrder:order_number}', [OrderLifecycleController::class, 'show'])->name('orders.show');
            Route::post('orders/{rentalOrder:order_number}/dispatch', [OrderLifecycleController::class, 'dispatch'])->name('orders.dispatch');
            Route::post('orders/{rentalOrder:order_number}/return', [OrderLifecycleController::class, 'processReturn'])->name('orders.return');
            Route::post('orders/{rentalOrder:order_number}/complete', [OrderLifecycleController::class, 'complete'])->name('orders.complete');
            Route::post('orders/{rentalOrder:order_number}/cancel', [OrderLifecycleController::class, 'cancel'])->name('orders.cancel');

            // Reports
            Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

            // Settings
            Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
            Route::post('settings', [SettingController::class, 'store'])->name('settings.store');
        });

    // Cashier routes (shared with admin for cash payment)
    Route::middleware('role:'.UserRole::Admin->value.'|'.UserRole::Cashier->value)
        ->group(function (): void {
            Route::post('payments/{payment}/cash', [PaymentController::class, 'recordCash'])->name('payments.cash');
        });

    // Kasir dashboard
    Route::get('/kasir/dashboard', fn () => Inertia::render('dashboards/kasir'))
        ->middleware('role:'.UserRole::Cashier->value)
        ->name('kasir.dashboard');

    // Customer routes (No prefix)
    Route::middleware('role:'.UserRole::Customer->value)
        ->name('customer.')
        ->group(function (): void {
            Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
            Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
            Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
            Route::get('orders/{order}/select-driver', [DriverSelectionController::class, 'show'])->name('orders.select-driver');
            Route::post('orders/{order}/assign-driver', [DriverSelectionController::class, 'update'])->name('orders.assign-driver');
            Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
        });

    // Customer routes (Prefixed)
    Route::middleware('role:'.UserRole::Customer->value)
        ->prefix('customer')
        ->name('customer.')
        ->group(function (): void {

            // Route::resource('rental-orders', RentalOrderController::class)->only(['index', 'create', 'store', 'show']);
            // Route::post('rental-orders/{rentalOrder}/cancel', [RentalOrderController::class, 'cancel'])->name('rental-orders.cancel');
            Route::resource('shuttle-orders', ShuttleOrderController::class)->only(['index', 'create', 'store', 'show']);
            Route::post('shuttle-orders/{shuttleOrder}/cancel', [ShuttleOrderController::class, 'cancel'])->name('shuttle-orders.cancel');
            Route::post('upgrade-offers/{upgradeOffer}/accept', [UpgradeOfferController::class, 'accept'])->name('upgrade-offers.accept');
            Route::post('upgrade-offers/{upgradeOffer}/reject', [UpgradeOfferController::class, 'reject'])->name('upgrade-offers.reject');
            Route::post('payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof'])->name('payments.upload-proof');
        });

    // Driver dashboard
    Route::get('/driver/dashboard', DriverDashboardController::class)
        ->middleware('role:'.UserRole::Driver->value)
        ->name('driver.dashboard');

    // Shared receipt view (admin, cashier, customer)
    Route::get('receipts/{receipt:receipt_number}', [ReceiptController::class, 'show'])->name('receipts.show');
});
