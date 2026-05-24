# URBAN 8 — CHANGELOG

## [2026-05-24] - backend - Rental Pricing Duration Fallback & Test Fixes

- Type: fix
- Area: backend
- Summary: Implemented fallback in `RentalPricingService` to use the highest duration pricing rule if a customer books beyond the maximum configured range. Fixed existing feature test failures by correcting route-model binding URLs (`order_number` instead of `id`) and updating registration passwords to satisfy strength validation.
- Risk: low
- Docs: CHANGES/2026-05-24-rental-pricing-duration-fallback.md

## [2026-05-24] - fullstack - Admin Pricing & Shuttle Tariff: Edit Action, Search & Filter

- Type: feat | refactor
- Area: frontend, backend, admin
- Summary: Tambah action Edit (modal) untuk Pricing Rules, Overtime Penalty, dan Shuttle Tariff. Refresh UI/UX kedua halaman dengan card lebih elegan, ikon konsisten, badge status, dan empty state yang lebih informatif. Daftar data sekarang mendukung pencarian (nama kategori untuk pricing, area asal/tujuan untuk shuttle) dan filter kategori + unit sewa untuk pricing. Backend `PricingRuleController@index` dan `ShuttleTariffController@index` menerima query `search`, `category_id`, `rental_unit` dan mengembalikan filter aktif ke Inertia props.
- Risk: low
- Files:
    - `app/Http/Controllers/Admin/PricingRuleController.php`
    - `app/Http/Controllers/Admin/ShuttleTariffController.php`
    - `resources/js/pages/admin/pricing/index.tsx`
    - `resources/js/pages/admin/shuttle-tariffs/index.tsx`

## [2026-05-24] - auth - Strengthen Register Password Validation

- Type: fix
- Area: backend, frontend, auth
- Summary: Aturan password Fortify ditingkatkan menjadi minimal 8 karakter, kombinasi huruf besar/kecil, dan minimal satu simbol (berlaku untuk register, reset, dan update password). Form register menampilkan helper text aturan dan memunculkan error `password_confirmation` yang sebelumnya tidak terlihat.
- Risk: low
- Files:
    - `app/Actions/Fortify/PasswordValidationRules.php`
    - `resources/js/pages/auth/register.tsx`

## [2026-05-24] - frontend - Fix Pricing Calculator: Show Discount Breakdown

- Type: fix
- Area: frontend
- Summary: Catalog booking calculator kini menampilkan breakdown harga yang konsisten dengan invoice: subtotal, diskon (%), surcharge luar kota, dan total. Admin pricing rules kini menampilkan kolom Diskon + Harga Aktual, serta field input diskon dalam persen.
- Risk: low
- Docs: CHANGES/2026-05-24-pricing-discount-calculator-fix.md

## [2026-05-24] - docs - Guide Book v1.2 Documentation Update

- Type: docs
- Area: shared
- Summary: Updated GUIDE_BOOK.md and GUIDE_BOOK_PRESENTASI.md to reflect actual current application state (v1.2). Key updates include: shuttle order flow via /shuttle navigation, order cancellation (rental + shuttle), driver portal with in-app notifications and status toggle, admin settings page, dashboard chart trends with CSV export, vehicle availability check with auto-upgrade, and corrected FAQ/roadmap entries.
- Risk: low
- Docs: CHANGES/2026-05-24-guide-book-v12-update.md

## [2026-05-24] - fullstack - Shuttle Orders UI Redesign & Driver Layout Spacing Fixes

- Type: feat | refactor | fix
- Area: frontend, backend, shared
- Summary: Redesigned customer shuttle orders pages (create, list, detail) to use the premium catalog/orders UI styling (using HSL colors, smooth transitions, card layouts). Updated routing to route shuttle booking directly to `/shuttle` with a permanent 301 redirect for the old `/customer/shuttle-orders/create` URL. Also fixed mobile topbar inside `DriverLayout` to remain stuck/fixed on scroll by removing `overflow-hidden` from the phone container, and compacted spacing/text sizes to make it neat.
- Risk: low
- Docs: CHANGES/2026-05-24-shuttle-orders-redesign.md

## [2026-05-23] - fullstack - Driver Portal Layout and Route Cache Fixes

- Type: fix
- Area: shared, docker
- Summary: Fixed 500 error on `/driver/orders` in Docker dev env. Root cause: anonymous vendor volume had a stale Composer classmap (`--classmap-authoritative`) missing `Driver\OrderController` which was added after image build. Hotfix: copied updated classmap into container. Long-term fix: removed `--classmap-authoritative` from `Dockerfile.dev`, added Composer binary to runtime image, and added auto-dump in `entrypoint.sh` for `APP_ENV=local`. Also fixed mobile topbar white corner gaps in `DriverLayout`.
- Risk: low
- Docs: CHANGES/2026-05-23-driver-portal-fixes.md

