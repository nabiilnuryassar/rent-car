# Urban8 Rent-Car UX Uplift — Pi Phased Plan

Date: 2026-05-25
Branch target: `feat/urban8-ux-uplift` from `main` (current: `c9b3ef1`).
Scope: Implement Spec/Plan/Synthesis trio under `docs/superpowers/` for Urban8 Rent-Car.
Toolchain: Laravel 13.8, PHP 8.4, Inertia 3.1, React 19, Tailwind 4.2, Headless UI 2.2.10, Pest 4.7.

## Reference Anchors (Verified Against Repo)

- `app/Http/Middleware/HandleInertiaRequests.php` shares only `name`, `auth.user`, `settings`, `flash` today. No `notifications` prop. `auth` is a flat `{ user }` object.
- `app/Http/Controllers/DashboardRedirectController.php` uses `match (true)` and falls through to `abort(403)` when no role matches.
- `app/Http/Controllers/Admin/DashboardController.php` builds `$quickVerifications` and `$pendingCash` with `orderBy('id','asc')` and reads `in_use_vehicles` for the "Penyewaan Aktif" KPI; no `active_rentals` field is computed.
- `app/Http/Controllers/Admin/VehicleController@index` paginates 15, eager loads `category` only. No `pricingRules` eager load and no `out_of_rules*` props.
- `app/Http/Controllers/Customer/DriverController@index` uses `paginate(4)`.
- `app/Http/Controllers/Driver/DashboardController` returns `notifications` and `assignedOrders`; no `featuredOrder`. Eager loads `customer.user` and `vehicle.category` (not `vehicle.images` array, but `images` is a model attribute via casts).
- `App\Enums\OrderStatus`: `Draft, PendingPayment, WaitingVerification, Paid, ReadyToDispatch, Ongoing, WaitingOvertimePayment, Completed, Cancelled`.
- `App\Enums\VehicleStatus`: `Available, Reserved, InUse, Maintenance, Inactive`.
- `App\Enums\PaymentStatus`: `Unpaid, WaitingVerification, Rejected, Paid, Refunded`.
- `App\Enums\UserRole`: `Admin, Cashier, Customer, Driver`.
- `App\Models\VehicleCategory::pricingRules()` is a `HasMany`; cardinality empty/non-empty is the rule check.
- `App\Models\Customer::rentalOrders()` is a `HasMany`; `RentalOrder::payments()` is `morphMany`.
- `Vehicle` casts `status` to `VehicleStatus` and `images` to `array`.
- `resources/js/types/auth.ts` exposes `Auth = { user: User | null }`. Adding `notifications` keeps `Auth` shape clean if we put `notifications` at top-level of shared data.
- `resources/js/types/global.d.ts` defines `InertiaConfig.sharedPageProps` index-signature; we will add an explicit `notifications?: NotificationItem[]` next to the existing fields.
- `resources/js/layouts/customer-layout.tsx` desktop header places nav and the user/avatar block. Bell will be inserted between nav and avatar.
- `resources/js/components/customer/VehicleCard.tsx` CTA today uses `sm:flex-1 sm:py-4` with `Pesan Sekarang` text. We rewrite to fit-content `Pilih`/`Lihat Detail`.
- `resources/js/pages/driver/dashboard.tsx` includes `Bell` import (line 4 region) and a `Notifikasi Terbaru` `<section>`.
- `resources/js/pages/admin/payments/index.tsx` and `resources/js/pages/dashboards/admin.tsx` open transfer proof in a new tab via `<a href="/storage/...">`.
- `resources/js/pages/admin/vehicles/index.tsx` table columns: Pelat, Brand, Model, Tahun, Status, Aksi (6 columns). Banner + per-row warning need new column or status-cell augmentation.
- `resources/css/app.css` defines tokens `navy-blue`, `amber-gold`, `pale-amber`, `surface-gray`, `slate-gray`, `success-green`, `pale-green`, `base-white`. We must use those token names rather than hex literals.
- `resources/js/components/ui/Modal.tsx` does not exist. Standalone `ProofImageModal.tsx` is the right path.
- Headless UI v2 in this project (`@headlessui/react@^2.2.10`) supports both `Dialog.Panel`-style and `DialogPanel`-style imports. The synthesis review prescribes flat imports (`Dialog`, `DialogPanel`, `Transition`, `TransitionChild`); we follow that to satisfy the SPEC constraint.

