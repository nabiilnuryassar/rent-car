# UML vs Implementation Gap Analysis

> **Generated:** 2026-05-09  
> **Source UML:** `docs/UML_Rental_Kendaraan_PlantUML/`  
> **Codebase:** Laravel 13 + Inertia React + Spatie Permissions

---

## Executive Summary

Implementasi sudah mencakup **~85% dari UML design**. Semua use case utama (UC01–UC18) sudah terimplementasi. Gap utama ada di:

1. **Architectural pattern** — UML pakai class inheritance, implementasi pakai composition + Spatie roles (ini **acceptable divergence**, bukan bug)
2. **Missing fields** — beberapa field identitas (customerCode, identityNumber, driverCode, employeeCode, rating)
3. **Missing behaviors** — driver notification, PDF receipt, order cancellation, date-range availability, auto-trigger upgrade
4. **Methods placement** — UML taruh di model, implementasi taruh di service classes (ini **acceptable** untuk Laravel)

---

## 1. Class/Model Gap Detail

### 1.1 User

| UML Field                  | Status     | Notes                                          |
| -------------------------- | ---------- | ---------------------------------------------- |
| id, name, email, createdAt | ✅ MATCH   | —                                              |
| phone                      | ❌ MISSING | Ada di customers/drivers table, tidak di users |
| passwordHash               | ✅ MATCH   | Kolom `password` dengan cast `hashed`          |
| role                       | ⚠️ PARTIAL | Via Spatie HasRoles, bukan kolom langsung      |
| login()                    | ⚠️ PARTIAL | Handled by Fortify                             |
| updateProfile()            | ❌ MISSING | Tidak ada endpoint profile update              |

### 1.2 Customer

| UML Field         | Status     | Notes                                                    |
| ----------------- | ---------- | -------------------------------------------------------- |
| customerCode      | ❌ MISSING | Tidak ada auto-generated customer code                   |
| identityNumber    | ❌ MISSING | Tidak ada field KTP/identitas                            |
| address           | ✅ MATCH   | —                                                        |
| customerType      | ✅ MATCH   | Enum CustomerType                                        |
| rentalCount       | ✅ MATCH   | Kolom `total_completed_orders`                           |
| isLoyalCustomer() | ⚠️ PARTIAL | Logic ada di DriverAssignmentService, bukan model method |

### 1.3 Admin & Cashier

| UML Field    | Status     | Notes                                       |
| ------------ | ---------- | ------------------------------------------- |
| Model class  | ⚠️ PARTIAL | Tidak ada model terpisah, pakai role Spatie |
| employeeCode | ❌ MISSING | Tidak ada employee code                     |
| Methods      | ✅ MATCH   | Semua ada di controller level               |

### 1.4 Driver

| UML Field        | Status     | Notes                                     |
| ---------------- | ---------- | ----------------------------------------- |
| driverCode       | ❌ MISSING | Tidak ada auto-generated driver code      |
| licenseNumber    | ✅ MATCH   | —                                         |
| status           | ✅ MATCH   | Enum DriverStatus                         |
| rating           | ❌ MISSING | Tidak ada rating system                   |
| acceptSchedule() | ❌ MISSING | Tidak ada driver schedule acceptance flow |

### 1.5 VehicleCategory

| Status | ✅ FULL MATCH | Semua field ada + extra `is_active` |

### 1.6 Vehicle

| UML Field               | Status     | Notes                                              |
| ----------------------- | ---------- | -------------------------------------------------- |
| All basic fields        | ✅ MATCH   | plate, brand, model, year, status, currentLocation |
| isAvailable(start, end) | ❌ MISSING | Hanya filter by status, tidak ada date-range check |

### 1.7 PricingRule

| Status | ✅ MATCH | Semua field ada. `calculate()` di service |

### 1.8 OvertimePenalty

| Status | ✅ MATCH | Field ada. `calculateLateFee()` di service |

### 1.9 Order (Abstract)

| UML Element         | Status     | Notes                                                 |
| ------------------- | ---------- | ----------------------------------------------------- |
| Abstract base class | ❌ MISSING | RentalOrder & ShuttleOrder terpisah tanpa shared base |
| orderNumber         | ✅ MATCH   | Kedua model punya `order_number`                      |
| markPaid()          | ❌ MISSING | Inline di controller, bukan model method              |
| cancel()            | ❌ MISSING | Tidak ada cancellation endpoint                       |
| complete()          | ⚠️ PARTIAL | Di service, bukan model                               |

### 1.10 RentalOrder

| Status | ✅ MATCH | Semua field ada (rentalUnit, duration, isOutOfTown, pickupOption, deliveryAddress, actualReturnTime) |

### 1.11 ShuttleOrder

