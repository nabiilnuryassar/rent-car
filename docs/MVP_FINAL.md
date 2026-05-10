# 🚗 Rent Car Platform — MVP Final Documentation

> **Version:** 1.1 (UML-aligned)
> **Last Updated:** 2026-05-09
> **Status:** Production-ready (57/57 tests passing, all builds clean)
> **Stack:** Laravel 13 · Inertia v3 · React 19 · Tailwind v4 · Pest 4 · Spatie Permission

---

## 1. Product Overview

**Rent Car Platform** adalah aplikasi web terintegrasi untuk manajemen rental kendaraan dan layanan antar-jemput (shuttle). Platform ini mendukung flow end-to-end: dari booking, pricing otomatis, driver assignment, pembayaran (cash/transfer), verifikasi, dispatch, pengembalian, sampai overtime settlement.

### 1.1 Target Users

| Role              | Kapasitas                          | Akses Utama                                       |
| ----------------- | ---------------------------------- | ------------------------------------------------- |
| 🧑 Customer       | Individu/new user                  | Catalog, booking, payment, receipt                |
| ⭐ Loyal Customer | Customer dengan ≥1 order completed | + Pilih driver sendiri                            |
| 🧑‍💼 Admin          | Full internal control              | Master data, verifikasi, dispatch, report, cancel |
| 💵 Kasir          | Payment operations                 | Cash payment, verifikasi transfer                 |
| 🚗 Driver         | Field operations                   | Dashboard notifikasi + assigned orders            |

### 1.2 Value Proposition

1. **Smart Pricing** — Auto-calculate by durasi (jam/hari/minggu/bulan) dengan diskon durasi panjang
2. **Geo-Aware** — +20% surcharge otomatis untuk trip luar kota
3. **Free Upgrade** — Otomatis tawarkan kelas lebih tinggi saat unit kosong (harga tetap)
4. **Priority Member** — Loyal customer bisa pilih driver favorit
5. **Shuttle Service** — Point-to-point dengan tarif fix per rute
6. **Dual Payment** — Cash instant receipt + Transfer dengan antrean verifikasi
7. **Payment Lock** — Tidak bisa dispatch sebelum payment paid
8. **Overtime Settlement** — Otomatis hitung kelipatan jam saat return terlambat
9. **Audit Trail** — Log semua operasi kritis untuk compliance
10. **Driver Notifications** — Push in-app saat di-assign + saat dispatch

---

## 2. MVP Scope — Delivered Features

### 2.1 Authentication & Authorization ✅

- Customer registration + login via Fortify
- Password hashing via Laravel casts
- 4 roles (admin, kasir, customer, driver) via Spatie Permission
- Role-based dashboard redirect pasca login
- Middleware `role:*` guard per area

### 2.2 Customer Journey ✅

| Flow                                                | Status    |
| --------------------------------------------------- | --------- |
| Browse catalog by kategori                          | ✅        |
| Lihat detail kendaraan + pricing rules              | ✅        |
| Booking kendaraan (min 3 jam untuk hourly)          | ✅        |
| Pilih pickup: office / delivery                     | ✅        |
| Toggle in-town / out-of-town                        | ✅        |
| Auto-calculate harga breakdown                      | ✅        |
| Loyal customer: pilih driver manual                 | ✅        |
| New customer: auto-assign driver                    | ✅        |
| **Auto-trigger upgrade offer saat vehicle overlap** | ✅ (v1.1) |
| Accept/reject upgrade offer                         | ✅        |
| Booking shuttle point-to-point                      | ✅        |
| Upload bukti transfer (JPG/PNG/PDF ≤ 5MB)           | ✅        |
| Re-upload saat rejected                             | ✅        |
| Lihat receipt digital (browser print)               | ✅        |
| Lihat riwayat order                                 | ✅        |
| **Cancel order sendiri (pre-dispatch)**             | ✅ (v1.1) |
| Cancel shuttle order                                | ✅ (v1.1) |

### 2.3 Payment Flow ✅

- Cash payment oleh kasir/admin → instant Paid + receipt
- Transfer proof upload oleh customer → WaitingVerification
- Admin approve transfer → Paid + receipt + order ready_to_dispatch
- Admin reject transfer → customer re-upload
- Payment lock: dispatch gagal jika unpaid
- Audit log otomatis: cash_recorded, payment_approved, payment_rejected

