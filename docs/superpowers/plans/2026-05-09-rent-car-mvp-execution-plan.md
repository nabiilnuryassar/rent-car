# Rent Car MVP Execution Plan

> **For implementation:** Work through the tasks below in order. Start each implementation task only after its dependencies are complete and verified.

**Goal:** Build the MVP rental kendaraan web app described in `docs/PRD.md`, using the current Laravel 13, Inertia v3, React 19, Tailwind v4, Pest 4, and Wayfinder stack.

**Current Codebase Baseline:** The repository is still close to the Laravel blank React starter. The app currently has one Inertia route in `routes/web.php`, one `User` model in `app/Models/User.php`, default framework migrations, the starter `resources/js/pages/welcome.tsx`, and PRD/UML/design docs under `docs/`.

**Planning Status:** This document is tool-agnostic and can be used directly for local execution, project tracking, or handoff to another developer. Project metadata such as owner, sprint, target dates, assignees, and estimates can be added later if the team needs them.

---

## Suggested Tracking Setup

**Initiative:** `Rent Car MVP`

**Workstream Tags:**
- `mvp`
- `backend`
- `frontend`
- `auth`
- `admin`
- `customer`
- `pricing`
- `orders`
- `payment`
- `receipt`
- `reporting`
- `qa`
- `blocked-business-data`

**Priority Rule:**
- `Urgent`: security, payment lock, data integrity blockers.
- `High`: required MVP user journeys and admin operations.
- `Medium`: dashboard/reporting polish and free-upgrade enhancements after core booking works.

**Definition of Done for Every Task:**
- Tests are added or updated for meaningful behavior.
- `vendor/bin/pint --dirty --format agent` is run after PHP changes.
- Relevant check is run: focused Pest test, `php artisan test --compact --filter=...`, `npm run types:check`, `npm run lint:check`, or `npm run build`.
- No hardcoded production secrets, bank details, or private customer data are committed.
- Wayfinder route functions are regenerated/used when frontend calls backend routes.

---

## Phase 0: Product And Build Baseline

### RC-001: Confirm MVP Scope, Missing Business Data, And Release Slices

**Priority:** High  
**Tags:** `mvp`, `qa`, `blocked-business-data`  
**Depends On:** none

**Description:** Convert `docs/PRD.md` into an implementation-ready MVP checklist. Confirm business data that development cannot invent safely: vehicle categories, class levels, rental rates, overtime rates, shuttle tariff table, company bank account display text, and receipt format.

**Likely Files:**
- `docs/PRD.md`
- `docs/UML_Rental_Kendaraan_PlantUML/*.puml`

**Acceptance Criteria:**
- MVP scope is split into build phases matching this execution plan.
- Business-owned data gaps are listed explicitly.
- `docs/MVP.prd` is either restored if intended or removed from IDE/task references because it is not present on disk.
- No application behavior is changed in this task.

### RC-002: Establish App Shell, Auth Routes, And Role Destination Map

**Priority:** High  
**Tags:** `mvp`, `auth`, `backend`, `frontend`  
**Depends On:** RC-001

**Description:** Replace the starter welcome-only surface with the minimal application shell needed for customer and internal workflows. Add login/register routes and role-based post-login destinations for customer, admin, cashier, and driver.

**Likely Files:**
- `routes/web.php`
- `app/Models/User.php`
- `app/Http/Controllers/Auth/*`
- `app/Http/Middleware/*`
- `resources/js/pages/auth/*`
- `resources/js/pages/dashboard/*`
- `resources/js/layouts/*`

**Acceptance Criteria:**
- Customers can register with name, email, phone, and password.
- Users can log in with valid email/password and see errors for invalid credentials.
- Passwords are hashed through Laravel casts or hashing services.
- Users are redirected to the correct dashboard by role.
- Feature tests cover registration, login, invalid login, and role redirect.

### RC-003: Add Role-Based Authorization Foundation

**Priority:** High  
**Tags:** `mvp`, `auth`, `backend`  
**Depends On:** RC-002

**Description:** Add a role model that supports `customer`, `admin`, `cashier`, and `driver`, then protect internal/customer routes by role. Keep the implementation simple unless the project later needs a permission package.