| UML Field   | Status     | Notes                                   |
| ----------- | ---------- | --------------------------------------- |
| All fields  | ✅ MATCH   | pickup, destination, distance, duration |
| endDateTime | ❌ MISSING | Tidak ada end time di shuttle order     |

### 1.12 UpgradeOffer

| UML Field         | Status     | Notes                                                          |
| ----------------- | ---------- | -------------------------------------------------------------- |
| originalVehicleId | ⚠️ PARTIAL | Pakai `original_vehicle_category_id` (category, bukan vehicle) |
| originalPrice     | ❌ MISSING | Tidak ada kolom harga original                                 |
| accept()/reject() | ✅ MATCH   | Di controller                                                  |

### 1.13 Payment

| Status | ✅ FULL MATCH | Semua field ada + extra `verified_by` |

### 1.14 Receipt

| UML Field                           | Status     | Notes                                             |
| ----------------------------------- | ---------- | ------------------------------------------------- |
| id, receiptNumber, issuedAt, pdfUrl | ✅ MATCH   | —                                                 |
| generatePdf()                       | ❌ MISSING | Kolom `pdf_url` ada tapi tidak ada PDF generation |
| print()                             | ❌ MISSING | Tidak ada print functionality                     |

### 1.15 ShuttleTariff

| Status | ✅ FULL MATCH | Semua field ada |

---

## 2. Enum Comparison

### OrderStatus

| UML                  | Implementation         | Gap                     |
| -------------------- | ---------------------- | ----------------------- |
| PENDING              | PendingPayment         | Renamed (more specific) |
| WAITING_VERIFICATION | WaitingVerification    | ✅                      |
| PAID                 | Paid                   | ✅                      |
| IN_PROGRESS          | Ongoing                | Renamed                 |
| COMPLETED            | Completed              | ✅                      |
| CANCELLED            | Cancelled              | ✅                      |
| —                    | Draft                  | EXTRA                   |
| —                    | ReadyToDispatch        | EXTRA                   |
| —                    | WaitingOvertimePayment | EXTRA                   |

> Extra values adalah **valid additions** untuk real-world flow yang lebih granular dari UML.

### PaymentMethod, PaymentStatus, RentalUnit, PickupOption

| Enum          | Status                      |
| ------------- | --------------------------- |
| PaymentMethod | ✅ FULL MATCH               |
| PaymentStatus | ✅ MATCH + extra `Refunded` |
| RentalUnit    | ✅ FULL MATCH               |
| PickupOption  | ✅ FULL MATCH               |

### VehicleStatus

| UML                                      | Implementation | Gap                 |
| ---------------------------------------- | -------------- | ------------------- |
| AVAILABLE, RESERVED, IN_USE, MAINTENANCE | ✅ All present | —                   |
| —                                        | Inactive       | EXTRA (soft-delete) |

---

## 3. Relationship Verification

| UML Relationship                  | Status                | Notes                                         |
| --------------------------------- | --------------------- | --------------------------------------------- |
| User ← Customer/Driver            | ⚠️ Composition via FK | Acceptable Laravel pattern                    |
| User ← Admin/Cashier              | ⚠️ Role-based         | No separate model                             |
| Order ← RentalOrder/ShuttleOrder  | ❌ No shared base     | Separate models                               |
| Customer → Orders                 | ✅                    | FK on both order types                        |
| VehicleCategory → Vehicle         | ✅                    | HasMany defined                               |
| VehicleCategory → PricingRule     | ✅                    | HasMany defined                               |
| VehicleCategory → OvertimePenalty | ⚠️                    | FK exists, missing `hasOne` on category model |
| RentalOrder → Vehicle             | ✅                    | BelongsTo defined                             |
| RentalOrder → Driver              | ✅                    | BelongsTo defined                             |
| RentalOrder → UpgradeOffer        | ✅                    | HasOne defined                                |
| Order → Payment                   | ✅                    | Polymorphic morphMany                         |
| Payment → Receipt                 | ✅                    | HasOne defined                                |
| ShuttleOrder → ShuttleTariff      | ✅                    | BelongsTo defined                             |
| Driver → RentalOrders             | ⚠️                    | FK exists, missing `hasMany` on Driver model  |

---

## 4. Use Case Coverage

