# Brain Scan vs UML vs Study Case — Consolidated Gap Analysis

> **Generated:** 2026-05-09  
> **Sources:**
>
> - Brain Scan: `docs/brain-context/full-context.md` (281 nodes, 450 edges, 85 routes)
> - UML: `docs/UML_Rental_Kendaraan_PlantUML/*.puml`
> - Study Case: `docs/STUDY_CASE.md`

---

## 1. Brain Scan Snapshot (Actual Implementation)

**Project stats:**

- 85 routes, 17 controllers, 12 models, 10 services, 147 call edges, 46 DB actions

**Complexity hotspots:**
| Class/Method | CC | Lines |
|---|---|---|
| DriverAssignmentService@assign | 5 | 25 |
| RentalPricingService@calculateQuote | 4 | 47 |
| OrderStatusService@assertCanDispatch | 3 | 18 |
| ReceiptController@show | 2 | 18 |

**Code smells (Fat Methods):**

- `ReportController@index`
- `RentalOrderController@store`
- `ShuttleOrderController@store`
- `RentalPricingService@calculateQuote`

**Services aktual:**

- `RentalPricingService`, `ShuttlePricingService` (pricing)
- `DriverAssignmentService`, `DriverAvailabilityService` (driver)
- `VehicleUpgradeService` (upgrade)
- `ReceiptService`, `ReceiptNumberGenerator` (receipt)
- `OrderStatusService`, `RentalOrderLifecycleService` (order lifecycle)
- `AuditLogger` (audit)

---

## 2. Brain Output vs UML Diagrams

### 2.1 Service Layer Comparison

| UML Sequence Diagram Service | Brain-Detected Service                              | Status                                      |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------- |
| RentalSvc                    | RentalOrderLifecycleService + RentalOrderController | ✅ MATCH (split by concern)                 |
| Inventory                    | Built into Vehicle model + CatalogController        | ⚠️ PARTIAL (no dedicated Inventory service) |
| Pricing                      | RentalPricingService + ShuttlePricingService        | ✅ MATCH (split hourly/shuttle)             |
| DriverSvc                    | DriverAssignmentService + DriverAvailabilityService | ✅ MATCH (split by responsibility)          |
| PaymentSvc                   | PaymentController (no service)                      | ⚠️ PARTIAL (logic in controller)            |
| ReceiptSvc                   | ReceiptService + ReceiptNumberGenerator             | ✅ MATCH                                    |

**Gap:**

- ❌ **No dedicated InventoryService** — availability check scattered across CatalogController and Vehicle model
- ❌ **No dedicated PaymentService** — payment logic inline di PaymentController (fat method)

### 2.2 Controller vs Use Case Coverage

| UML Use Case          | Brain Route                                      | Status                         |
| --------------------- | ------------------------------------------------ | ------------------------------ | ---------- | -------- | --- |
| UC01 Registrasi/Login | Fortify auto-routes                              | ✅                             |
| UC02 Katalog          | `/catalog`, `/catalog/{category}`                | ✅                             |
| UC03 Buat Pemesanan   | `POST /customer/rental-orders`                   | ✅                             |
| UC05 Hitung Tarif     | RentalPricingService@calculateQuote              | ✅                             |
| UC06 Pilih Supir      | Inside RentalOrderController@store               | ✅                             |
| UC07 Free Upgrade     | UpgradeOfferController                           | ⚠️ Manual (not auto-triggered) |
| UC08 Antar-Jemput     | `POST /customer/shuttle-orders`                  | ✅                             |
| UC09 Upload Transfer  | `POST /customer/payments/{payment}/upload-proof` | ✅                             |
| UC10 Input Tunai      | `POST /payments/{payment}/cash`                  | ✅                             |
| UC11 Verifikasi       | `/admin/payments/*`                              | ✅                             |
| UC12 Kwitansi         | `ReceiptController@show`                         | ⚠️ No PDF generation           |
| UC13-15 Master Data   | `/admin/vehicles                                 | drivers                        | categories | pricing` | ✅  |
| UC16 Dispatch         | `OrderLifecycleController@dispatch`              | ✅                             |
| UC17 Return           | `OrderLifecycleController@processReturn`         | ✅                             |
| UC18 Overtime         | `RentalPricingService@calculateOvertime`         | ✅                             |

