# URBAN 8 — CHANGELOG

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