## Pre-Flight Slice (P0) — Spec/Plan Reconciliation

Goal: align the existing planning docs with the SPEC decisions before code work, so reviewer/worker handoff is unambiguous.

Files (docs only):

- `docs/superpowers/specs/2026-05-25-ux-uplift-design.md` — replace any hex literal references in §2 and §9 with token names; pin the `active_rentals` enum set; fix out-of-rules definition; pin top-level `notifications` shared prop.
- `docs/superpowers/plans/2026-05-25-urban8-ux-uplift-plan.md` — fix Task 1 enum cases, Task 3 eager-load + rule wording, Task 5 shared prop convention, Task 6 unused imports cleanup notes, Task 7 race-safe fallback wording, "no new `preserveScroll`" note.

Success criteria:

- All four task callouts above patched.
- A grep for `#1E2761`, `#CADCFC`, `#F4B400` in spec returns zero hits or appears only inside a "Legacy reference" footnote.
- A grep for `Approved/InProgress/Active` (the wrong enum names) in plan returns zero hits.
- No code touched.

Dependencies: none.

## Phase 1 — Foundation Primitives

Vertical slice: deliver the cross-cutting building blocks that tasks 2, 5, 6, and 8 reuse.

Files (new):

- `resources/js/lib/vehicle-image.ts` — fallback chain `vehicle.images[0] -> /images/mockup/{categorySlug}.png -> /images/landing/fleet-side.jpg`.
- `resources/js/components/ProofImageModal.tsx` — standalone Headless UI `Dialog` + `Transition` primitive, props `{ url: string | null; onClose: () => void }`.
- `resources/js/components/customer/NotificationBell.tsx` — Headless UI `Popover` shell only (data plumbing comes in Phase 4).
- `resources/js/components/driver/ActiveOrderHero.tsx` — UI shell only; data plumbing comes in Phase 5.
- `app/Services/Notifications/CustomerNotificationDeriver.php` — derive plain-array notifications from a `Customer` (orders + payments). Returns at most 8 items, sorted desc by `created_at`.

Files (modified):

- `resources/js/types/global.d.ts` — add `notifications?: NotificationItem[]` to `sharedPageProps`.
- `resources/js/types/index.ts` — re-export `notification` types.
- `resources/js/types/notification.ts` (new) — define `NotificationItem`.

Success criteria:

- `npx tsc --noEmit` passes for the new types.
- `npm run build` succeeds with the new components present (they are imported only by tests/pages added later, so unused-import lint runs in Phase 8).
- `php artisan test --filter=NotificationDerivationTest --compact` is created in Phase 4 and passes there.

Dependencies: P0 patches landed.

## Phase 2 — PR1: Office Dashboard Polish (Tasks 1 + 2 + 8 partial)

Vertical slice: admin dashboard data correctness, proof image modal, dashboard icon alignment.

Files (modified):

- `app/Http/Controllers/Admin/DashboardController.php`
  - Switch `$quickVerifications` and `$pendingCash` from `orderBy('id','asc')` to `latest()`.
  - Compute `active_rentals = RentalOrder::whereIn('status', [Paid, ReadyToDispatch, Ongoing, WaitingOvertimePayment])->count()` for the admin branch and inject into `$stats`.
- `resources/js/pages/dashboards/admin.tsx`
  - Add `active_rentals` field to `AdminStats` type.
  - Update KPI card label to `Sewa Aktif` and bind to `adminStats.active_rentals ?? adminStats.in_use_vehicles`.
  - Replace `<a target="_blank">` "Lihat Bukti" with a button that opens `ProofImageModal` using local state `proofModalUrl`.
  - Apply `inline-flex items-center gap-1.5` to the action buttons in this file; remove `mr-1` from icons inside those buttons. Scope: this file only.
