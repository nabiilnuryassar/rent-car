# Implementation Plan: Phase 2–5 Rent Car MVP

> Covers RC-007 through RC-025. Phase 0–1 are complete.

## Codebase Baseline

**Existing:** User (Spatie roles), Customer, Driver, Vehicle, VehicleCategory models with factories. PricingRule, OvertimePenalty, RentalOrder, ShuttleOrder, ShuttleTariff, Payment, Receipt, UpgradeOffer models with migrations/factories. Enums for all statuses. Fortify auth with role-based dashboard redirect. AppLayout + AuthLayout. Wayfinder vite plugin active. Tailwind v4 CSS-first config.

**Conventions to follow:**
- `#[Fillable([...])]` attribute (not `$fillable` property)
- `casts()` method (not `$casts` property)
- Form Request classes for validation (`$request->validated()` only)
- `Route::resource()` for CRUD routes
- Wayfinder imports (`@/actions/...`) for frontend→backend wiring
- `<Form>` component from Inertia v3 for forms
- Pest `test()` syntax with `expect()` assertions
- `vendor/bin/pint --dirty --format agent` after PHP changes

---

## Phase 2: Admin Master Data

### RC-007: Vehicle Category Management

#### Backend

##### [NEW] app/Http/Controllers/Admin/VehicleCategoryController.php
Resource controller with `index`, `create`, `store`, `edit`, `update` actions.
- `index`: Return paginated categories via `Inertia::render('admin/vehicle-categories/index')` with `VehicleCategory::query()->orderByDesc('id')->paginate(15)`.
- `store`: Accept `StoreVehicleCategoryRequest`, create category, redirect back with flash.
- `update`: Accept `UpdateVehicleCategoryRequest`, update category. Toggling `is_active` serves as deactivate/activate.
- Use `Route::resource('admin/vehicle-categories', VehicleCategoryController::class)` with `role:admin` middleware.

##### [NEW] app/Http/Requests/Admin/StoreVehicleCategoryRequest.php
Rules: `name` → required|string|max:100|unique:vehicle_categories, `class_level` → required|integer|min:1, `description` → nullable|string|max:500.

##### [NEW] app/Http/Requests/Admin/UpdateVehicleCategoryRequest.php
Same as Store but `name` unique ignores current record. Add `is_active` → required|boolean.

#### Frontend

##### [NEW] resources/js/pages/admin/vehicle-categories/index.tsx
Table listing categories with name, class_level, status badge, action buttons (edit, toggle active). Paginated. Uses AppLayout.

##### [NEW] resources/js/pages/admin/vehicle-categories/create.tsx
`<Form>` component posting to store action via Wayfinder.

##### [NEW] resources/js/pages/admin/vehicle-categories/edit.tsx
`<Form>` component with method PUT to update action via Wayfinder.

#### Tests

##### [NEW] tests/Feature/Admin/VehicleCategoryControllerTest.php
- Admin can list/create/update/deactivate categories.
- Non-admin gets 403.
- Validation rejects missing name or duplicate name.
- Class level is required integer.

---

### RC-008: Vehicle Management

#### Backend

##### [NEW] app/Http/Controllers/Admin/VehicleController.php
Resource controller. `index` eager-loads `category` with `with('category')`. Filterable by status/category.

##### [NEW] app/Http/Requests/Admin/StoreVehicleRequest.php
Rules: `vehicle_category_id` → required|exists:vehicle_categories,id, `plate_number` → required|string|unique:vehicles, `brand` → required|string|max:100, `model` → required|string|max:100, `year` → required|integer|min:2000|max:current+1, `status` → required|in:available,reserved,in_use,maintenance,inactive.

##### [NEW] app/Http/Requests/Admin/UpdateVehicleRequest.php
Same but plate_number unique ignores current.

#### Frontend

##### [NEW] resources/js/pages/admin/vehicles/index.tsx
Table with plate, brand/model, category name, year, status badge. Status filter dropdown.

##### [NEW] resources/js/pages/admin/vehicles/create.tsx & edit.tsx
Forms with category select dropdown, plate number, brand, model, year, status select.

#### Tests

##### [NEW] tests/Feature/Admin/VehicleControllerTest.php
- CRUD operations by admin.
- Plate number uniqueness validation.
- Non-admin 403.
- Cannot select maintenance/inactive vehicles (scope test for later catalog use).

---

