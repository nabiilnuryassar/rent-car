# UML Alignment Execution Plan

> **Generated:** 2026-05-09  
> **Source:** `docs/superpowers/analysis/uml-gap-analysis.md`  
> **Goal:** Tutup gap antara UML design dan implementasi aktual, prioritas berdasarkan business impact.

---

## Execution Strategy

- **Phase A** — High priority gaps yang mempengaruhi business logic & data integrity
- **Phase B** — Medium priority gaps untuk data completeness & UX
- **Phase C** — Low priority gaps untuk architectural polish (optional)

**Definition of Done per Task:**

- Feature test ditulis dan pass
- `vendor/bin/pint --dirty --format agent` clean
- `php artisan test --compact` pass
- `npx tsc --noEmit` clean (jika ada frontend changes)

---

## Phase A: Critical Business Logic Gaps

### UA-001: Implement Order Cancellation Flow

**Priority:** High  
**Gap:** G-01  
**Tags:** `orders`, `backend`, `frontend`  
**Depends On:** none

**Description:** Tambah kemampuan cancel order untuk customer (sebelum dispatch) dan admin (kapan saja dengan alasan). Cancellation harus mengubah status order, release vehicle & driver reservation, dan log ke audit.

**Implementation:**

1. Tambah method `cancel()` di `RentalOrderLifecycleService` dan buat `ShuttleOrderLifecycleService`
2. Tambah endpoint `POST /customer/rental-orders/{order}/cancel` (customer, hanya jika status ≤ ready_to_dispatch)
3. Tambah endpoint `POST /admin/orders/{order}/cancel` (admin, any status except completed/cancelled)
4. Release vehicle status → available, driver status → available
5. Log cancellation ke AuditLog
6. Update frontend order show page dengan cancel button + confirmation modal

**Acceptance Criteria:**

- Customer bisa cancel order yang belum di-dispatch
- Admin bisa cancel order kapan saja (kecuali completed/cancelled)
- Vehicle & driver status kembali ke available setelah cancel
- Cancelled order tidak bisa di-dispatch
- Audit log mencatat cancellation dengan actor dan reason
- Feature tests cover: customer cancel, admin cancel, cannot cancel after dispatch, cannot cancel completed

---

### UA-002: Auto-Trigger Upgrade Offer During Order Creation

**Priority:** High  
**Gap:** G-02  
**Tags:** `orders`, `pricing`, `backend`, `frontend`  
**Depends On:** none

**Description:** Saat customer membuat rental order dan vehicle yang dipilih tidak available, sistem otomatis cari vehicle kelas lebih tinggi dan tawarkan free upgrade. Saat ini `VehicleUpgradeService` sudah ada tapi tidak dipanggil saat order creation.

**Implementation:**

1. Di `RentalOrderController::store()`, sebelum create order, cek vehicle availability
2. Jika vehicle unavailable, panggil `VehicleUpgradeService::findUpgrade()`
3. Jika upgrade ditemukan, return response dengan upgrade offer (bukan langsung create order)
4. Frontend handle upgrade offer response: tampilkan modal accept/reject
5. Jika accept → create order dengan upgraded vehicle
6. Jika reject → return ke catalog tanpa order

**Acceptance Criteria:**

- Order creation dengan unavailable vehicle otomatis trigger upgrade search
- Upgrade offer ditampilkan ke customer dengan info vehicle baru + harga tetap sama
- Accept upgrade → order dibuat dengan upgraded vehicle
- Reject upgrade → tidak ada order dibuat
- Jika tidak ada upgrade candidate → error message "vehicle unavailable"
- Feature tests cover: auto-trigger, accept, reject, no candidate

---

### UA-003: Implement Date-Range Vehicle Availability Check

**Priority:** High  
**Gap:** G-03  
**Tags:** `backend`, `orders`, `customer`  
**Depends On:** none

**Description:** Saat ini availability hanya berdasarkan `status = available`. Perlu cek apakah vehicle sudah di-book untuk tanggal yang diminta (prevent double-booking).

**Implementation:**

1. Tambah method `scopeAvailableForPeriod($start, $end)` di `Vehicle` model
2. Query: vehicle status = available AND tidak ada rental_order dengan status active (pending_payment → ongoing) yang overlap dengan period
3. Update `CatalogController::index()` untuk accept date filter params
4. Update `RentalOrderController::store()` validation untuk cek availability by date
5. Update catalog frontend untuk tambah date picker filter

**Acceptance Criteria:**

- Vehicle yang sudah di-book untuk tanggal tertentu tidak muncul di catalog untuk tanggal tersebut
- Order creation gagal jika vehicle sudah di-book untuk period yang overlap
- Catalog bisa difilter berdasarkan tanggal rental
- Feature tests cover: available vehicle shown, booked vehicle hidden, overlap rejection