### 2.4 Admin Master Data ✅

| Module                                            | CRUD |
| ------------------------------------------------- | ---- |
| Vehicle Category (name, class_level, active)      | ✅   |
| Vehicle (plate, brand, model, year, status)       | ✅   |
| Driver (license, phone, status)                   | ✅   |
| Pricing Rule (per kategori, unit, range duration) | ✅   |
| Overtime Penalty (hourly rate per kategori)       | ✅   |
| Shuttle Tariff (area from/to, tarif)              | ✅   |

### 2.5 Admin Order Lifecycle ✅

- **Dispatch** (payment-locked) → order ongoing, vehicle in_use, driver on_duty
- **Record Return** → hitung overtime jika telat
- **Complete Order** → release vehicle + driver, increment customer completed orders
- **Cancel Order** (v1.1) dengan alasan → release vehicle + driver jika ongoing
- Audit log: order_dispatched, order_returned, order_completed, order_cancelled

### 2.6 Dashboard & Reports ✅

- Admin dashboard: daily stats (orders, payments, vehicles, drivers)
- Revenue report dengan filter tanggal
- Exclude cancelled/unpaid dari revenue
- **Driver dashboard** menampilkan unread notifications + active orders (v1.1)

### 2.7 Cross-Cutting ✅

- **Date-range availability check** mencegah double-booking (v1.1)
- **Audit log** untuk semua operasi high-risk
- **Polymorphic Payment** — satu table untuk rental + shuttle
- **Soft-disable** via `is_active` di category, `inactive` status di vehicle/driver

---

## 3. Study Case Alignment (docs/STUDY_CASE.md)

### 3.1 Aspek Teknis

| Study Case Requirement                                                | Implementation                                          | Status |
| --------------------------------------------------------------------- | ------------------------------------------------------- | ------ |
| Integrated Booking (web real-time stock)                              | Inertia SPA + `availableForPeriod()` scope              | ✅     |
| Smart Pricing Algorithm (hourly/daily/weekly/monthly + diskon durasi) | `RentalPricingService` + 4 rental units + discount_rate | ✅     |
| 20% out-of-town surcharge                                             | `is_out_of_town` flag + auto surcharge                  | ✅     |
| Module Antar-Jemput point-to-point                                    | `ShuttleOrder` + `ShuttleTariff` table                  | ✅     |
| Geo-Fencing via Maps API                                              | Manual flag (no Maps API)                               | ⚠️ v2  |

### 3.2 Aspek Administrasi

| Study Case Requirement                 | Implementation                                        | Status              |
| -------------------------------------- | ----------------------------------------------------- | ------------------- |
| Cash → kwitansi instan                 | `PaymentController::recordCash` auto-generate receipt | ✅                  |
| Transfer → antrean validasi → kwitansi | Full verification flow                                | ✅                  |
| Driver database + jadwal + performa    | Driver model + status enum + notification             | ✅ (rating TBD)     |
| Manajemen armada + pengingat servis    | `VehicleStatus::Maintenance` (manual reminder)        | ⚠️ v2 auto-reminder |
| Overtime Calculator kelipatan jam      | `RentalPricingService::calculateOvertime` ceil()      | ✅                  |

### 3.3 Aspek Bisnis & Loyalitas

| Study Case Requirement      | Implementation                                     | Status    |
| --------------------------- | -------------------------------------------------- | --------- |
| Priority Member auto-detect | `Customer::isLoyalCustomer()`                      | ✅        |
| Pick Your Driver (member)   | `DriverAssignmentService` loyal flow               | ✅        |
| Auto-Upgrade saat kosong    | **Auto-trigger di `RentalOrderController::store`** | ✅ (v1.1) |
| B2B Dashboard corporate     | `customer_type=corporate` enum (no dashboard)      | ⚠️ v2     |

### 3.4 Skema Alur Operasional