### RC-009: Driver Management

#### Backend

##### [NEW] app/Http/Controllers/Admin/DriverController.php
Resource controller. `store` also creates a User with driver role, then creates Driver record linked to it.

##### [NEW] app/Http/Requests/Admin/StoreDriverRequest.php
Rules: `name` → required|string, `email` → required|email|unique:users, `phone` → required|string, `license_number` → required|string|unique:drivers, `password` → required|min:8.

##### [NEW] app/Http/Requests/Admin/UpdateDriverRequest.php
Ignores current user for email unique and current driver for license_number unique. Add `status` → required|in:available,reserved,on_duty,off_duty,inactive.

#### Frontend

##### [NEW] resources/js/pages/admin/drivers/index.tsx
Table with name, license, phone, status badge. Filter by status.

##### [NEW] resources/js/pages/admin/drivers/create.tsx & edit.tsx

#### Tests

##### [NEW] tests/Feature/Admin/DriverControllerTest.php
- CRUD + role assignment.
- Status filter works.
- License number uniqueness.

---

### RC-010: Pricing, Overtime & Shuttle Tariff Management

#### Backend

##### [NEW] app/Http/Controllers/Admin/PricingRuleController.php
Resource controller. `index` eager-loads category.

##### [NEW] app/Http/Controllers/Admin/OvertimePenaltyController.php
Simple resource (index, store, update). One penalty per category enforced via unique constraint or validation.

##### [NEW] app/Http/Controllers/Admin/ShuttleTariffController.php
Resource controller for shuttle tariff CRUD.

##### [NEW] Form Requests (6 files)
- `StorePricingRuleRequest`: category_id exists, rental_unit in enum values, min/max duration integers, base_rate required integer.
- `UpdatePricingRuleRequest`: same with route model binding.
- `StoreOvertimePenaltyRequest`: category_id exists, hourly_rate required integer.
- `UpdateOvertimePenaltyRequest`: same.
- `StoreShuttleTariffRequest`: area_from/to required strings, distance/duration/tariff required numerics.
- `UpdateShuttleTariffRequest`: same.

#### Frontend

##### [NEW] resources/js/pages/admin/pricing/index.tsx
Tabbed view: Pricing Rules tab + Overtime Penalties tab. Each shows a table with category name and rates.

##### [NEW] resources/js/pages/admin/shuttle-tariffs/index.tsx
Table with from/to, distance, duration, tariff. Create/edit modals or pages.

#### Tests

##### [NEW] tests/Feature/Admin/PricingRuleControllerTest.php
##### [NEW] tests/Feature/Admin/ShuttleTariffControllerTest.php

---

## Phase 3: Customer Catalog, Pricing & Booking

### RC-011: Customer Vehicle Catalog

#### Backend

##### [NEW] app/Http/Controllers/CatalogController.php
Public `index` action. Query active categories with available vehicles count using `withCount(['vehicles' => fn($q) => $q->where('status', 'available')])`. Optionally a `show` per category listing available vehicles.

#### Frontend

##### [MODIFY] resources/js/pages/welcome.tsx
Add CTA linking to catalog page.

##### [NEW] resources/js/pages/catalog/index.tsx
Grid of category cards showing name, description, available count. Responsive grid (1 col mobile, 2 tablet, 3 desktop).

##### [NEW] resources/js/pages/catalog/show.tsx
Vehicle list for a category. Each card shows brand, model, year, plate, status badge.

---

### RC-012: Rental Pricing Engine

#### Backend

##### [NEW] app/Services/Pricing/RentalPricingService.php
Pure service class. Method `calculateQuote(VehicleCategory $category, RentalUnit $unit, int $duration, bool $isOutOfTown): RentalPricingQuote`.
- Reject hourly < 3.
- Find matching PricingRule by category + unit where duration between min/max.
- Calculate `subtotal = base_rate * duration`.
- Apply discount_rate if set.
- Apply 20% surcharge if out of town.
- Return breakdown DTO.

##### [NEW] app/Services/Pricing/OvertimeCalculator.php
Method `calculate(VehicleCategory $category, Carbon $expectedReturn, Carbon $actualReturn): OvertimeResult`.
- Diff in hours, rounded up via `ceil()`.
- Multiply by OvertimePenalty hourly_rate.