**Likely Files:**
- `database/migrations/*_add_role_and_status_to_users_table.php`
- `app/Enums/UserRole.php`
- `app/Enums/UserStatus.php`
- `app/Http/Middleware/EnsureUserHasRole.php`
- `routes/web.php`

**Acceptance Criteria:**
- User role and status are stored in the database.
- Admin, cashier, customer, and driver routes are guarded.
- Unauthorized users receive a safe redirect or 403 response.
- Feature tests prove each role can only access its allowed area.

---

## Phase 1: Core Domain Model

### RC-004: Create Customer, Driver, Vehicle Category, And Vehicle Domain

**Priority:** High  
**Tags:** `mvp`, `backend`, `admin`  
**Depends On:** RC-003

**Description:** Add the core people and fleet tables/models from the PRD and class diagram.

**Likely Files:**
- `app/Models/Customer.php`
- `app/Models/Driver.php`
- `app/Models/VehicleCategory.php`
- `app/Models/Vehicle.php`
- `app/Enums/CustomerType.php`
- `app/Enums/DriverStatus.php`
- `app/Enums/VehicleStatus.php`
- `database/migrations/*`
- `database/factories/*`

**Acceptance Criteria:**
- Customers are linked to users and include phone/address/customer type.
- Drivers are linked to users and include license number, phone, and availability status.
- Vehicle categories include name, class level, description, and active status.
- Vehicles include category, plate number, brand, model, year, status, and base metadata.
- Factories exist for each model.
- Unit or feature tests cover relationships and basic status casts.

### RC-005: Create Pricing, Orders, Payments, Receipts, And Upgrade Schema

**Priority:** High  
**Tags:** `mvp`, `backend`, `orders`, `payment`, `receipt`, `pricing`  
**Depends On:** RC-004

**Description:** Add data structures for pricing rules, overtime penalties, rental orders, shuttle tariffs, shuttle orders, payments, receipts, and upgrade offers.

**Likely Files:**
- `app/Models/PricingRule.php`
- `app/Models/OvertimePenalty.php`
- `app/Models/RentalOrder.php`
- `app/Models/ShuttleTariff.php`
- `app/Models/ShuttleOrder.php`
- `app/Models/Payment.php`
- `app/Models/Receipt.php`
- `app/Models/UpgradeOffer.php`
- `app/Enums/*`
- `database/migrations/*`
- `database/factories/*`

**Acceptance Criteria:**
- Order, payment, vehicle, and driver statuses match the PRD status model.
- Rental orders can reference customer, vehicle, driver, pickup option, city type, planned dates, actual return time, and total amount.
- Shuttle orders reference customer and shuttle tariff.
- Payments support cash and transfer proof metadata.
- Receipts have unique receipt numbers.
- Migration tests or model tests prove required relationships exist.

### RC-006: Add MVP Seed Data And Factories

**Priority:** High  
**Tags:** `mvp`, `backend`, `qa`, `blocked-business-data`  
**Depends On:** RC-005

**Description:** Add safe local seed data for development and tests. Use placeholder rates only if clearly marked as development data.

**Likely Files:**
- `database/seeders/DatabaseSeeder.php`
- `database/seeders/VehicleCategorySeeder.php`
- `database/seeders/VehicleSeeder.php`
- `database/seeders/DriverSeeder.php`
- `database/seeders/PricingRuleSeeder.php`
- `database/factories/*`

**Acceptance Criteria:**
- Local seed creates one admin, one cashier, one driver, one customer, categories, vehicles, drivers, pricing rules, and shuttle tariffs.
- Test factories support the main order/payment states.
- Seeded placeholder business data is clearly separated from production assumptions.

---

## Phase 2: Admin Master Data

### RC-007: Build Vehicle Category Management

**Priority:** High  
**Tags:** `mvp`, `admin`, `backend`, `frontend`  
**Depends On:** RC-006

**Description:** Let admins create, update, list, activate, and deactivate vehicle categories.

**Likely Files:**
- `app/Http/Controllers/Admin/VehicleCategoryController.php`
- `app/Http/Requests/Admin/StoreVehicleCategoryRequest.php`
- `app/Http/Requests/Admin/UpdateVehicleCategoryRequest.php`
- `resources/js/pages/admin/vehicle-categories/*`
- `routes/web.php`

