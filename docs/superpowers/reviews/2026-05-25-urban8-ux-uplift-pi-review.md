# Urban8 UX Uplift — Reviewer Audit (post-merge)

Source: `subagent reviewer` run `a9cc47f3` against local `main` after merging the
three feature branches (`feat/urban8-ux-pr1-dashboard-polish`,
`feat/urban8-ux-pr2-notifications-driver-hero`,
`feat/urban8-ux-pr3-vehicle-rules-auth-deploy`).

## Review

### Correct (verified against plan)

- **app/Http/Controllers/Admin/DashboardController.php:53-60** — `active_rentals` whereIn `[Paid, ReadyToDispatch, Ongoing, WaitingOvertimePayment]` matches plan §86 exactly. Read-only count, no lifecycle change.
- **app/Http/Controllers/Admin/DashboardController.php:115-127** — `$quickVerifications` and `$pendingCash` switched to `latest()`. Matches plan §85.
- **app/Http/Controllers/Admin/VehicleController.php:22,36-55,112-129** — eager loads `category.pricingRules`, returns plain arrays via `through()`, computes `vehicleRuleViolations` using enum case comparisons (`VehicleStatus::Maintenance`, `Inactive`) and `pricingRules->isEmpty()`. Matches plan §208-210.
- **app/Http/Controllers/Customer/DriverController.php:26** — `paginate(6)`. Matches plan §121. `DriverPaginationTest` confirms last_page=2 with 7 drivers.
- **app/Http/Controllers/Driver/DashboardController.php:36-37,42-64,95** — `orderByRaw('CASE WHEN status = ? THEN 0 ELSE 1 END', [Ongoing])` → `orderBy('start_at')`, mapped payload includes `vehicle.images` and `vehicle.category.name`, `featuredOrder = $mappedAssignedOrders->first()`. Matches plan §174-178. Business filter `whereNotIn(['status', [Completed, Cancelled]])` at L34 is preserved (no lifecycle drift).
- **app/Http/Controllers/DashboardRedirectController.php:36-43** — try/catch around `assignRole(Customer)` swallows `QueryException`, logs warning. Matches plan §239 race-safe wording.
- **app/Http/Middleware/HandleInertiaRequests.php:51-63** — `Inertia::defer(...)` wrapping role-gated (`UserRole::Customer` + non-null `customer` relation) `Cache::remember` (60s TTL, per-customer key). Matches plan §138-145.
- **app/Services/Notifications/CustomerNotificationDeriver.php:42-46** — pure function, returns plain array, sorted desc by `created_at`, capped to 8 via `take(8)`. Matches plan §62 and §157. NotificationDerivationTest covers cap and titles.
- **resources/js/components/ProofImageModal.tsx:1-6** — flat Headless UI v2 imports `Dialog, DialogPanel, Transition, TransitionChild` per plan §32 SPEC pin.
- **resources/js/components/customer/NotificationBell.tsx:1,27,50-53** — `Popover/PopoverButton/PopoverPanel`, empty state "Belum ada notifikasi.". Customer-only context: middleware role-gates to Customer + `customer-layout.tsx:174` renders only when `auth?.user`. Effective role-gating preserved.
- **resources/js/components/driver/ActiveOrderHero.tsx:42-55,57-118** — empty-state card when `order` is null; otherwise hero with vehicle image (via `vehicleImage`), status pill, customer name, schedule, address, "Lihat Detail" → `/driver/orders/{order_number}`. Matches plan §185.
- **resources/js/lib/vehicle-image.ts:14-28** — three-tier fallback `images[0]` (with `/storage/` prefix when not absolute) → `/images/mockup/{slug(category)}.png` → `/images/landing/fleet-side.jpg`. Matches plan §187.
- **resources/js/layouts/customer-layout.tsx:172-176** — bell sits as first child of the right-side block (after `</nav>` and inside the `border-l` group), then avatar, then CTA. Matches plan §25 ("nav | bell | avatar").
- **resources/js/pages/admin/payments/index.tsx:4,69-74,375-388,405,416,429,441,600,608-611** — modal import, `proofModalUrl` state, button replacing `<a target=_blank>`, `leadingIcon` props, modal mounted at the bottom. Matches plan §90-91.
- **resources/js/pages/dashboards/admin.tsx:16,28,110-115,199-203,325-336,400,419-422** — same wiring; KPI bound to `adminStats.active_rentals ?? adminStats.in_use_vehicles ?? 0`. Matches plan §88-91.
- **resources/js/pages/admin/vehicles/index.tsx:2,24-25,61-63,285-300,331-339** — `out_of_rules` field on row type; banner with `border-amber-gold/40 bg-pale-amber text-navy-blue` tokens; per-row badge with tooltip from `out_of_rules_reasons.join(' • ')`. Matches plan §211-214.
- **resources/js/pages/driver/dashboard.tsx** — `Bell` import and "Notifikasi Terbaru" `<section>` removed; `<ActiveOrderHero order={featuredOrder ?? assignedOrders[0] ?? null} />` rendered after the status banner. Matches plan §180-183.
- **resources/js/components/customer/VehicleCard.tsx:222-230** — CTA classes match plan §117 verbatim plus benign `active:translate-y-0`; mobile `Pilih`, desktop `Lihat Detail`; `aria-label` preserved.

### Hard-constraint check (UI/UX uplift only)

- **Status lifecycle**: untouched. `active_rentals` is a read-only count; out-of-rules is a read-only computation; driver `whereNotIn([Completed, Cancelled])` predates the change.
- **Database schema**: no new migration in scope.
- **Authorization policy**: `DashboardRedirectController` now auto-assigns `Customer` to a user with no known role instead of `abort(403)`. Plan explicitly authorizes it.
- **Business flow**: no write paths added beyond the role assignment above.

### Concerns

- **DashboardRedirectController.php:38-47** (concern) — on a `QueryException`, control falls through and a second log line still says `'Assigned customer fallback role'`. Observability noise; flow remains correct. (Resolved by follow-up commit `cab03ef`+next.)
- **DashboardRedirectController.php:39-46** (concern) — plan §239 asks for `user id and request id` in the log; implementation only logs `user_id` and `error`. Drift from plan; not a flow risk. (Resolved by follow-up commit.)
- **HandleInertiaRequests.php:54-63** (concern) — cache key is per-`customer.id` with 60s TTL; no eviction on order/payment status change. Plan §315 marks this as a deferred follow-up.
- **CustomerNotificationDeriver.php:18-22** (concern) — only the latest 10 orders are scanned to feed the 8-item cap. Older payment-rejected/refund items may be invisible for heavy customers.
- **NotificationBell.tsx** (concern) — bell renders inside `customer-layout.tsx`. Role-gating relies on layout placement plus middleware returning `[]` for non-customer roles. Correct in practice; component itself is not role-aware.

### Notes

- **Authorization expansion**: previously `abort(403)` for users with no role; now silent role assignment. Plan acceptance criterion. Operators relying on 403 as a misconfiguration signal will lose that signal.
- **`through()` returns plain arrays, not models** (`VehicleController.php:36-55`). Frontend reads scalar fields only — safe.
- **Verification evidence accepted**: tsc, scoped eslint, build, full pest 129/129. Targeted suites cover contract changes; standalone `DashboardActiveRentalsTest` is folded into `DashboardOrderingTest` (`tests/Feature/Admin/DashboardOrderingTest.php:95-135`).

Overall: no blockers. Two observability concerns on `DashboardRedirectController` are addressed in the post-review fix commit.