- `resources/js/pages/admin/payments/index.tsx`
  - Replace `<a target="_blank">` "Lihat Bukti" with `ProofImageModal` button + state.
  - Apply `inline-flex items-center gap-1.5` to the row action buttons; remove `mr-1` from icons. Scope: this file only.

Files (new tests):

- `tests/Feature/Admin/DashboardOrderingTest.php` — two cases (admin newest-first quick verifications, cashier newest-first pending cash).
- `tests/Feature/Admin/DashboardActiveRentalsTest.php` — counts orders across the inclusive enum set, ignores `Completed`/`Cancelled`/`Draft`/`PendingPayment`/`WaitingVerification`.

Success criteria:

- `php artisan test --filter=DashboardOrderingTest --compact` passes.
- `php artisan test --filter=DashboardActiveRentalsTest --compact` passes.
- `npm run build` and `npx tsc --noEmit` pass.
- Manually: clicking "Lihat Bukti" opens an image-only Headless UI modal in both pages; ESC and backdrop click close.

Dependencies: Phase 1 components landed.

## Phase 3 — PR1: Customer Catalog CTA + Driver Pagination (Task 4)

Vertical slice: small UI polish + one-line backend pagination change.

Files (modified):

- `resources/js/components/customer/VehicleCard.tsx`
  - Replace CTA classes with `inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-gold px-5 py-2.5 text-sm font-semibold text-navy-blue shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-gold/90 hover:shadow-md`.
  - Mobile: `<span className="sm:hidden">Pilih</span>`. Desktop: `<span className="hidden sm:inline">Lihat Detail</span>`. Keep `aria-label` describing the vehicle.
  - Preserve current click handler (`onClick`).
- `app/Http/Controllers/Customer/DriverController.php`
  - Change `paginate(4)` to `paginate(6)`.

Files (new tests):

- `tests/Feature/Customer/DriverPaginationTest.php` — public `/drivers` endpoint paginates 6 per page; second page exists when there are 7 available drivers.

Success criteria:

- `php artisan test --filter=DriverPaginationTest --compact` passes.
- `npm run build` and `npx tsc --noEmit` pass.
- Visually: VehicleCard CTA is a fit-content rounded button on both breakpoints, label changes responsively.

Dependencies: Phase 1 (no new components needed).

## Phase 4 — PR2: Customer Notification Bell (Task 5)

Vertical slice: derived notifications wired through middleware to the bell component.

Files (modified):

- `app/Http/Middleware/HandleInertiaRequests.php`
  - Import `Inertia\Inertia`, `Cache`, `App\Enums\UserRole`, `App\Services\Notifications\CustomerNotificationDeriver`.
  - Add a top-level `notifications` shared prop using `Inertia::defer(fn () => ...)`. Within the closure: bail with empty array unless `$request->user()?->hasRole(UserRole::Customer->value)` and a `customer` relation exists. Wrap derive call in `Cache::remember("customer.notifications.{$customer->id}", now()->addSeconds(60), ...)`.
- `app/Services/Notifications/CustomerNotificationDeriver.php`
  - Final logic: pull last 10 orders for the customer, eager load `payments`. Emit one item per significant transition (waiting verification, paid/verified, ready to dispatch, ongoing, return reminder for `Ongoing` near `end_at`, refund issued, payment rejected). Cap to 8 items, sorted desc by `created_at`.
- `resources/js/components/customer/NotificationBell.tsx`
  - Replace shell with full Popover: `PopoverButton` shows bell icon + unread count badge; `PopoverPanel` lists items with empty state copy "Belum ada notifikasi".
- `resources/js/layouts/customer-layout.tsx`
  - Read `notifications` from `usePage().props` (top-level).
  - Insert `<NotificationBell notifications={notifications ?? []} />` between the desktop nav and the avatar/user block. Preserve `+ Pemesanan Baru` link as-is unless the SPEC allows removal — SPEC says delete; we delete and reflow.
- `resources/js/types/notification.ts`
  - Pin shape `{ id: string; title: string; body?: string; created_at: string; read: boolean; href?: string }`.

Files (new tests):