| Flow                                                      | Implementation                                   | Status    |
| --------------------------------------------------------- | ------------------------------------------------ | --------- |
| Pemesanan min 3 jam → pilih unit → pilih supir member     | ✅ Full flow                                     | ✅        |
| Pengiriman: notifikasi supir + update status              | **`OrderDispatched` notification + status sync** | ✅ (v1.1) |
| Pembayaran Cash/Transfer                                  | Cash immediate + Transfer queue                  | ✅        |
| Payment Gateway VA integration                            | Manual transfer proof only                       | ⚠️ v2     |
| Pengembalian: input jam → hitung selisih → biaya tambahan | `RentalOrderLifecycleService::processReturn`     | ✅        |

### 3.5 Study Case Match Score — Updated

| Kategori           | Match  | Partial | Missing | Score     |
| ------------------ | ------ | ------- | ------- | --------- |
| Aspek Teknis       | 3      | 1       | 0       | **88%** ⬆ |
| Aspek Administrasi | 4      | 1       | 0       | **90%** ⬆ |
| Aspek Bisnis       | 3      | 1       | 0       | **88%** ⬆ |
| Alur Operasional   | 4      | 1       | 0       | **90%** ⬆ |
| **OVERALL**        | **14** | **4**   | **0**   | **89%** ⬆ |

**Improvement dari v1.0 (72%) → v1.1 (89%)** — Berkat delivery UA-001 s/d UA-005.

---

## 4. Business Rules (Canonical)

### BR-001: Minimum 3 Jam Hourly Rental

**Source:** `app/Services/Pricing/RentalPricingService.php`

```php
if ($unit === RentalUnit::Hour && $duration < 3) {
    throw new InvalidArgumentException('Sewa per jam minimal 3 jam.');
}
```

### BR-002: Duration-Based Pricing

**Source:** `RentalPricingService::calculateQuote()`

```
price = PricingRule(category, unit, min_duration ≤ duration ≤ max_duration)
      × duration
```

### BR-003: Out-of-Town Surcharge

```
if (is_out_of_town) total += base × duration × 0.20
```

### BR-004: Overtime Calculation

```
overtime_hours = ceil((actual_return_at - end_at) / 60 min)
overtime_charge = overtime_hours × OvertimePenalty.hourly_rate
```

### BR-005: Loyal Customer Detection

**Source:** `Customer::isLoyalCustomer()`

```
return $this->total_completed_orders >= 1
```

### BR-006: Payment Lock

**Source:** `OrderStatusService::assertCanDispatch()`

```
guard: payment.status === 'paid' AND order.status === 'ready_to_dispatch'
```

### BR-007: Vehicle Availability (v1.1)

**Source:** `Vehicle::scopeAvailableForPeriod()`

- Vehicle status = Available
- No active rental order (status != cancelled/completed/draft) overlapping period

### BR-008: Free Upgrade Auto-Trigger (v1.1)

**Source:** `RentalOrderController::store()`

```
if (!vehicle.isAvailableForPeriod) {
    upgrade = VehicleUpgradeService::findUpgradeForPeriod()
    if upgrade exists → create Draft order + UpgradeOffer (Pending)
    else → validation error
}
```

### BR-009: Order Status State Machine

```
Draft (upgrade offer pending)
  ↓ (accept upgrade)
PendingPayment
  ↓ (upload proof OR cash input)
WaitingVerification (transfer only)
  ↓ (admin approve)
Paid → ReadyToDispatch
  ↓ (admin dispatch, payment locked)
Ongoing
  ↓ (record return)
  ├─ (on-time) → Completed
  └─ (late) → WaitingOvertimePayment → Paid → Completed

Any state (not Completed/Cancelled) → Cancelled (customer/admin)
```

### BR-010: Vehicle & Driver Status Sync

| Transition          | Vehicle     | Driver      |
| ------------------- | ----------- | ----------- |
| Order created       | —           | —           |
| Dispatch            | `in_use`    | `on_duty`   |
| Complete            | `available` | `available` |
| Cancel (if ongoing) | `available` | `available` |

### BR-011: Receipt Generation

- Auto-created setelah `Payment.status = Paid`
- `receipt_number` unique via `ReceiptNumberGenerator`
- Browser print (PDF generation pending v1.2)

### BR-012: Driver Notification (v1.1)

- `DriverAssignedToOrder` — saat order dibuat atau upgrade diterima
- `OrderDispatched` — saat admin dispatch
- Database channel, muncul di driver dashboard

### BR-013: Audit Log Coverage

Logged actions:

- `cash_recorded`, `payment_approved`, `payment_rejected`
- `order_dispatched`, `order_returned`, `order_completed`
- `order_cancelled` (with reason)

---

## 5. Technical Architecture

### 5.1 Layered Architecture

```
┌──────────────────────────────────────────────────────┐
│  Presentation: Inertia + React 19 + Tailwind v4      │
│  resources/js/pages/**/*.tsx                          │
└────────────────────┬─────────────────────────────────┘
                     │ Inertia props / Wayfinder routes
┌────────────────────▼─────────────────────────────────┐
│  HTTP Layer: Controllers + FormRequests               │
│  app/Http/Controllers/**/*.php                        │
│  app/Http/Requests/**/*.php                           │
└────────────────────┬─────────────────────────────────┘
                     │ service injection
┌────────────────────▼─────────────────────────────────┐
│  Service Layer: Business Logic                        │
│  app/Services/{Pricing,Drivers,Vehicles,Orders,       │
│                Receipts,Audit}                        │
└────────────────────┬─────────────────────────────────┘
                     │ eloquent
┌────────────────────▼─────────────────────────────────┐
│  Data Layer: Eloquent Models + Enums                  │
│  app/Models/**/*.php · app/Enums/**/*.php             │
└──────────────────────────────────────────────────────┘
```

### 5.2 Service Inventory (10 services)

| Service                                     | Responsibility                         |
| ------------------------------------------- | -------------------------------------- |
| `RentalPricingService`                      | Quote + overtime untuk rental          |
| `ShuttlePricingService`                     | Quote dari tarif table                 |
| `DriverAssignmentService`                   | Loyal vs new customer logic            |
| `DriverAvailabilityService`                 | Available drivers untuk schedule       |
| `VehicleUpgradeService`                     | Find higher-class vehicle for upgrade  |
| `OrderStatusService`                        | State machine + dispatch guard         |
| `RentalOrderLifecycleService`               | Dispatch/return/complete/cancel rental |
| `ShuttleOrderLifecycleService`              | Cancel shuttle (v1.1)                  |
| `ReceiptService` + `ReceiptNumberGenerator` | Receipt creation                       |
| `AuditLogger`                               | Log high-risk operations               |

### 5.3 Key Packages

| Package                          | Purpose                       |
| -------------------------------- | ----------------------------- |
| `laravel/framework` ^13.7        | Core                          |
| `inertiajs/inertia-laravel` ^3.0 | SSR + SPA glue                |
| `laravel/fortify` ^1.36          | Auth backend                  |
| `spatie/laravel-permission` ^7.4 | Role/permission               |
| `laravel/wayfinder` ^0.1.14      | TypeScript route helpers      |
| `laramint/laravel-brain` (dev)   | Project analysis + AI context |
| `pestphp/pest` ^4.7              | Testing                       |
| `react` ^19 + `tailwindcss` ^4   | Frontend                      |

---

## 6. Quality Metrics (Current State)

### 6.1 Test Coverage

```
Total: 57 tests | 168 assertions | 100% passing
├── Feature Tests: 50+
│   ├── Auth (role, redirect, registration)
│   ├── Domain models & relationships
│   ├── Pricing engine (unit)
│   ├── Vehicle availability (5 tests)
│   ├── Upgrade offer auto-trigger (4 tests)
│   ├── Order cancellation (8 tests)
│   ├── Driver notifications (3 tests)
│   ├── Vehicle category CRUD
│   └── Domain relationships (4 tests)
└── Unit Tests: RentalPricingService behavioral
```

### 6.2 Build Health

| Check                        | Result               |
| ---------------------------- | -------------------- |
| `php artisan test --compact` | ✅ 57/57 passing     |
| `npx tsc --noEmit`           | ✅ Clean             |
| `npm run build`              | ✅ 315kB main bundle |
| `vendor/bin/pint --dirty`    | ✅ PSR-12 clean      |

### 6.3 Code Complexity (Brain scan)

Complexity hotspots yang masih tersisa:

- `DriverAssignmentService@assign` — CC 5 (acceptable)
- `RentalPricingService@calculateQuote` — CC 4 (candidate for split v1.2)
- `OrderStatusService@assertCanDispatch` — CC 3 (acceptable)