### 2.3 DB Operations vs UML Class Diagram

Brain-detected 46 DB actions match UML classes:

- `vehicles`, `vehicle_categories` ✅
- `drivers`, `customers` ✅
- `rental_orders`, `shuttle_orders`, `shuttle_tariffs` ✅
- `pricing_rules`, `overtime_penalties` ✅
- `payments`, `receipts`, `upgrade_offers` ✅
- **Extra (not in UML):** `audit_logs`, `users` (auth table)

### 2.4 Code Smells — Refactoring Opportunities

Brain flags 4 fat methods yang perlu di-refactor:

1. **`ReportController@index` (34 lines)** — Pisah query logic ke `ReportQueryService`
2. **`RentalOrderController@store` (59 lines)** — Pisah ke `RentalOrderCreationService` (validasi → upgrade check → pricing → driver assignment → order creation → payment init)
3. **`ShuttleOrderController@store` (33 lines)** — Pisah ke `ShuttleOrderCreationService`
4. **`RentalPricingService@calculateQuote` (47 lines)** — Pisah ke rule lookup, base calculation, surcharge application

---

## 3. Actual Implementation vs Study Case (`docs/STUDY_CASE.md`)

Study case mendefinisikan **4 aspek** yang harus di-cover:

### 3.1 Aspek Teknis (Tech Stack & Core Engine)

| Study Case Requirement                                               | Implementation                                             | Status                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Integrated Booking (web/mobile, real-time stock)                     | Inertia React web app, catalog by status                   | ⚠️ Web only, no mobile; status-only availability |
| Smart Pricing Algorithm (hourly/daily/weekly/monthly, diskon durasi) | RentalPricingService dengan 4 rental units + discount_rate | ✅ MATCH                                         |
| Geo-Fencing & Trip Logic (20% out-of-town via Maps API)              | `is_out_of_town` flag + 20% surcharge                      | ⚠️ Manual flag, no Maps API                      |
| Module Antar-Jemput (point-to-point by distance/time table)          | ShuttleOrder + ShuttleTariff table                         | ✅ MATCH                                         |

### 3.2 Aspek Administrasi (Automated Management)

| Study Case Requirement                                       | Implementation                                           | Status                           |
| ------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------- |
| Smart Invoicing Cash → kwitansi instan                       | `PaymentController@recordCash` auto-generates receipt    | ✅ MATCH                         |
| Smart Invoicing Transfer → antrean validasi sebelum kwitansi | Transfer → WaitingVerification → approve → receipt       | ✅ MATCH                         |
| Driver Database (jadwal kerja, performa)                     | Driver model + status enum                               | ⚠️ No rating/performance metric  |
| Manajemen Armada (pengingat servis)                          | Vehicle model with `maintenance` status                  | ⚠️ No automated service reminder |
| Overtime Calculator (kelipatan jam)                          | `RentalPricingService@calculateOvertime` rounds up hours | ✅ MATCH                         |

### 3.3 Aspek Bisnis & Loyalitas (Customer Experience)

| Study Case Requirement                                        | Implementation                                 | Status                           |
| ------------------------------------------------------------- | ---------------------------------------------- | -------------------------------- |
| Priority Member auto-detection                                | `customer.total_completed_orders >= 1` check   | ✅ MATCH                         |
| Pick Your Driver (member only)                                | `DriverAssignmentService::assign()` loyal flow | ✅ MATCH                         |
| Auto-Upgrade (stok kosong → kelas atas harga tetap)           | `VehicleUpgradeService::findUpgrade()`         | ⚠️ Not auto-triggered at booking |
| **B2B Dashboard (akun perusahaan, tagihan bulanan, riwayat)** | **TIDAK ADA**                                  | ❌ MISSING                       |