## [2026-05-10] - fullstack - Receipt Statement Layout + Admin Support/Booking UX

- Type: feat | fix
- Area: frontend, backend, admin, receipt
- Summary: Updated receipt print layout to statement paper size and expanded receipt metadata (nama pemesan, tarif waktu, jumlah durasi). Added quick action button "Update Status" on Admin Dashboard Recent Bookings to jump to order lifecycle page. Moved branding logo from admin sidebar to TopHeader left section. Wired sidebar Support button to WhatsApp link using Settings `company_phone` (fallback to Settings page when unset).
- Risk: low
- Files:
    - `resources/js/pages/receipts/show.tsx`
    - `app/Http/Controllers/ReceiptController.php`
    - `resources/js/components/dashboard/RecentBookingsTable.tsx`
    - `resources/js/components/dashboard/TopHeader.tsx`
    - `resources/js/layouts/admin-layout.tsx`

## [2026-05-10] - fullstack - Admin Dashboard Realtime Chart & Export + Order Detail Fixes

- Type: feat | fix
- Area: backend, frontend, admin
- Summary: Dashboard TrendChart kini pakai data realtime dari DB (monthly rentals vs. revenue, range 6m/12m) via `DashboardTrendService`. Tombol Export generate CSV (UTF-8 BOM, streamed) lewat `DashboardTrendExportController`. Fixed `mtd_revenue` memakai status salah (`verified` → `paid`). Selain itu, perbaiki 404 di tabel order admin dan widget Quick Verification dashboard dengan scoped route-model binding `{rentalOrder:order_number}`, dan `Lihat Bukti` kini prefix `/storage/`.
- Risk: low
- Files:
    - `app/Services/Dashboard/DashboardTrendService.php` (new)
    - `app/Http/Controllers/Admin/DashboardController.php`
    - `app/Http/Controllers/Admin/DashboardTrendExportController.php` (new)
    - `app/Http/Controllers/Admin/OrderLifecycleController.php`
    - `app/Http/Controllers/Admin/PaymentVerificationController.php`
    - `routes/web.php`
    - `resources/js/components/dashboard/TrendChart.tsx`
    - `resources/js/pages/dashboards/admin.tsx`
    - `resources/js/pages/admin/orders/index.tsx`
    - `resources/js/pages/admin/orders/show.tsx`
    - `resources/js/routes/**` (wayfinder regenerated)

## [2026-05-10] - fullstack - Payment Receipt Confirmation Modal

- Type: feat
- Area: frontend, customer
- Summary: Added a confirmation modal when uploading payment receipts. Includes image preview for images and file info for PDFs, ensuring users verify their upload before submission. Added loading states for the upload process.
- Risk: low
- Docs: CHANGES/2026-05-10-payment-confirmation-modal.md

## [2026-05-10] - fullstack - URBAN 8 Rebrand & Multi-Step Booking

- Type: feat | refactor
- Area: frontend, backend, shared
- Summary: Complete rebrand from FleetGo to URBAN 8 across all layouts, pages, and components. Integrated logo universally. Implemented multi-step booking modal (Detail → Booking → Driver Selection) in catalog. Fixed missing customer.orders.show route and multiple broken route references. Added comprehensive feature tests.
- Risk: medium
- Docs: CHANGES/2026-05-10-urban8-rebrand.md

## [2026-05-09] - frontend - Catalog UI Improvements & Auth Flow Refinement

- Type: feat | refactor
- Area: frontend, catalog, auth
- Summary: Enhanced Navy Blue brand presence in catalog and mobile navigation. Fixed layout overlap in sidebar. Refined authentication flow for booking and removed customer dashboard in favor of direct catalog access.
- Risk: low
- Docs: CHANGES/2026-05-09-catalog-auth-refinement.md

## [2026-05-09] - frontend - Admin Dashboard Modal Refactor & Color Revamp

- Type: refactor
- Area: frontend, admin, catalog
- Summary: Revamped color palette to premium SaaS design system and refactored Admin CRUD pages (Vehicles, Categories, Drivers) to use streamlined modals.
- Risk: low
- Docs: CHANGES/2026-05-09-admin-modal-refactor.md

## [2026-05-09] - backend + frontend - Phase 2–5 MVP Implementation

- Type: feat
- Area: frontend, backend, shared
- Summary: Full implementation of Phase 2 (Admin Master Data), Phase 3 (Booking Engine), Phase 4 (Payment & Order Lifecycle), and Phase 5 (Dashboard, Reports, Audit) of the Rent Car MVP.
- Risk: medium
- Docs: CHANGES/2026-05-09-phase-2-5-mvp.md
