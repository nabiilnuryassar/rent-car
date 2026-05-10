# URBAN 8 Rebrand & Multi-Step Booking

Date: 2026-05-10  
Area: frontend, backend, shared  
Type: feat | refactor

## Context

The application was previously branded as "FleetGo". The business requires a complete rebrand to "URBAN 8" across all user-facing surfaces. Additionally, the order-to-driver workflow was split across separate pages — the user requested consolidating everything into a cohesive multi-step modal within the catalog module.

## What changed

### Branding (FleetGo → URBAN 8)
- `resources/js/layouts/customer-layout.tsx` — Logo image, brand text, tagline, `<Head>` title
- `resources/js/layouts/admin-layout.tsx` — Logo image, brand text, `<Head>` title  
- `resources/js/pages/welcome.tsx` — Hero heading, subtitle, header brand name
- `resources/js/pages/customer/orders/show.tsx` — Bank transfer info (PT URBAN 8 Indonesia)
- `resources/js/pages/customer/orders/select-driver.tsx` — `<Head>` title
- `resources/js/pages/receipts/show.tsx` — Default company name, `<Head>` title
- `resources/js/pages/admin/settings/index.tsx` — Placeholder, `<Head>` title, fixed SSR `route()` bug
- `resources/js/pages/customer/shuttle-orders/index.tsx` — `<Head>` title
- `resources/js/pages/customer/shuttle-orders/show.tsx` — `<Head>` title
- `resources/js/pages/customer/shuttle-orders/create.tsx` — `<Head>` title

### Multi-Step Booking Modal
- `resources/js/components/customer/VehicleModal.tsx` — Complete rewrite with 3-step flow:
  - **Step 1 (Detail)**: Vehicle info, specs, features
  - **Step 2 (Booking)**: Rental form with all fields
  - **Step 3 (Driver Selection)**: Shows top 3 available drivers inline with radio selection
- Step indicator with numbered circles and connecting lines
- "Skip" option for driver selection

### Route & Controller Fixes
- `routes/web.php` — Added missing `customer.orders.show` GET route
- `app/Http/Controllers/Customer/OrderController.php` — Changed `store` redirect from `select-driver` to `orders.show`; fixed `cancel` redirect route name
- `app/Http/Controllers/Customer/UpgradeOfferController.php` — Fixed broken route names (`orders.show` → `customer.orders.show`, `orders.index` → `customer.orders.index`)
- `app/Http/Controllers/Customer/DriverSelectionController.php` — Added JSON response support for AJAX requests from the multi-step modal

### Tests
- `tests/Feature/CustomerOrderFlowTest.php` — **13 new tests** covering: catalog page, search filter, order creation, validation, order show, auth guard, driver selection (Inertia + JSON), driver assignment, cancellation, orders list
- `tests/Feature/AdminSettingsTest.php` — **3 new tests** covering: settings page access, company settings save, non-admin denial
- Fixed 4 pre-existing broken tests in `AutoUpgradeOfferTest`, `DriverNotificationTest`, `OrderCancellationTest` that referenced old route URLs

### Documentation
- `docs/CHANGELOG.md` — Updated title and added entry
- `docs/CHANGES/2026-05-10-urban8-rebrand.md` — This file

## Impact

- **Brand Identity**: All user-facing text and logos now display "URBAN 8" consistently
- **UX Flow**: Booking + driver selection is now a single-modal multi-step flow — no page redirect
- **Route Fix**: `customer.orders.show` route was missing, causing 404s after order creation — now fixed
- **Backward Compatibility**: The standalone `/orders/{id}/select-driver` page still exists for backward compatibility

## How to test

1. Run full test suite: `php artisan test --compact` (73 tests should pass)
2. Visit `/catalog`, click a vehicle → verify 3-step modal (Detail → Booking → Driver)
3. Check all page titles in browser tab show "URBAN 8" instead of "FleetGo"
4. Check admin sidebar shows URBAN 8 logo
5. Check receipts display "URBAN 8 Rent"

## Rollback plan

- Revert the commit containing these changes
- No database migrations involved — purely frontend + controller changes