**Acceptance Criteria:**
- Admin can manage category name, class level, description, and active status.
- Class level is required because free upgrade depends on higher class lookup.
- Non-admin roles cannot access category management.
- Feature tests cover create/update/deactivate and authorization.

### RC-008: Build Vehicle Management And Availability Status

**Priority:** High  
**Tags:** `mvp`, `admin`, `backend`, `frontend`  
**Depends On:** RC-007

**Description:** Let admins manage vehicle records and status transitions needed for catalog, reservation, dispatch, maintenance, and inactive vehicles.

**Likely Files:**
- `app/Http/Controllers/Admin/VehicleController.php`
- `app/Http/Requests/Admin/StoreVehicleRequest.php`
- `app/Http/Requests/Admin/UpdateVehicleRequest.php`
- `resources/js/pages/admin/vehicles/*`

**Acceptance Criteria:**
- Admin can create/edit vehicles with plate number, category, brand, model, year, and status.
- Plate number is unique.
- Vehicle status supports available, reserved, in use, maintenance, and inactive.
- Catalog/order flows cannot select maintenance or inactive vehicles.
- Tests cover validation, uniqueness, and role access.

### RC-009: Build Driver Management And Availability Status

**Priority:** High  
**Tags:** `mvp`, `admin`, `backend`, `frontend`  
**Depends On:** RC-006

**Description:** Let admins manage driver profiles and availability.

**Likely Files:**
- `app/Http/Controllers/Admin/DriverController.php`
- `app/Http/Requests/Admin/StoreDriverRequest.php`
- `app/Http/Requests/Admin/UpdateDriverRequest.php`
- `resources/js/pages/admin/drivers/*`

**Acceptance Criteria:**
- Admin can create/edit/deactivate drivers.
- Driver status supports available, reserved, on duty, off duty, and inactive.
- Driver list is filterable by status.
- Tests cover CRUD, validation, and role access.

### RC-010: Build Pricing Rule, Overtime, And Shuttle Tariff Management

**Priority:** High  
**Tags:** `mvp`, `admin`, `pricing`, `backend`, `frontend`  
**Depends On:** RC-005

**Description:** Let admins manage rental pricing, overtime rates, and fixed shuttle tariffs.

**Likely Files:**
- `app/Http/Controllers/Admin/PricingRuleController.php`
- `app/Http/Controllers/Admin/OvertimePenaltyController.php`
- `app/Http/Controllers/Admin/ShuttleTariffController.php`
- `app/Http/Requests/Admin/*`
- `resources/js/pages/admin/pricing/*`
- `resources/js/pages/admin/shuttle-tariffs/*`

**Acceptance Criteria:**
- Pricing rules support category, rental unit, min/max duration, and rate.
- Overtime penalty supports hourly rate per vehicle category.
- Shuttle tariffs support area/from-to, estimated distance, estimated duration, and price.
- Changes to rates are auditable in a later audit task.
- Tests cover validation and lookup compatibility with the pricing engine.

---

## Phase 3: Customer Catalog, Pricing, And Booking

### RC-011: Build Customer Vehicle Catalog And Availability Query

**Priority:** High  
**Tags:** `mvp`, `customer`, `frontend`, `backend`  
**Depends On:** RC-008

**Description:** Replace the starter welcome page with a customer-facing vehicle catalog that shows categories and available vehicles.

**Likely Files:**
- `app/Http/Controllers/CatalogController.php`
- `resources/js/pages/catalog/*`
- `resources/js/pages/welcome.tsx`
- `routes/web.php`

**Acceptance Criteria:**
- Customer can see active categories and available vehicles.
- Unavailable vehicles are visible only if the UI clearly prevents normal selection, or hidden if that is the chosen product behavior.
- Catalog is responsive for mobile and desktop.
- Tests cover available/unavailable filtering.

### RC-012: Implement Rental Pricing Engine

**Priority:** High  
**Tags:** `mvp`, `pricing`, `backend`  
**Depends On:** RC-010

**Description:** Implement automatic price calculation for rental duration, long-duration rates, out-of-town surcharge, and overtime.