##### [NEW] app/Data/RentalPricingQuote.php
Simple DTO: `baseRate`, `duration`, `subtotal`, `discountAmount`, `surchargeAmount`, `surchargeRate`, `total`.

#### Tests

##### [NEW] tests/Unit/Pricing/RentalPricingServiceTest.php
- Hourly < 3 throws exception.
- Daily calculation correct.
- Out-of-town adds 20%.
- Discount rate applied.
- Overtime rounds up per hour.

---

### RC-013: Customer Rental Booking Flow

#### Backend

##### [NEW] app/Http/Controllers/Customer/RentalOrderController.php
- `create`: Show booking form with available vehicles, categories.
- `store`: Validate, calculate price via RentalPricingService, create order with PendingPayment status, create Payment with Unpaid status.
- `show`: Show order detail with payment status.

##### [NEW] app/Http/Requests/Customer/StoreRentalOrderRequest.php
Rules: vehicle_id exists + available, rental_unit in enum, duration integer (min:3 when hourly), start_at required date future, pickup_option in enum, delivery_address required_if pickup_option is deliver_to_customer, is_out_of_town boolean.

#### Frontend

##### [NEW] resources/js/pages/customer/rental-orders/create.tsx
Multi-step or single-page form: select vehicle → schedule → options → price preview → confirm.

##### [NEW] resources/js/pages/customer/rental-orders/show.tsx
Order summary with status badge, price breakdown, payment status.

---

### RC-014: Driver Selection & Auto Assignment

#### Backend

##### [NEW] app/Services/Drivers/DriverAvailabilityService.php
Query drivers with status Available and no conflicting rental orders in the requested time range.

##### [NEW] app/Services/Drivers/DriverAssignmentService.php
- If customer `total_completed_orders >= 1` → loyal → allow manual selection from available list.
- Else → auto-assign first available driver.

##### [MODIFY] app/Http/Controllers/Customer/RentalOrderController.php
Add driver_id to store logic. Conditionally validate driver_id (required for loyal, forbidden for new).

##### [MODIFY] app/Http/Requests/Customer/StoreRentalOrderRequest.php
Add conditional rule: `driver_id` → `Rule::when(customer is loyal, ['required', 'exists:drivers,id'])`.

#### Tests

##### [NEW] tests/Feature/RentalOrders/DriverAssignmentTest.php

---

### RC-015: Free Upgrade Offer Flow

#### Backend

##### [NEW] app/Services/Vehicles/VehicleUpgradeService.php
When requested vehicle/category unavailable, find vehicle in higher class_level category that is available.

##### [NEW] app/Http/Controllers/Customer/UpgradeOfferController.php
`accept` and `reject` actions. Accept swaps vehicle on order, reject cancels the offer.

#### Tests

##### [NEW] tests/Feature/RentalOrders/UpgradeOfferTest.php

---

### RC-016: Shuttle Booking Flow

#### Backend

##### [NEW] app/Http/Controllers/Customer/ShuttleOrderController.php
- `create`: Show form with shuttle tariff list.
- `store`: Match tariff, create ShuttleOrder + Payment.

##### [NEW] app/Http/Requests/Customer/StoreShuttleOrderRequest.php
Rules: shuttle_tariff_id exists, pickup_address required, destination_address required, scheduled_at required date future.

##### [NEW] app/Services/Pricing/ShuttlePricingService.php
Lookup tariff by ID, return price.

#### Tests

##### [NEW] tests/Feature/Customer/ShuttleOrderControllerTest.php

---

## Phase 4: Payment, Receipt, Dispatch & Return

### RC-017: Payment Creation & Transfer Proof Upload

#### Backend

##### [NEW] app/Http/Controllers/PaymentController.php
- `recordCash`: Admin/cashier only. Sets payment to Paid, paid_at = now.
- `uploadProof`: Customer uploads file. Sets status to WaitingVerification.

##### [NEW] app/Http/Requests/StoreCashPaymentRequest.php
Rules: payment_id exists, amount required integer.

##### [NEW] app/Http/Requests/UploadTransferProofRequest.php
Rules: `proof` → required|file|mimes:jpg,jpeg,png,pdf|max:5120.

##### [MODIFY] config/filesystems.php
Add `transfer-proofs` disk pointing to `storage/app/transfer-proofs`.

#### Tests

##### [NEW] tests/Feature/Payment/PaymentControllerTest.php
- Cash payment by cashier succeeds.
- Customer cannot record cash.
- Upload validates MIME and size.
- Status transitions correctly.