### 3.4 Skema Alur Operasional

| Study Case Flow                                                   | Implementation                         | Status                   |
| ----------------------------------------------------------------- | -------------------------------------- | ------------------------ |
| Pemesanan: min 3 jam                                              | RentalPricingService line 33           | ✅                       |
| Pemesanan: pilih unit                                             | RentalOrderController@create           | ✅                       |
| Pemesanan: pilih supir (member)                                   | DriverAssignmentService                | ✅                       |
| Pengiriman: notifikasi supir                                      | **TIDAK ADA**                          | ❌ MISSING               |
| Pengiriman: update status "Dikirim"                               | OrderLifecycleController@dispatch      | ✅                       |
| Pembayaran: Payment Gateway (VA/Transfer)                         | Manual transfer proof upload           | ⚠️ No VA/Payment Gateway |
| Pembayaran: Cash Input                                            | PaymentController@recordCash           | ✅                       |
| Pengembalian: input jam kembali → hitung selisih → biaya tambahan | OrderLifecycleController@processReturn | ✅                       |

---

## 4. Match Score dengan Study Case

| Kategori           | Match  | Partial | Missing | Score   |
| ------------------ | ------ | ------- | ------- | ------- |
| Aspek Teknis       | 2      | 2       | 0       | 75%     |
| Aspek Administrasi | 3      | 2       | 0       | 80%     |
| Aspek Bisnis       | 2      | 1       | 1       | 63%     |
| Alur Operasional   | 5      | 1       | 2       | 69%     |
| **OVERALL**        | **12** | **6**   | **3**   | **72%** |

**Interpretasi:**

- App sudah cover **72%** dari study case requirements
- Core booking & pricing flow: **FULLY MATCH** dengan flow operasional study case
- Payment flow: **MATCH** untuk cash + transfer manual; belum ada Payment Gateway integration
- Loyalty & member: **MATCH** untuk priority detection + pick driver; auto-upgrade perlu auto-trigger

---

## 5. Critical Gaps vs Study Case (Priority)

### Priority HIGH (Impact business flow)

| #      | Gap                                       | Source                        | Impact                          |
| ------ | ----------------------------------------- | ----------------------------- | ------------------------------- |
| SC-G01 | **Notifikasi ke supir saat dispatch**     | Study Case §4 Pengiriman      | Supir tidak tahu ada tugas baru |
| SC-G02 | **Auto-trigger upgrade saat unit kosong** | Study Case §3 Auto-Upgrade    | UC07 tidak fully automated      |
| SC-G03 | **Order cancellation flow**               | UML + best practice           | Tidak bisa cancel order         |
| SC-G04 | **Date-range availability check**         | Study Case §1 real-time stock | Double-booking possible         |

### Priority MEDIUM (Feature completeness)

| #      | Gap                                                       | Source                  | Impact                                      |
| ------ | --------------------------------------------------------- | ----------------------- | ------------------------------------------- |
| SC-G05 | **B2B Dashboard (akun perusahaan + tagihan bulanan)**     | Study Case §3           | B2B customer tidak bisa manage via platform |
| SC-G06 | **Payment Gateway integration (VA/Transfer auto-verify)** | Study Case §4           | Verifikasi transfer masih manual            |
| SC-G07 | **Receipt PDF generation**                                | UML + kwitansi physical | Customer tidak bisa download PDF            |
| SC-G08 | **Maps API integration untuk geo-fencing**                | Study Case §1           | Out-of-town detection masih manual flag     |
| SC-G09 | **Driver performance tracking (rating)**                  | Study Case §2           | Tidak track performa supir                  |

### Priority LOW (Nice-to-have)

| #      | Gap                                      | Source        | Impact                     |
| ------ | ---------------------------------------- | ------------- | -------------------------- |
| SC-G10 | **Mobile app**                           | Study Case §1 | Web only                   |
| SC-G11 | **Vehicle service reminder**             | Study Case §2 | Tidak ada pengingat servis |
| SC-G12 | **Customer identity fields (KTP, code)** | UML           | Data kurang lengkap        |