| UC   | Description                            | Status                                |
| ---- | -------------------------------------- | ------------------------------------- |
| UC01 | Registrasi/Login                       | ✅ Implemented (Fortify)              |
| UC02 | Lihat Katalog & Cek Ketersediaan       | ⚠️ No date-range availability         |
| UC03 | Buat Pemesanan Sewa                    | ✅                                    |
| UC04 | Pilih Durasi, Armada, Wilayah & Lokasi | ✅                                    |
| UC05 | Hitung Tarif Otomatis                  | ✅                                    |
| UC06 | Pilih Supir (pelanggan lama)           | ✅                                    |
| UC07 | Free Upgrade (stok kosong)             | ⚠️ Service exists, not auto-triggered |
| UC08 | Pesan Antar-Jemput                     | ✅                                    |
| UC09 | Upload Bukti Transfer                  | ✅                                    |
| UC10 | Input Pembayaran Tunai                 | ✅                                    |
| UC11 | Verifikasi Pembayaran                  | ✅                                    |
| UC12 | Generate/Cetak Kwitansi                | ⚠️ Record only, no PDF/print          |
| UC13 | Kelola Data Kendaraan                  | ✅                                    |
| UC14 | Kelola Tarif & Pricing                 | ✅                                    |
| UC15 | Kelola Data Supir                      | ✅                                    |
| UC16 | Konfirmasi Pengiriman/Ambil            | ✅                                    |
| UC17 | Catat Pengembalian                     | ✅                                    |
| UC18 | Hitung Denda Overtime                  | ✅                                    |

---

## 5. Sequence/Activity Flow Coverage

| Flow                                   | Status | Notes                                            |
| -------------------------------------- | ------ | ------------------------------------------------ |
| Min 3 jam validation                   | ✅     | RentalPricingService line 33                     |
| Loyal → pick driver, New → auto-assign | ✅     | DriverAssignmentService                          |
| Free upgrade when unavailable          | ⚠️     | Service exists, not auto-triggered in order flow |
| Cash → PAID + receipt                  | ✅     | PaymentController::recordCash                    |
| Transfer → upload → verify → receipt   | ✅     | Full flow implemented                            |
| Transfer reject → re-upload            | ✅     | PaymentVerificationController::reject            |
| Payment lock before dispatch           | ✅     | OrderStatusService::assertCanDispatch            |
| Return → overtime → close              | ✅     | RentalOrderLifecycleService                      |
| Driver notification                    | ❌     | No notification system                           |

---

## 6. Acceptable Divergences (Not Bugs)

Berikut divergence yang **sengaja** dan **acceptable** dalam konteks Laravel:

1. **Composition over inheritance** — Laravel tidak pakai class inheritance untuk User subtypes. Spatie roles + separate models via FK adalah standard pattern.
2. **Service classes over model methods** — Domain logic di services (bukan model) adalah best practice Laravel untuk complex business rules.
3. **Extra enum values** — `Draft`, `ReadyToDispatch`, `WaitingOvertimePayment`, `Refunded`, `Inactive` adalah refinements yang membuat flow lebih granular.
4. **Polymorphic payments** — UML shows `Order → Payment`, implementation uses morphable which is more flexible.

---

## 7. Critical Gaps Summary (Perlu Ditutup)

### Priority: HIGH

| #    | Gap                                                 | Impact                                 |
| ---- | --------------------------------------------------- | -------------------------------------- |
| G-01 | Order cancellation flow                             | Customer/admin tidak bisa cancel order |
| G-02 | Auto-trigger upgrade offer saat vehicle unavailable | UC07 tidak fully automated             |
| G-03 | Date-range vehicle availability check               | Double-booking possible                |
| G-04 | Driver notification system                          | Driver tidak tahu jadwal baru          |
| G-05 | Missing `hasMany` on Driver model                   | Relationship incomplete                |
| G-06 | Missing `hasOne` overtimePenalty on VehicleCategory | Relationship incomplete                |

### Priority: MEDIUM

| #    | Gap                                 | Impact                                     |
| ---- | ----------------------------------- | ------------------------------------------ |
| G-07 | Customer identityNumber (KTP) field | Data pelanggan tidak lengkap               |
| G-08 | Customer/Driver code generation     | Tidak ada kode unik untuk referensi        |
| G-09 | Receipt PDF generation              | Kwitansi hanya record, tidak bisa download |
| G-10 | User profile update endpoint        | User tidak bisa update profile             |
| G-11 | UpgradeOffer.originalPrice field    | Tidak track harga original                 |
| G-12 | isLoyalCustomer() method on model   | Logic scattered, not encapsulated          |

### Priority: LOW

| #    | Gap                             | Impact                                     |
| ---- | ------------------------------- | ------------------------------------------ |
| G-13 | Driver rating system            | Nice-to-have, bukan MVP critical           |
| G-14 | Employee code for admin/cashier | Internal reference only                    |
| G-15 | Abstract Order base class       | Architectural purity, no functional impact |
| G-16 | ShuttleOrder endDateTime        | Minor data completeness                    |
| G-17 | User.phone on users table       | Already on child tables                    |
| G-18 | Driver acceptSchedule() flow    | Driver-facing UI enhancement               |