---

### RC-018: Transfer Verification

#### Backend

##### [NEW] app/Http/Controllers/Admin/PaymentVerificationController.php
- `index`: List payments with WaitingVerification status.
- `approve`: Set status Paid, verified_by, verified_at.
- `reject`: Set status Rejected.

##### [NEW] app/Http/Requests/Admin/VerifyPaymentRequest.php
Rules: `action` → required|in:approve,reject, `rejection_reason` → required_if:action,reject.

#### Tests

##### [NEW] tests/Feature/Admin/PaymentVerificationTest.php

---

### RC-019: Receipt Numbering & View

#### Backend

##### [NEW] app/Services/Receipts/ReceiptNumberGenerator.php
Format: `RCV-{YYYYMMDD}-{sequence}`. Use DB::transaction with lock to ensure uniqueness.

##### [NEW] app/Services/Receipts/ReceiptService.php
Called after payment marked Paid. Creates Receipt record with generated number.

##### [NEW] app/Http/Controllers/ReceiptController.php
`show`: Display receipt detail. Printable page via `@media print` CSS.

#### Frontend

##### [NEW] resources/js/pages/receipts/show.tsx
Receipt layout with print button. Shows transaction number, customer info, service detail, price breakdown, payment method, date.

#### Tests

##### [NEW] tests/Feature/Receipt/ReceiptServiceTest.php

---

### RC-020: Payment Locking & Dispatch Guard

#### Backend

##### [NEW] app/Policies/RentalOrderPolicy.php
`dispatch` method: returns true only if order has a paid payment.

##### [NEW] app/Services/Orders/OrderStatusService.php
Centralized status transition validation. Enforces: PendingPayment/WaitingVerification → cannot dispatch.

##### [NEW] app/Http/Controllers/Admin/DispatchController.php
Uses policy gate check before allowing dispatch.

#### Tests

##### [NEW] tests/Feature/Orders/PaymentLockTest.php
- Unpaid order dispatch rejected (403).
- Paid order dispatch succeeds.

---

### RC-021: Dispatch, Return & Overtime Settlement

#### Backend

##### [NEW] app/Http/Controllers/Admin/OrderLifecycleController.php
- `dispatch`: Set order Ongoing, vehicle InUse, driver OnDuty.
- `return`: Record actual_return_at. If late → calculate overtime via OvertimeCalculator, set WaitingOvertimePayment. If on-time → set Completed.
- `complete`: After overtime paid → set Completed.

##### [NEW] app/Services/Orders/RentalOrderLifecycleService.php
Encapsulates state transition logic with validation. Updates vehicle/driver statuses atomically via DB::transaction.

#### Tests

##### [NEW] tests/Feature/Orders/OrderLifecycleTest.php
- Dispatch transitions order/vehicle/driver statuses.
- Late return calculates overtime correctly.
- On-time return completes order.

---

## Phase 5: Dashboard, Reporting, Audit & Release Hardening

### RC-022: Admin Dashboard

#### Backend

##### [NEW] app/Http/Controllers/Admin/DashboardController.php
Single `__invoke` method returning metrics:
- `ordersToday`: RentalOrder::whereDate('created_at', today())->count()
- `pendingPayments`: Payment::where('status', 'unpaid')->count()
- `waitingVerification`: Payment::where('status', 'waiting_verification')->count()
- `availableVehicles`/`rentedVehicles`: Vehicle::where('status', ...)->count()
- `availableDrivers`/`onDutyDrivers`: Driver::where('status', ...)->count()

#### Frontend

##### [MODIFY] resources/js/pages/dashboards/admin.tsx
Replace placeholder with stat cards grid + recent orders table using deferred props.

#### Tests

##### [NEW] tests/Feature/Admin/DashboardControllerTest.php

---

### RC-023: Transaction & Revenue Report

#### Backend

##### [NEW] app/Http/Controllers/Admin/ReportController.php
`index`: Accept `date_from`/`date_to` query params. Query completed orders with paid payments. Sum revenue. Exclude cancelled/unpaid.

#### Frontend

##### [NEW] resources/js/pages/admin/reports/index.tsx
Date range picker, summary cards (total transactions, total revenue), transaction table.

#### Tests

##### [NEW] tests/Feature/Admin/ReportControllerTest.php

---

### RC-024: Audit Log

#### Backend