---

## 6. Refactoring Opportunities (from Brain)

Brain flagged 4 fat methods yang perlu di-refactor untuk maintainability:

| Method                                           | Current                                                       | Recommendation                                                           |
| ------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `RentalOrderController@store` (59 lines)         | Inline validation, pricing, driver assignment, order creation | Extract to `RentalOrderCreationService`                                  |
| `ShuttleOrderController@store` (33 lines)        | Inline tariff lookup + order creation                         | Extract to `ShuttleOrderCreationService`                                 |
| `ReportController@index` (34 lines)              | Inline query logic                                            | Extract to `ReportQueryService`                                          |
| `RentalPricingService@calculateQuote` (47 lines) | Monolithic calculation                                        | Split into `findApplicableRule()`, `applyBaseRate()`, `applySurcharge()` |

---

## 7. Alignment Matrix — Study Case vs UML vs Implementation

| Feature                           | Study Case  | UML                                   | Implementation                     | Verdict     |
| --------------------------------- | ----------- | ------------------------------------- | ---------------------------------- | ----------- |
| Booking dengan min 3 jam          | ✅ Required | ✅ Activity diagram                   | ✅ Implemented                     | **ALIGNED** |
| Smart Pricing (duration discount) | ✅ Required | ✅ PricingRule.discountRate           | ✅ Implemented                     | **ALIGNED** |
| Out-of-town 20% surcharge         | ✅ Required | ✅ PricingRule.outOfTownSurchargeRate | ✅ Implemented                     | **ALIGNED** |
| Shuttle service                   | ✅ Required | ✅ ShuttleOrder                       | ✅ Implemented                     | **ALIGNED** |
| Cash instant receipt              | ✅ Required | ✅ Sequence diagram                   | ✅ Implemented                     | **ALIGNED** |
| Transfer verification queue       | ✅ Required | ✅ Sequence diagram                   | ✅ Implemented                     | **ALIGNED** |
| Driver management                 | ✅ Required | ✅ Driver class                       | ✅ Implemented                     | **ALIGNED** |
| Overtime calculation              | ✅ Required | ✅ OvertimePenalty                    | ✅ Implemented                     | **ALIGNED** |
| Priority member (pick driver)     | ✅ Required | ✅ Activity diagram branch            | ✅ Implemented                     | **ALIGNED** |
| Auto-upgrade (stok kosong)        | ✅ Required | ✅ Sequence alt block                 | ⚠️ Service ada, tidak auto-trigger | **PARTIAL** |
| Driver notification               | ✅ Required | ✅ Sequence diagram                   | ❌ Tidak ada                       | **GAP**     |
| Payment Gateway VA                | ✅ Required | —                                     | ❌ Manual transfer proof           | **GAP**     |
| B2B Dashboard                     | ✅ Required | —                                     | ❌ Tidak ada                       | **GAP**     |
| Geo-fencing Maps API              | ✅ Required | —                                     | ⚠️ Manual flag                     | **PARTIAL** |

---

## 8. Rekomendasi Next Action

Berdasarkan gap analysis, prioritas eksekusi:

1. **Quick wins (1-2 hari):**
    - Refactor 4 fat methods (SC-G dari Brain)
    - Auto-trigger upgrade offer (SC-G02)
    - Date-range availability check (SC-G04)

2. **Core completeness (3-5 hari):**
    - Driver notification system (SC-G01)
    - Order cancellation flow (SC-G03)
    - Receipt PDF generation (SC-G07)

3. **Business expansion (5-10 hari):**
    - B2B Dashboard (SC-G05)
    - Payment Gateway integration (SC-G06)
    - Maps API geo-fencing (SC-G08)

4. **Enhancement (bertahap):**
    - Driver rating system (SC-G09)
    - Mobile app (SC-G10)
    - Service reminder (SC-G11)