- `tests/Feature/Customer/NotificationDerivationTest.php` — verifies derived items for a customer with verified payment and `ReadyToDispatch` order; verifies cache hit on second call by mocking the deriver.
- `tests/Feature/Customer/NotificationSharedPropTest.php` (optional) — asserts `notifications` is present at top-level for an authenticated customer GET to `/catalog` and absent (or empty) for an authenticated driver.

Success criteria:

- `php artisan test --filter=NotificationDerivationTest --compact` passes.
- For non-customer roles, the deferred notifications resolver returns `[]` (or `null` resolved as `[]` in TS via fallback).
- `npm run build` and `npx tsc --noEmit` pass.
- Customer header order is `nav | NotificationBell | UserAvatar` on desktop. Mobile bell is out of scope per SPEC.

Dependencies: Phase 1 deriver scaffold; Phase 2/3 UI changes do not block this.

## Phase 5 — PR2: Driver Active Order Hero (Task 6)

Vertical slice: backend `featuredOrder` payload + hero widget + drop notification card.

Files (modified):

- `app/Http/Controllers/Driver/DashboardController.php`
  - Eager load `vehicle.category` and `customer.user` (already done) and explicitly include `vehicle.images` via the `Vehicle::images` cast (no relation change required).
  - Compute `featuredOrder` ordering: `orderByRaw("CASE WHEN status = ? THEN 0 ELSE 1 END", [OrderStatus::Ongoing->value])` then `orderBy('start_at', 'asc')`.
  - Map `assignedOrders` and `featuredOrder` to plain arrays with the fields the FE expects (`id, order_number, status, start_at, end_at, pickup_option, delivery_address, customer.user.name, vehicle.{brand, model, plate_number, images, category.name}`).
  - Include `featuredOrder` (nullable) in the Inertia response.
- `resources/js/pages/driver/dashboard.tsx`
  - Drop the `Notifikasi Terbaru` `<section>` block.
  - Drop `Bell` import and the `Notification` type if no other usage exists.
  - Update `Props` to add `featuredOrder?: FeaturedOrder | null` and replace the `AssignedOrder.vehicle` shape with a `FeaturedOrder` superset that includes `images` and `category`.
  - Render `<ActiveOrderHero order={featuredOrder ?? assignedOrders[0] ?? null} />` immediately after the status banner and before the KPI cards.
- `resources/js/components/driver/ActiveOrderHero.tsx`
  - Final logic: empty state card when `order` is null. Otherwise card with banner image (`vehicleImage(order.vehicle)`), status pill, customer name, formatted start time (`Intl.DateTimeFormat('id-ID', ...)`), CTA "Lihat Detail" linking to `/driver/orders/{order_number}`.
- `resources/js/lib/vehicle-image.ts`
  - Final logic: `vehicleImage(vehicle?: { images?: string[]; category?: { name?: string } | null })`. Returns `/storage/{images[0]}` if present, else `/images/mockup/{slug(category.name)}.png` if category, else `/images/landing/fleet-side.jpg`.

Files (new tests):

- `tests/Feature/Driver/ActiveOrderHeroTest.php` — covers two scenarios: ongoing order is featured, and earliest `start_at` is featured when no ongoing order exists.

Success criteria:

- `php artisan test --filter=ActiveOrderHeroTest --compact` passes.
- `npm run build`, `npx tsc --noEmit` pass without unused-import errors.
- Driver dashboard shows hero at top; clicking hero CTA navigates to `/driver/orders/{order_number}`.
- Empty state renders correctly when driver has no active orders.

Dependencies: Phase 1 components/util landed.

## Phase 6 — PR3: Vehicle Out-of-Rules Alert (Task 3)

Vertical slice: schema-faithful out-of-rules computation + UI alert.

Files (modified):

- `app/Http/Controllers/Admin/VehicleController.php`
  - Add private method `vehicleRuleViolations(Vehicle $v): array` that returns reasons for: `year < 2000`, `category->pricingRules->isEmpty()`, `status === VehicleStatus::Maintenance || VehicleStatus::Inactive`. Use enum case comparisons, not string literals.
  - In `index()`, eager load `category.pricingRules`. After paginate, append `out_of_rules` and `out_of_rules_reasons` per item via a `through()` callback or by mapping the paginator's `setCollection`.