**Likely Files:**
- `app/Services/Pricing/RentalPricingService.php`
- `app/Data/RentalPricingQuote.php`
- `tests/Unit/Pricing/*`

**Acceptance Criteria:**
- Hourly rental below 3 hours is rejected.
- Hourly, daily, weekly, and monthly rules calculate subtotal correctly.
- Longer duration can use lower configured rates.
- Out-of-town rental adds 20 percent surcharge and exposes it in the breakdown.
- Overtime is rounded up per hour.
- Unit tests cover all PRD business rules BR-003 through BR-007.

### RC-013: Build Customer Rental Booking Flow

**Priority:** High  
**Tags:** `mvp`, `orders`, `customer`, `frontend`, `backend`  
**Depends On:** RC-011, RC-012

**Description:** Build the customer rental order flow: choose vehicle/category, schedule, duration, pickup/delivery, city type, price preview, and order confirmation.

**Likely Files:**
- `app/Http/Controllers/Customer/RentalOrderController.php`
- `app/Http/Requests/Customer/StoreRentalOrderRequest.php`
- `resources/js/pages/customer/rental-orders/*`
- `routes/web.php`

**Acceptance Criteria:**
- Customer can create a rental order with required schedule and duration.
- Delivery address is required when pickup type is delivery.
- Total price is shown before confirmation.
- Created orders start in pending payment state.
- Feature tests cover valid order, invalid hourly duration, missing delivery address, and pending payment status.

### RC-014: Implement Driver Selection And Auto Assignment

**Priority:** High  
**Tags:** `mvp`, `orders`, `backend`, `frontend`  
**Depends On:** RC-013, RC-009

**Description:** Allow loyal customers to choose available drivers while new customers receive an automatic driver assignment.

**Likely Files:**
- `app/Services/Drivers/DriverAvailabilityService.php`
- `app/Services/Drivers/DriverAssignmentService.php`
- `resources/js/pages/customer/rental-orders/*`
- `tests/Feature/RentalOrders/*`

**Acceptance Criteria:**
- Customer with at least one completed order is treated as loyal.
- Loyal customers see only drivers available for the rental schedule.
- New customers cannot manually choose a driver.
- If selected driver is unavailable, validation rejects the order.
- Tests cover loyal and new customer behavior.

### RC-015: Implement Free Upgrade Offer Flow

**Priority:** Medium  
**Tags:** `mvp`, `orders`, `backend`, `frontend`  
**Depends On:** RC-013

**Description:** Offer a higher-class vehicle at the original category price when the requested category/vehicle is unavailable.

**Likely Files:**
- `app/Services/Vehicles/VehicleUpgradeService.php`
- `app/Models/UpgradeOffer.php`
- `app/Http/Controllers/Customer/UpgradeOfferController.php`
- `resources/js/pages/customer/rental-orders/*`

**Acceptance Criteria:**
- System searches for available vehicles with a higher class level.
- Offer preserves original pricing.
- Customer can accept or reject the upgrade.
- Rejecting the upgrade does not create a confirmed rental order.
- Tests cover available upgrade, no upgrade candidate, accept, and reject.

### RC-016: Build Shuttle Booking Flow

**Priority:** High  
**Tags:** `mvp`, `orders`, `customer`, `pricing`, `frontend`, `backend`  
**Depends On:** RC-010

**Description:** Build standalone shuttle/antar-jemput ordering using fixed tariff records.

**Likely Files:**
- `app/Http/Controllers/Customer/ShuttleOrderController.php`
- `app/Http/Requests/Customer/StoreShuttleOrderRequest.php`
- `app/Services/Pricing/ShuttlePricingService.php`
- `resources/js/pages/customer/shuttle-orders/*`

**Acceptance Criteria:**
- Customer can enter pickup location, destination, and schedule.
- System matches a configured shuttle tariff.
- Shuttle order starts in pending payment state.
- Tests cover successful tariff lookup and no matching tariff.

---

## Phase 4: Payment, Receipt, Dispatch, And Return

### RC-017: Implement Payment Creation, Cash Payment, And Transfer Proof Upload