---

### UA-004: Implement Driver Notification System

**Priority:** High  
**Gap:** G-04  
**Tags:** `backend`, `orders`  
**Depends On:** none

**Description:** Kirim notifikasi ke driver saat di-assign ke order baru atau saat order di-dispatch. Gunakan Laravel Notifications (database channel untuk MVP).

**Implementation:**

1. `php artisan make:notification DriverAssignedToOrder`
2. `php artisan make:notification OrderDispatched`
3. Tambah `notifications` table migration (Laravel default)
4. Trigger `DriverAssignedToOrder` di `DriverAssignmentService::assign()`
5. Trigger `OrderDispatched` di `RentalOrderLifecycleService::dispatch()`
6. Tambah notification list di driver dashboard page
7. Tambah `Notifiable` trait ke User model (jika belum)

**Acceptance Criteria:**

- Driver menerima notification saat di-assign ke order
- Driver menerima notification saat order di-dispatch
- Notification muncul di driver dashboard
- Feature tests cover: notification created on assign, notification created on dispatch

---

### UA-005: Add Missing Model Relationships

**Priority:** High  
**Gap:** G-05, G-06  
**Tags:** `backend`  
**Depends On:** none

**Description:** Tambah relationship yang missing di model untuk consistency dengan UML.

**Implementation:**

1. `Driver` model: tambah `public function rentalOrders(): HasMany`
2. `VehicleCategory` model: tambah `public function overtimePenalty(): HasOne`
3. `Customer` model: tambah `isLoyalCustomer(): bool` method (move logic dari DriverAssignmentService)

**Acceptance Criteria:**

- `$driver->rentalOrders` returns collection of rental orders
- `$category->overtimePenalty` returns the overtime penalty
- `$customer->isLoyalCustomer()` returns boolean
- Unit tests verify relationships load correctly

---

## Phase B: Data Completeness & UX

### UA-006: Add Customer Identity Fields

**Priority:** Medium  
**Gap:** G-07, G-08  
**Tags:** `backend`, `frontend`, `admin`  
**Depends On:** none

**Description:** Tambah field `identity_number` (KTP/SIM) dan auto-generated `customer_code` ke customers table.

**Implementation:**

1. Migration: add `identity_number` (nullable string) dan `customer_code` (unique string) ke customers
2. Auto-generate customer_code format `CUST-YYYYMMDD-XXXX` saat create
3. Update `CreateNewUser` action untuk accept identity_number saat register
4. Update registration form frontend
5. Update admin customer view (jika ada)

**Acceptance Criteria:**

- Customer code auto-generated saat registrasi
- Identity number bisa diisi saat registrasi (optional)
- Customer code unique dan tidak bisa diubah
- Feature test cover: auto-generation, uniqueness

---

### UA-007: Add Driver Code Generation

**Priority:** Medium  
**Gap:** G-08  
**Tags:** `backend`, `admin`  
**Depends On:** none

**Description:** Tambah auto-generated `driver_code` ke drivers table.

**Implementation:**

1. Migration: add `driver_code` (unique string) ke drivers
2. Auto-generate format `DRV-XXXX` saat admin create driver
3. Update `DriverController::store()` untuk auto-assign code
4. Update driver management frontend untuk display code

**Acceptance Criteria:**

- Driver code auto-generated saat create
- Code unique dan displayed di admin panel
- Feature test cover: auto-generation, uniqueness

---

### UA-008: Implement Receipt PDF Generation

**Priority:** Medium  
**Gap:** G-09  
**Tags:** `backend`, `receipt`  
**Depends On:** none

**Description:** Generate actual PDF receipt yang bisa di-download customer. Gunakan `barryvdh/laravel-dompdf` atau `spatie/laravel-pdf`.

**Implementation:**

1. Install PDF package: `composer require barryvdh/laravel-dompdf`
2. Create Blade view `resources/views/receipts/pdf.blade.php` dengan format kwitansi
3. Update `ReceiptService::generateForPayment()` untuk generate PDF dan store ke storage
4. Update `pdf_url` column dengan path ke generated file
5. Tambah download endpoint `GET /receipts/{receipt}/download`
6. Update receipt show page dengan download button

**Acceptance Criteria:**

- PDF generated otomatis setelah payment confirmed
- PDF berisi: receipt number, customer info, service detail, price breakdown, payment method, date
- Customer bisa download PDF dari receipt page
- PDF tersimpan di storage/app/receipts/
- Feature test cover: PDF generated, download works, content correct

---

### UA-009: Implement User Profile Update