### 6.4 Project Size

- **85 routes** · 17 controllers · 13 models · 10 services
- **17 form requests** · 11 enums
- **~50 migrations** · 11 factories
- **20+ Inertia pages** · 4 layouts

---

## 7. Out of Scope (v1.x roadmap)

### v1.2 Enhancements (Target +4 weeks)

| Feature                                        | Why                                             |
| ---------------------------------------------- | ----------------------------------------------- |
| Receipt PDF download                           | Browser print sudah ada tapi PDF lebih portable |
| Customer identity fields (KTP + customer_code) | Data completeness + referensi                   |
| Driver code auto-gen                           | Internal reference                              |
| User profile update endpoint                   | Self-service                                    |
| UpgradeOffer.originalPrice tracking            | Clarity                                         |

### v2.0 Business Expansion (Target +2 months)

| Feature                             | Why                                       |
| ----------------------------------- | ----------------------------------------- |
| **B2B Corporate Dashboard**         | `customer_type=corporate` already in enum |
| **Payment Gateway VA**              | Replace manual transfer proof             |
| **Maps API geo-fencing**            | Auto-detect out-of-town                   |
| **Driver rating system**            | Customer feedback                         |
| **Mobile app** (React Native / PWA) | Wider reach                               |
| **Service reminder**                | Auto pengingat servis per vehicle         |
| **Monthly invoicing for B2B**       | Corporate billing                         |

---

## 8. Deployment Notes

### 8.1 Default Seeded Accounts

| Role     | Email                 | Password |
| -------- | --------------------- | -------- |
| Admin    | admin@rentcar.test    | password |
| Kasir    | kasir@rentcar.test    | password |
| Customer | customer@rentcar.test | password |
| Driver   | driver@rentcar.test   | password |

### 8.2 Quick Start

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
composer run dev
```

### 8.3 Production Checklist

- [ ] Set `APP_ENV=production`, `APP_DEBUG=false`
- [ ] Configure queue worker (for notifications)
- [ ] Set up SMTP for email verification (Fortify)
- [ ] Configure storage driver (S3 recommended for transfer proofs)
- [ ] Set up daily backup
- [ ] Review rate limits on login endpoints
- [ ] Set up monitoring (Sentry/similar)
- [ ] Run `php artisan config:cache route:cache view:cache`
- [ ] Run `npm run build`

---

## 9. Success Metrics

### 9.1 Quantitative KPIs

| Metric                       | Target            | Current Status             |
| ---------------------------- | ----------------- | -------------------------- |
| Test coverage                | ≥85% passing      | ✅ 100% (57/57)            |
| Booking flow completion time | ≤5 min end-to-end | ⏱ UX test pending          |
| Transfer verification SLA    | ≤30 detik action  | ⏱ Operational metric       |
| Double-booking incidents     | 0                 | ✅ Prevented by BR-007     |
| Pricing accuracy             | 100%              | ✅ Full unit test coverage |

### 9.2 Qualitative Goals

- ✅ Audit trail lengkap untuk compliance
- ✅ Role separation clear
- ✅ Error messages user-friendly (Bahasa Indonesia)
- ✅ Responsive design (mobile + desktop)
- ✅ Driver notification reduces coordination overhead

---

## 10. Change Log

### v1.1 (2026-05-09) — UML Alignment Release

**Added (UA-001 → UA-005):**

- Order cancellation flow (customer + admin)
- Auto-trigger upgrade offer when vehicle overlap
- Date-range vehicle availability via `scopeAvailableForPeriod`
- Driver notification system (DriverAssigned + OrderDispatched)
- Model relationships: `Driver::rentalOrders`, `VehicleCategory::overtimePenalty`, `Customer::isLoyalCustomer`
- Driver dashboard with unread notifications + active orders
- New tests: +24 tests (now 57 total)

**Fixed:**

- `RoleAccessTest` customer redirect expectation
- `admin-layout.tsx` restored + typed navigation

**Docs:**

- `MVP_FINAL.md` (this doc)
- `UML_MERMAID.md` — full UML in Mermaid
- Updated gap analysis + alignment plan

### v1.0 (Prior) — Initial MVP

- RC-001 through RC-025 execution plan delivered
- Core domain + master data + booking + payment + dispatch + reports