**Priority:** High  
**Tags:** `mvp`, `payment`, `backend`, `frontend`  
**Depends On:** RC-013, RC-016

**Description:** Add payment flows for cash and bank transfer proof upload.

**Likely Files:**
- `app/Http/Controllers/PaymentController.php`
- `app/Http/Requests/StoreCashPaymentRequest.php`
- `app/Http/Requests/UploadTransferProofRequest.php`
- `config/filesystems.php`
- `resources/js/pages/payments/*`

**Acceptance Criteria:**
- Cash payment can be recorded by cashier/admin only.
- Transfer proof upload accepts JPG, PNG, and PDF only.
- Transfer proof size is limited to 5 MB.
- Transfer payment status becomes waiting verification.
- Order cannot be dispatched while unpaid or waiting verification.
- Tests cover file validation and role access.

### RC-018: Implement Transfer Verification

**Priority:** High  
**Tags:** `mvp`, `payment`, `backend`, `frontend`  
**Depends On:** RC-017

**Description:** Let admin/cashier approve or reject transfer proof. Approved payments mark the order paid; rejected payments require customer re-upload.

**Likely Files:**
- `app/Http/Controllers/Admin/PaymentVerificationController.php`
- `app/Http/Requests/Admin/VerifyPaymentRequest.php`
- `resources/js/pages/admin/payments/*`

**Acceptance Criteria:**
- Admin/cashier can view proof file metadata or preview link.
- Approving payment sets payment status to paid and stores verifier/timestamp.
- Rejecting payment sets status rejected and keeps the order blocked.
- Customer can upload a replacement proof after rejection.
- Tests cover approve, reject, unauthorized verifier, and blocked dispatch.

### RC-019: Implement Receipt Numbering And Receipt View

**Priority:** High  
**Tags:** `mvp`, `receipt`, `backend`, `frontend`  
**Depends On:** RC-018

**Description:** Generate a digital receipt after paid payment, with unique receipt number and printable/downloadable view.

**Likely Files:**
- `app/Services/Receipts/ReceiptNumberGenerator.php`
- `app/Services/Receipts/ReceiptService.php`
- `app/Http/Controllers/ReceiptController.php`
- `resources/js/pages/receipts/show.tsx`

**Acceptance Criteria:**
- Receipt is generated only after payment is paid.
- Receipt includes transaction number, customer, service detail, price breakdown, method, and payment date.
- Receipt number is unique.
- Receipt page is printable from browser.
- Tests cover paid-only generation and number uniqueness.

### RC-020: Implement Payment Locking And Dispatch Guard

**Priority:** Urgent  
**Tags:** `mvp`, `payment`, `orders`, `backend`, `frontend`  
**Depends On:** RC-018

**Description:** Enforce the core safety rule: no vehicle handover or dispatch before paid payment.

**Likely Files:**
- `app/Policies/RentalOrderPolicy.php`
- `app/Services/Orders/OrderStatusService.php`
- `app/Http/Controllers/Admin/DispatchController.php`
- `resources/js/pages/admin/orders/*`

**Acceptance Criteria:**
- Pending and waiting verification orders cannot be dispatched.
- UI disables dispatch action for unpaid orders and shows a clear warning.
- Backend rejects forced dispatch attempts for unpaid orders.
- Paid orders can transition to ready to dispatch or ongoing.
- Feature tests prove lock compliance.

### RC-021: Implement Dispatch, Return, And Overtime Settlement

**Priority:** High  
**Tags:** `mvp`, `orders`, `pricing`, `backend`, `frontend`  
**Depends On:** RC-020, RC-012

**Description:** Let admin confirm dispatch/handover, update vehicle/driver status, record return time, calculate overtime, and complete the order.

**Likely Files:**
- `app/Http/Controllers/Admin/OrderLifecycleController.php`
- `app/Services/Orders/RentalOrderLifecycleService.php`
- `resources/js/pages/admin/orders/*`

**Acceptance Criteria:**
- Dispatch sets order ongoing, vehicle in use, and driver on duty.
- Return records actual return time.
- Late return creates overtime charge and waiting overtime payment status.
- On-time return can complete the order.
- Tests cover state transitions and overtime calculation.

---