**Priority:** Medium  
**Gap:** G-10  
**Tags:** `backend`, `frontend`, `auth`  
**Depends On:** none

**Description:** Tambah endpoint untuk user update profile (name, phone, address untuk customer).

**Implementation:**

1. Create `ProfileController` dengan `edit()` dan `update()` methods
2. Create `UpdateProfileRequest` form request
3. Create `resources/js/pages/profile/edit.tsx` page
4. Tambah route `GET/PUT /profile`
5. Tambah link ke profile di navigation (semua role)

**Acceptance Criteria:**

- User bisa update name dan email
- Customer bisa update phone dan address
- Password change terpisah (sudah ada via Fortify)
- Feature test cover: update name, update customer fields, validation

---

### UA-010: Add UpgradeOffer originalPrice Field

**Priority:** Medium  
**Gap:** G-11  
**Tags:** `backend`, `orders`  
**Depends On:** UA-002

**Description:** Track harga original di upgrade offer agar jelas bahwa customer bayar harga awal.

**Implementation:**

1. Migration: add `original_price` (decimal) ke upgrade_offers table
2. Update `VehicleUpgradeService::findUpgrade()` untuk set original_price dari pricing calculation
3. Display original price di upgrade offer UI

**Acceptance Criteria:**

- Upgrade offer menyimpan harga original
- Frontend menampilkan "Anda tetap bayar Rp X (harga kategori awal)"
- Feature test cover: original_price stored correctly

---

## Phase C: Architectural Polish (Optional)

### UA-011: Add Driver Rating System

**Priority:** Low  
**Gap:** G-13  
**Tags:** `backend`, `frontend`, `customer`  
**Depends On:** none

**Description:** Tambah rating system dimana customer bisa rate driver setelah order completed.

**Implementation:**

1. Migration: add `rating` (decimal, nullable) ke drivers table
2. Create `driver_ratings` table (order_id, driver_id, score 1-5, comment)
3. Endpoint: `POST /customer/rental-orders/{order}/rate-driver`
4. Recalculate average rating on driver after each new rating
5. Show rating di driver selection (loyal customer flow)

---

### UA-012: Add Employee Code for Admin/Cashier

**Priority:** Low  
**Gap:** G-14  
**Tags:** `backend`  
**Depends On:** none

**Description:** Tambah `employee_code` field ke users yang punya role admin/kasir.

**Implementation:**

1. Migration: add `employee_code` (nullable, unique) ke users table
2. Seeder: assign codes ke existing admin/kasir
3. Display di admin panel user management (future)

---

### UA-013: Driver Schedule Acceptance Flow

**Priority:** Low  
**Gap:** G-18  
**Tags:** `backend`, `frontend`  
**Depends On:** UA-004

**Description:** Beri driver kemampuan accept/reject assignment sebelum dispatch.

**Implementation:**

1. Add `assignment_status` ke rental_orders (pending_driver, accepted, rejected)
2. Endpoint: `POST /driver/orders/{order}/accept`, `POST /driver/orders/{order}/reject`
3. Jika reject → auto-reassign ke driver lain
4. Update driver dashboard dengan pending assignments

---

## Recommended Execution Order

```
Phase A (Critical):
1. UA-005 (relationships, quick win)
2. UA-001 (order cancellation)
3. UA-003 (date-range availability)
4. UA-002 (auto-trigger upgrade)
5. UA-004 (driver notifications)

Phase B (Data & UX):
6. UA-006 (customer identity)
7. UA-007 (driver code)
8. UA-009 (profile update)
9. UA-010 (upgrade originalPrice)
10. UA-008 (receipt PDF)

Phase C (Polish, optional):
11. UA-011 (driver rating)
12. UA-012 (employee code)
13. UA-013 (driver schedule acceptance)
```

---

## Effort Estimates

| Phase     | Tasks           | Estimated Effort |
| --------- | --------------- | ---------------- |
| A         | UA-001 → UA-005 | ~3-4 days        |
| B         | UA-006 → UA-010 | ~2-3 days        |
| C         | UA-011 → UA-013 | ~2-3 days        |
| **Total** | **13 tasks**    | **~7-10 days**   |

---

## Notes

- Phase C tasks bisa di-skip untuk MVP tanpa impact ke core business flow
- Semua Phase A tasks bisa dikerjakan parallel (tidak ada dependency antar task kecuali UA-010 depends on UA-002)
- Architectural divergence (composition vs inheritance, services vs model methods) adalah **intentional** dan tidak perlu diubah — ini standard Laravel pattern
- Extra enum values (Draft, ReadyToDispatch, WaitingOvertimePayment, Refunded, Inactive) adalah **valid additions** yang membuat flow lebih robust