- `resources/js/pages/admin/vehicles/index.tsx`
  - Extend `Vehicle` type with `out_of_rules?: boolean; out_of_rules_reasons?: string[]`.
  - Insert a banner above the table when any row is `out_of_rules`, listing count and a "Klik baris untuk detail" hint. Use `border-amber-gold/40 bg-pale-amber text-navy-blue` to match tokens.
  - Add a per-row badge (small inline-flex pill in the Status column) when `out_of_rules` is true with tooltip text from `out_of_rules_reasons.join(', ')`.

Files (new tests):

- `tests/Feature/Admin/VehicleOutOfRulesTest.php` — four scenarios:
  - `year < 2000` triggers the year reason.
  - Category with zero `PricingRule` triggers pricing reason.
  - Status `Maintenance` triggers status reason.
  - All-clear vehicle has empty reasons + `out_of_rules=false`.

Success criteria:

- `php artisan test --filter=VehicleOutOfRulesTest --compact` passes.
- `npm run build` and `npx tsc --noEmit` pass.
- N+1 sanity: load `/admin/vehicles` and verify only one query for `pricing_rules` thanks to `with(['category.pricingRules'])`.

Dependencies: none (independent of Phase 1-5 component work).

## Phase 7 — PR3: Auth Hardening (Task 7)

Vertical slice: race-safe role fallback + auth smoke tests + deploy doc.

Files (modified):

- `app/Http/Controllers/DashboardRedirectController.php`
  - Replace the `default => abort(403)` arm with: if `! $user->hasAnyRole(array_map(fn ($c) => $c->value, UserRole::cases()))`, then attempt `$user->assignRole(UserRole::Customer->value)` inside `try { ... } catch (QueryException) { /* swallow duplicate-key */ }`, then `redirect()->route('catalog.index')`. Log a warning with the user id and the request id for observability.

Files (new):

- `tests/Feature/Auth/AuthRoutingSmokeTest.php`
  - GET `/login` returns 200.
  - GET `/register` returns 200.
  - POST `/register` happy path creates user with `customer` role and redirects to `/catalog`.
  - Authenticated user without any role hits `/dashboard` and is redirected to `/catalog` after fallback assignment (no 403).
- `docs/DEPLOY.md`
  - Checklist: `php artisan optimize:clear`, `php artisan route:cache`, `php artisan permission:cache-reset`, `npm run build`, `php artisan wayfinder:generate` (only if helper exists). Include canonical `APP_URL`/`SESSION_DOMAIN` notes.

Success criteria:

- `php artisan test --filter=AuthRoutingSmokeTest --compact` passes.
- No `QueryException` bubbles when two requests race the role assignment (covered by try/catch).
- `docs/DEPLOY.md` exists with the four checklist items above.

Dependencies: none.

## Phase 8 — PR3: Visual Polish Pass (Task 8 remainder)

Vertical slice: standardize remaining icon-button alignment outside Phase 2 scope.

Files (modified):

- Touched only when the file has icons inside buttons that still use `mr-1` or `mr-2 h-4 w-4` after Phase 2/5. Scope is restricted to:
  - `resources/js/pages/admin/vehicles/index.tsx` (action column buttons).
  - `resources/js/pages/dashboards/admin.tsx` (already partially done in Phase 2; final sweep).
  - `resources/js/pages/admin/payments/index.tsx` (already partially done in Phase 2; final sweep).
  - `resources/js/pages/driver/dashboard.tsx` (after notification removal).
  - Any other touched-in-this-PR file. Do not bulk-rewrite untouched files.

Success criteria:

- A grep across the four files above for `mr-1 h-4 w-4` and `mr-2 h-4 w-4` returns zero hits inside button children.
- `npm run build` and `npx tsc --noEmit` pass without unused-import errors.

Dependencies: Phase 2, 5, 6 changes landed.

## Phase 9 — Verification + PR Splits

Goal: validate full surface, capture screenshots, split commits into 3 PRs as required by the SPEC.

Steps:

1. Run the full Pest filter set:
   - `php artisan test --filter=DashboardOrderingTest --compact`
   - `php artisan test --filter=DashboardActiveRentalsTest --compact`
   - `php artisan test --filter=VehicleOutOfRulesTest --compact`
   - `php artisan test --filter=DriverPaginationTest --compact`
   - `php artisan test --filter=NotificationDerivationTest --compact`
   - `php artisan test --filter=ActiveOrderHeroTest --compact`
   - `php artisan test --filter=AuthRoutingSmokeTest --compact`
   - `php artisan test --compact` (full suite)
2. Run frontend gates:
   - `npx tsc --noEmit`
   - `npm run lint:check`
   - `npm run build`
3. Capture Playwright screenshots for: admin dashboard quick actions, payment proof modal, vehicles out-of-rules banner + badge, customer catalog CTA on mobile and desktop, `/drivers` 6-card pagination, customer notification bell open state, driver active order hero (active + empty), and login/register smoke.
4. Split into PRs against `feat/urban8-ux-uplift`:
   - PR1: dashboard polish — Phases 2 + 3 + the parts of Phase 8 they touch.
   - PR2: notification + driver hero — Phases 4 + 5 + Phase 1 primitives that they consume.
   - PR3: admin alerts + auth hardening + final polish — Phases 6 + 7 + Phase 8 remainder.

Success criteria:

- All Pest filters pass; full suite passes; type-check passes; lint passes; build succeeds.
- Three PRs are open with concise titles and changelog notes referencing the SPEC tasks.
- Screenshots attached to each PR.

Dependencies: all prior phases.

## Risks and Mitigations

- Spatie permission cache lag in production. Mitigation: documented in `docs/DEPLOY.md` (Phase 7).
- Cache busting for derived notifications. Mitigation: cache key is per-customer with 60s TTL; deriver is pure, no external IO. Reset on order/payment status change is a follow-up if real-time behavior is needed.
- N+1 on vehicle index. Mitigation: `with(['category.pricingRules'])` plus a Pest assertion of bounded query count if regression risk grows.
- Headless UI v2 import shape mismatch. Mitigation: pinned to flat imports per SPEC; verified `@headlessui/react@^2.2.10` is installed.
- Type drift on `SharedData.notifications`. Mitigation: extend `InertiaConfig.sharedPageProps` and add a dedicated `notification.ts` type re-exported from `resources/js/types/index.ts`.
- Vehicles paginator + `through()` returning model attributes vs raw arrays. Mitigation: keep the paginator instance and use `setCollection($paginator->getCollection()->map(fn ($v) => $base + ['out_of_rules' => ..., 'out_of_rules_reasons' => ...]))` to preserve pagination metadata.
- Driver hero illustration assets may not exist for all categories. Mitigation: `lib/vehicle-image.ts` falls back through three tiers ending at `/images/landing/fleet-side.jpg`, which exists.

## Out of Scope (Explicitly Deferred)

- New `notifications` DB table and persistence model.
- Mark-as-read endpoint for notifications.
- Mobile bell parity.
- New `preserveScroll` usages anywhere.
- Color/theme changes beyond token-aligned utilities.
- Refactors outside the touched files.

## Final Acceptance Snapshot

- All Pest filters listed in the SPEC pass; full suite passes.
- `npm run build` and `npx tsc --noEmit` pass.
- "Sewa Aktif" KPI count matches the inclusive enum set on a seeded fixture.
- "Lihat Bukti" opens an image-only Headless UI modal in admin dashboard and admin payments.
- `/admin/vehicles` shows banner and per-row badge for at least one out-of-rules vehicle on a seeded fixture.
- VehicleCard CTA is fit-content with responsive label.
- `/drivers` paginates 6 cards.
- Customer header desktop order is `nav | bell | avatar`; bell shows derived items and empty state.
- Driver dashboard has hero at top, no `Notifikasi Terbaru` card, and links to order detail.
- `/dashboard` never returns 403 for authenticated users without a role; they are auto-assigned `customer` and redirected to `/catalog`.
- `docs/DEPLOY.md` checklist exists.