##### [NEW] app/Models/AuditLog.php
Fields: `user_id`, `action` (string), `subject_type`, `subject_id`, `metadata` (json), `created_at`.

##### [NEW] database/migrations/create_audit_logs_table.php

##### [NEW] app/Services/Audit/AuditLogger.php
Static method `log(User $actor, string $action, Model $subject, array $metadata = [])`.
Integrated into: PaymentVerificationController (approve/reject), PricingRuleController (store/update), OrderLifecycleController (dispatch/return/cancel).

> [!IMPORTANT]
> Never log sensitive data (transfer proof file contents, passwords). Only log safe metadata like IDs, amounts, status changes.

#### Tests

##### [NEW] tests/Feature/Audit/AuditLoggerTest.php

---

### RC-025: Responsive UI Polish & Final MVP Verification

#### Tasks
- Review all pages for mobile responsiveness (360px–767px breakpoint).
- Add empty states for all list pages.
- Ensure validation error messages display correctly on all forms.
- Verify navigation flow: customer booking → payment → receipt.
- Verify admin flow: master data → verify payment → dispatch → return.

#### Verification Commands
```bash
php artisan test --compact
npm run types:check
npm run build
```

---

## Route Structure Summary

```php
// Public
Route::get('/', ...)->name('home');
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/catalog/{vehicleCategory}', [CatalogController::class, 'show'])->name('catalog.show');

// Auth required
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::resource('vehicle-categories', VehicleCategoryController::class);
        Route::resource('vehicles', VehicleController::class);
        Route::resource('drivers', DriverController::class);
        Route::resource('pricing-rules', PricingRuleController::class);
        Route::resource('overtime-penalties', OvertimePenaltyController::class)->only(['index', 'store', 'update']);
        Route::resource('shuttle-tariffs', ShuttleTariffController::class);
        Route::get('payments/verification', [PaymentVerificationController::class, 'index'])->name('payments.verification.index');
        Route::post('payments/{payment}/approve', [PaymentVerificationController::class, 'approve'])->name('payments.approve');
        Route::post('payments/{payment}/reject', [PaymentVerificationController::class, 'reject'])->name('payments.reject');
        Route::post('orders/{rentalOrder}/dispatch', [OrderLifecycleController::class, 'dispatch'])->name('orders.dispatch');
        Route::post('orders/{rentalOrder}/return', [OrderLifecycleController::class, 'return'])->name('orders.return');
        Route::post('orders/{rentalOrder}/complete', [OrderLifecycleController::class, 'complete'])->name('orders.complete');
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    });

    // Cashier routes (shared with admin for payment)
    Route::middleware('role:admin,kasir')->group(function () {
        Route::post('payments/{payment}/cash', [PaymentController::class, 'recordCash'])->name('payments.cash');
    });

    // Customer routes
    Route::middleware('role:customer')->prefix('customer')->name('customer.')->group(function () {
        Route::get('/dashboard', ...)->name('dashboard');
        Route::resource('rental-orders', RentalOrderController::class)->only(['create', 'store', 'show', 'index']);
        Route::resource('shuttle-orders', ShuttleOrderController::class)->only(['create', 'store', 'show', 'index']);
        Route::post('payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof'])->name('payments.upload-proof');
        Route::post('upgrade-offers/{upgradeOffer}/accept', [UpgradeOfferController::class, 'accept'])->name('upgrade-offers.accept');
        Route::post('upgrade-offers/{upgradeOffer}/reject', [UpgradeOfferController::class, 'reject'])->name('upgrade-offers.reject');
    });

    // Shared
    Route::get('receipts/{receipt}', [ReceiptController::class, 'show'])->name('receipts.show');
});
```

---

## Verification Plan

### Per-Task
- Every controller gets a Pest feature test covering happy path, validation errors, and authorization.
- `vendor/bin/pint --dirty --format agent` after every PHP change.
- `php artisan wayfinder:generate` after route changes (auto via vite plugin).

### Final MVP
```bash
php artisan test --compact          # All tests pass
npm run types:check                 # No TypeScript errors
npm run build                       # Production build succeeds
```

### Manual Smoke Tests
- Customer: register → browse catalog → book rental → upload proof → view receipt.
- Admin: login → manage master data → verify payment → dispatch → return → view report.
- Cashier: login → record cash payment → verify transfer.
- Driver: login → see dashboard.