## Phase 5: Dashboard, Reporting, Audit, And Release Hardening

### RC-022: Build Admin Dashboard

**Priority:** Medium  
**Tags:** `mvp`, `admin`, `frontend`, `backend`  
**Depends On:** RC-021

**Description:** Build operational dashboard cards and tables for daily orders, pending payments, vehicle status, and driver status.

**Likely Files:**
- `app/Http/Controllers/Admin/DashboardController.php`
- `resources/js/pages/admin/dashboard.tsx`

**Acceptance Criteria:**
- Dashboard shows total orders today.
- Dashboard shows pending payment and waiting verification counts.
- Dashboard shows available/rented vehicle counts.
- Dashboard shows available/on-duty driver counts.
- Query tests or feature tests cover dashboard metrics.

### RC-023: Build Management Transaction And Revenue Report

**Priority:** Medium  
**Tags:** `mvp`, `reporting`, `backend`, `frontend`  
**Depends On:** RC-019, RC-021

**Description:** Add management report page with date filter, total transactions, and total revenue. CSV/PDF export stays out of MVP unless explicitly reprioritized.

**Likely Files:**
- `app/Http/Controllers/Admin/ReportController.php`
- `resources/js/pages/admin/reports/*`

**Acceptance Criteria:**
- Report can be filtered by date range.
- Report shows total completed transactions.
- Report shows paid revenue total.
- Cancelled and unpaid orders are excluded from revenue.
- Tests cover date filtering and revenue rules.

### RC-024: Add Audit Log For High-Risk Actions

**Priority:** High  
**Tags:** `mvp`, `backend`, `payment`, `pricing`, `orders`  
**Depends On:** RC-010, RC-018, RC-021

**Description:** Record important operational actions required by the PRD security section: payment verification, pricing changes, order cancellation, dispatch, and return completion.

**Likely Files:**
- `app/Models/AuditLog.php`
- `database/migrations/*_create_audit_logs_table.php`
- `app/Services/Audit/AuditLogger.php`
- Relevant controllers/services from prior tasks

**Acceptance Criteria:**
- Audit log stores actor, action, subject type/id, timestamp, and safe metadata.
- Sensitive data and full transfer proof contents are not logged.
- Payment approval/rejection is logged.
- Pricing rule changes are logged.
- Order cancellation/dispatch/return completion are logged.
- Tests cover at least one event from each high-risk category.

### RC-025: Responsive UI Polish And Final MVP Verification

**Priority:** High  
**Tags:** `mvp`, `qa`, `frontend`  
**Depends On:** RC-022, RC-023, RC-024

**Description:** Complete MVP hardening across mobile/desktop, navigation, empty states, validation messages, and end-to-end smoke paths.

**Likely Files:**
- `resources/js/pages/**/*`
- `resources/js/components/**/*`
- `resources/css/app.css`
- `tests/Feature/**/*`

**Acceptance Criteria:**
- Customer can complete registration, catalog browse, rental booking, payment proof upload, receipt viewing.
- Admin/cashier can manage master data, verify payment, dispatch, return, and close order.
- UI uses the design tokens and visual direction from `docs/DESIGN.md` where appropriate for application screens.
- `php artisan test --compact`, `npm run types:check`, and `npm run build` pass.
- Manual smoke test notes cover customer, admin, cashier, and driver access paths.

---

## Recommended Execution Order

1. RC-001
2. RC-002
3. RC-003
4. RC-004
5. RC-005
6. RC-006
7. RC-007
8. RC-008
9. RC-009
10. RC-010
11. RC-011
12. RC-012
13. RC-013
14. RC-014
15. RC-015
16. RC-016
17. RC-017
18. RC-018
19. RC-019
20. RC-020
21. RC-021
22. RC-022
23. RC-023
24. RC-024
25. RC-025

## Execution Checklist

- [ ] Confirm the implementation owner for each task.
- [ ] Confirm target dates or sprint boundaries if the team uses them.
- [ ] Confirm task tags and priorities.
- [ ] Track tasks RC-001 through RC-025 in the team's preferred tool or local checklist.
- [ ] Respect dependencies according to the `Depends On` fields.
- [ ] Start execution at RC-001 only.
