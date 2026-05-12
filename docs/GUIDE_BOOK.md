# 📘 Rent Car Platform — Guide Book

> **Version:** 1.1  
> **Last Updated:** 2026-05-12  
> **Untuk:** Customer, Admin, Kasir, Supir, Developer

---

## Table of Contents

1. [Tentang Aplikasi](#1-tentang-aplikasi)
2. [Role & Akses](#2-role--akses)
3. [Panduan Customer](#3-panduan-customer)
4. [Panduan Admin](#4-panduan-admin)
5. [Panduan Kasir](#5-panduan-kasir)
6. [Panduan Supir](#6-panduan-supir)
7. [Panduan Developer](#7-panduan-developer)
8. [Business Rules](#8-business-rules)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQ](#10-faq)
11. [Changelog v1.1](#11-changelog-v11)

---

## 1. Tentang Aplikasi

**Rent Car Platform** adalah aplikasi web untuk layanan rental kendaraan dan antar-jemput dengan fitur:

- 🚗 **Rental Kendaraan** — sewa per jam/hari/minggu/bulan
- 🚐 **Antar-Jemput (Shuttle)** — layanan point-to-point
- 💳 **Pembayaran Fleksibel** — tunai atau transfer bank
- 👥 **Priority Member** — pelanggan lama bisa pilih supir favorit
- 🎁 **Free Upgrade** — otomatis tawarkan kelas lebih tinggi saat unit kosong
- 📊 **Audit Trail** — semua operasi kritis tercatat

**Tech Stack:** Laravel 13 + Inertia.js v3 + React 19 + Tailwind v4

---

## 2. Role & Akses

Aplikasi memiliki **4 role** dengan akses berbeda:

| Role            | Akses                                                        | Dashboard URL            |
| --------------- | ------------------------------------------------------------ | ------------------------ |
| 🧑‍💼 **Admin**    | Full access: master data, verifikasi, dispatch, report       | `/admin/dashboard`       |
| 💵 **Kasir**    | Input pembayaran tunai, verifikasi transfer, lihat receipt   | `/kasir/dashboard`       |
| 🧑 **Customer** | Booking, lihat catalog, upload bukti transfer, lihat receipt | `/catalog` (after login) |
| 🚗 **Supir**    | Lihat order yang di-assign                                   | `/driver/dashboard`      |

**Redirect otomatis:** Setelah login, sistem akan mengarahkan user ke dashboard sesuai role-nya.

---

## 3. Panduan Customer

### 3.1 Registrasi

1. Buka halaman `/register`
2. Isi form:
    - Nama lengkap
    - Email (untuk login)
    - Phone
    - Password (minimal 8 karakter)
    - Konfirmasi password
3. Klik **"Register"**
4. Otomatis login dan redirect ke catalog

### 3.2 Login

1. Buka halaman `/login`
2. Masukkan email dan password
3. Klik **"Sign In"**
4. Redirect ke `/catalog`

### 3.3 Browse Catalog & Booking Kendaraan

**Step 1: Pilih Vehicle**

1. Dari `/catalog`, browse kendaraan yang available. Kendaraan ditampilkan dengan **Pagination (4 item/halaman)**.
2. Gunakan **Filter Catalog (Modal Popup)** untuk menyaring kendaraan berdasarkan kategori atau harga dengan lebih mudah.
3. Klik kendaraan untuk lihat detail
4. Klik **"Book This Vehicle"**

**Step 2: Isi Form Booking**

1. Pilih **Rental Unit**: Hour / Day / Week / Month
2. Isi **Duration** (jumlah unit)
    - ⚠️ Minimum 3 jam jika unit = Hour
3. Pilih **Start Date & Time**
4. Pilih **Pickup Option**:
    - `Pickup at Office` — ambil di kantor
    - `Deliver to Customer` — dikirim ke alamat
5. Jika delivery, isi **Delivery Address**
6. Centang **"Out of Town"** jika keluar kota (akan kena +20% surcharge)
7. **Driver Selection** (muncul HANYA jika Anda Pelanggan Loyal):
    - Pelanggan loyal = sudah pernah selesaikan min. 1 order
    - Bisa pilih driver dari list available
    - Pelanggan baru: driver di-auto-assign
8. Klik **"Review Order"**

**Step 3: Review & Confirm**

- Sistem tampilkan breakdown harga:
    - Base rate × duration
    - Out-of-town surcharge (jika applicable)
    - Total
- Klik **"Confirm Booking"**

**Step 4: Bayar**

- Order dibuat dengan status `Pending Payment`
- Pilih metode pembayaran (cash atau transfer)

### 3.4 Booking Antar-Jemput (Shuttle)

1. Dari menu, klik **"Shuttle Service"**
2. Isi form:
    - Pickup address
    - Destination address
    - Scheduled date & time
3. Sistem cari `ShuttleTariff` yang match area from/to
4. Tampilkan harga dari tarif table
5. Konfirmasi order

### 3.5 Pembayaran Transfer

1. Di halaman order detail, lihat rekening tujuan
2. Transfer manual ke rekening tersebut
3. Upload bukti transfer:
    - Format: JPG / PNG / PDF
    - Max size: 5 MB
4. Status berubah jadi **Waiting Verification**
5. Tunggu admin verifikasi (biasanya < 1 jam)
6. Jika approved: status **Paid**, kwitansi otomatis generated
7. Jika rejected: upload ulang bukti yang benar

### 3.6 Lihat Receipt

1. Setelah payment paid, buka order detail
2. Klik **"View Receipt"**
3. Halaman receipt bisa di-print lewat browser (Ctrl+P)

### 3.7 Riwayat Order

1. Menu **"My Orders"** di navigation
2. Filter by status: all / ongoing / completed / cancelled

### 3.8 Profil & Keamanan

1. Buka menu **"Profil"** di navigasi utama.
2. Update **Data Pribadi** (Nama, Email, No. HP).
3. Update **Password** untuk keamanan akun. Perubahan akan disimpan secara otomatis.

### 3.9 Daftar Driver

1. Buka menu **"Driver"** dari navigasi.
2. Anda dapat melihat daftar driver yang tersedia (nama, status) untuk referensi saat melakukan booking.

---

## 4. Panduan Admin

### 4.0 Antarmuka Admin (UX Overhaul v1.1)

Sistem admin kini menggunakan standar **URBAN 8 DASHBOARD**:
- **Fixed Sidebar:** Navigasi tetap pada posisinya untuk akses cepat.
- **Breadcrumbs:** Menunjukkan lokasi halaman saat ini dengan jelas.
- **Filter di Setiap Modul:** Pencarian cepat (search), filter tanggal, dan harga.
- **Loading Skeleton & Wrapper:** Menampilkan indikator loading elegan saat data sedang dimuat.
- **Modal Konfirmasi & Toast Notification:** Notifikasi flash dan konfirmasi aksi (hapus/update) tampil lebih elegan dan responsif.

### 4.1 Dashboard Overview

Dashboard admin (`/admin/dashboard`) menampilkan:

- Total order hari ini
- Pending payment count
- Waiting verification count
- Available vs in-use vehicles
- Available vs on-duty drivers
- Recent orders

### 4.2 Kelola Vehicle Category

**Buat kategori baru:**

1. Menu **"Kategori"** → klik **"+ Tambah"**
2. Isi form:
    - Name (misal: "Sedan Premium")
    - Class Level (integer, makin tinggi = kelas makin atas)
    - Description
    - Active status
3. Save

**Edit/nonaktifkan:**

- Klik kategori → edit detail atau toggle Active

### 4.3 Kelola Vehicle

**Tambah kendaraan:**

1. Menu **"Kendaraan"** → **"+ Tambah"**
2. Isi:
    - Category (pilih dari kategori yang sudah ada)
    - Plate number (unique)
    - Brand, Model, Year
    - Status: available / reserved / in_use / maintenance / inactive
    - Current location
3. Save

### 4.4 Kelola Driver

**Tambah driver:**

1. Menu **"Pengemudi"** → **"+ Tambah"**
2. Isi:
    - Name, email, phone (akan dibuatkan user account)
    - License number
    - Status awal: available
3. Save — driver bisa login dengan email/password yang di-set

### 4.5 Kelola Pricing Rule

**Setup tarif rental:**

1. Menu **"Harga & Tarif"** → tab **"Pricing Rules"**
2. Klik **"+ Tambah Rule"**
3. Isi:
    - Vehicle Category
    - Rental Unit: hour/day/week/month
    - Min duration, Max duration
    - Base rate per unit
    - Discount rate (decimal, misal 0.10 = 10% off)
    - Out-of-town surcharge rate (default 0.20 = 20%)

**Contoh:** Sedan Premium — Daily — 1-6 days — Rp 300.000/day

- Untuk rental 7-30 hari, buat rule terpisah dengan rate lebih rendah

### 4.6 Kelola Overtime Penalty

1. Menu **"Harga & Tarif"** → tab **"Overtime"**
2. Per kategori, set `hourly_rate` (biaya keterlambatan per jam)
3. Saat customer return terlambat, sistem auto-calculate: `ceil(minutes_late / 60) × hourly_rate`

### 4.7 Kelola Shuttle Tariff

1. Menu **"Shuttle Tariff"**
2. **"+ Tambah"**:
    - Area from (misal: "Bandara Juanda")
    - Area to (misal: "Hotel Mulia")
    - Estimated distance (km)
    - Estimated duration (minutes)
    - Tariff (fix price)

### 4.8 Verifikasi Pembayaran Transfer

1. Menu **"Verifikasi"** → list transfer pending
2. Klik order → lihat bukti transfer
3. Pilih:
    - **Approve** → status Paid, kwitansi generated, order → ready_to_dispatch
    - **Reject** → isi alasan, status rejected, customer bisa upload ulang

### 4.9 Dispatch Order

⚠️ **Hanya bisa dispatch order dengan:**

- Payment status = Paid
- Order status = ReadyToDispatch

1. Menu **"Order"** → filter status `ready_to_dispatch`
2. Klik order → **"Dispatch"**
3. Konfirmasi
4. Sistem otomatis:
    - Order → ongoing
    - Vehicle → in_use
    - Driver → on_duty

### 4.10 Catat Return

1. Menu **"Order"** → filter status `ongoing`
2. Klik order → **"Record Return"**
3. Isi actual return date & time
4. Sistem hitung overtime:
    - Jika late: order → waiting_overtime_payment, create payment baru
    - Jika on-time: order → completed, vehicle/driver released

### 4.11 Laporan

Menu **"Laporan"**:

- Filter by date range
- Total completed transactions
- Total revenue (paid only, exclude cancelled)
- Breakdown per vehicle category

---

## 5. Panduan Kasir

Kasir punya akses terbatas ke operasi pembayaran:

### 5.1 Input Pembayaran Tunai

1. Customer datang dengan order ID
2. Buka **"Cash Payment"**
3. Cari order by ID atau customer name
4. Input jumlah (harus match dengan `total_amount` order)
5. Konfirmasi — sistem otomatis:
    - Payment → paid
    - Order → ready_to_dispatch
    - Generate receipt
    - Log audit

### 5.2 Verifikasi Transfer

Kasir memiliki wewenang untuk memproses verifikasi bukti transfer:
1. Buka menu **"Verifikasi Pembayaran"**
2. Lihat daftar transfer yang berstatus pending.
3. Klik order untuk memeriksa validitas bukti transfer (PDF/JPG/PNG).
4. Klik **"Approve"** jika valid, atau **"Reject"** dengan alasan jika tidak sesuai.

### 5.3 Cetak Kwitansi

1. Setelah payment paid, klik receipt number
2. Browser print (Ctrl+P)

---

## 6. Panduan Supir

**⚠️ v1.0 limitation:** Driver tidak dapat notifikasi otomatis. Saat ini admin harus menghubungi driver secara manual (phone/WA) untuk info order baru.

### 6.1 Login

- Email/password dari admin saat create driver account
- Dashboard: `/driver/dashboard`

### 6.2 Lihat Order Assigned

- Dashboard tampilkan order yang di-assign ke Anda
- Detail: customer, vehicle, pickup, schedule

### 6.3 Pelaksanaan Trip

1. Ambil vehicle dari garasi (koordinasi dengan admin)
2. Jalankan trip sesuai order
3. Return vehicle setelah selesai → lapor ke admin untuk record return

---

## 7. Panduan Developer

### 7.1 Setup Local

```bash
# Clone & install
git clone <repo>
cd rent-car
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate:fresh --seed

# Run
composer run dev   # runs server + queue + vite
```

### 7.2 Default Seeded Accounts

| Role     | Email                 | Password |
| -------- | --------------------- | -------- |
| Admin    | admin@rentcar.test    | password |
| Kasir    | kasir@rentcar.test    | password |
| Customer | customer@rentcar.test | password |
| Driver   | driver@rentcar.test   | password |

### 7.3 Project Structure

```
app/
├── Actions/Fortify/       # Auth actions (CreateNewUser, dll)
├── Enums/                 # UserRole, OrderStatus, dll
├── Http/
│   ├── Controllers/
│   │   ├── Admin/         # Admin-only controllers
│   │   ├── Customer/      # Customer-only controllers
│   │   └── ...            # Shared: Catalog, Payment, Receipt
│   ├── Middleware/
│   └── Requests/          # Form request validation
├── Models/                # Eloquent models
├── Policies/              # Authorization policies
└── Services/
    ├── Audit/             # AuditLogger
    ├── Drivers/           # Assignment, availability
    ├── Orders/            # Lifecycle, status service
    ├── Pricing/           # Rental + shuttle pricing
    ├── Receipts/          # Receipt generation
    └── Vehicles/          # Upgrade service

database/
├── migrations/            # Schema
├── factories/             # Test data
└── seeders/               # Dev data

resources/js/
├── pages/                 # Inertia pages
│   ├── admin/
│   ├── customer/
│   ├── auth/
│   └── catalog/
├── layouts/               # AdminLayout, CustomerLayout
└── components/            # Shared UI components

tests/
├── Feature/               # Integration tests
└── Unit/                  # Unit tests
```

### 7.4 Running Tests

```bash
# All tests
php artisan test --compact

# Specific file
php artisan test --compact --filter=RentalPricingServiceTest

# Coverage
php artisan test --coverage
```

### 7.5 Code Style

```bash
# Laravel Pint (PHP formatter)
vendor/bin/pint --dirty --format agent

# Frontend
npm run lint:check
npm run types:check
npm run build
```

### 7.6 Laravel Brain (Project Analysis)

```bash
# Scan project
php artisan brain:scan

# Export AI context
php artisan brain:export-context --output=docs/brain-context/full-context.md --force

# Generate AI rules files
php artisan brain:generate-rules --force
```

### 7.7 Adding New Features

1. **Check guideline files:**
    - `AGENTS.md` — project architecture
    - `CLAUDE.md` — Claude-specific rules
    - `docs/superpowers/plans/*.md` — execution plans

2. **Follow pattern:**
    - Route → Controller → Form Request → Service → Model
    - Write Pest test for behavior
    - Run `vendor/bin/pint --dirty` after changes

3. **Use Laravel Boost tools:**
    - `search-docs` for version-specific docs
    - `database-schema` before migrations
    - `tinker` for debugging

---

## 8. Business Rules

### BR-001: Min 3 Jam untuk Hourly Rental

Implementation: `app/Services/Pricing/RentalPricingService.php:33`

### BR-002: Duration-Based Pricing

- Match `PricingRule` via `vehicle_category_id`, `rental_unit`, dan range `min_duration`-`max_duration`
- Formula: `total = base_rate × duration`

### BR-003: Out-of-Town Surcharge

- Jika `is_out_of_town = true`
- `surcharge = total × out_of_town_surcharge_rate` (default 0.20)

### BR-004: Overtime Hitung Kelipatan Jam

- `overtime_hours = ceil(minutes_late / 60)`
- `overtime_charge = overtime_hours × hourly_rate`

### BR-005: Loyal Customer Detection

- `$customer->total_completed_orders >= 1`

### BR-006: Payment Lock

- Dispatch hanya jika payment paid + order = ready_to_dispatch
- Enforced by `OrderStatusService::assertCanDispatch()`

### BR-007: Receipt Uniqueness

- `receipt_number` unique via `ReceiptNumberGenerator`

### BR-008: Vehicle Status Sync

- Create order: no change
- Dispatch: vehicle → in_use, driver → on_duty
- Complete: vehicle → available, driver → available

### BR-009: Audit Log Coverage

Operasi yang di-log:

- Payment: cash recorded, approved, rejected
- Order: dispatched, returned, completed
- Pricing: changes (future)

---

## 9. Troubleshooting

### "Minimum 3 jam" error

**Cause:** Rental unit = hour dengan duration < 3  
**Fix:** Naikkan duration ke min 3 jam atau ganti unit ke day

### "Cannot dispatch: payment not paid"

**Cause:** Payment masih unpaid / waiting_verification  
**Fix:** Admin verifikasi transfer atau kasir input cash dulu

### Transfer proof upload fails

**Cause:** File > 5 MB atau format salah  
**Fix:** Pastikan JPG/PNG/PDF dan ukuran < 5 MB

### "No pricing rule found"

**Cause:** Kombinasi category + unit + duration tidak match rule manapun  
**Fix:** Admin tambah `PricingRule` yang cover range duration tersebut

### Double-booking (v1.0 limitation)

**Cause:** Tidak ada date-range availability check  
**Workaround:** Admin monitor manual sampai v1.1 release

### Driver tidak tahu ada order (v1.0 limitation)

**Cause:** No notification system  
**Workaround:** Admin hubungi driver via phone/WA manual

---

## 10. FAQ

**Q: Berapa lama verifikasi transfer?**  
A: Manual oleh admin, biasanya < 1 jam di jam kerja.

**Q: Bisa cancel order?**  
A: v1.0 belum support. Roadmap v1.1.

**Q: Refund bagaimana?**  
A: Manual via admin, ubah status payment ke `refunded`. Full refund flow belum ada.

**Q: Payment gateway VA kapan?**  
A: Roadmap v2.0.

**Q: Ada aplikasi mobile?**  
A: Belum, web responsive untuk sekarang. v2.0 roadmap.

**Q: B2B account (corporate)?**  
A: `customer_type` enum sudah support `corporate`, tapi dashboard B2B khusus belum ada. v2.0 roadmap.

**Q: Kenapa free upgrade harus manual accept/reject?**  
A: v1.0 upgrade service ada tapi tidak auto-trigger saat vehicle kosong. v1.1 roadmap.

**Q: Receipt PDF download?**  
A: v1.0 hanya browser print. PDF download di v1.2 roadmap.

---

## Referensi Dokumen

| Dokumen            | Path                                                               | Isi                          |
| ------------------ | ------------------------------------------------------------------ | ---------------------------- |
| PRD                | `docs/PRD.md`                                                      | Product requirement document |
| Study Case         | `docs/STUDY_CASE.md`                                               | Business requirement awal    |
| UML (design)       | `docs/UML_Rental_Kendaraan_PlantUML/`                              | UML target design            |
| UML (as-built)     | `docs/UML_FINAL/`                                                  | UML sesuai implementasi      |
| MVP Plan           | `docs/superpowers/plans/2026-05-09-rent-car-mvp-execution-plan.md` | 25 task execution            |
| UML Alignment Plan | `docs/superpowers/plans/uml-alignment-plan.md`                     | Plan tutup gap UML           |
| Gap Analysis       | `docs/superpowers/analysis/consolidated-gap-analysis.md`           | Brain + UML + Study Case gap |
| MVP Final          | `docs/MVP_FINAL.md`                                                | Final MVP as-built           |
| AI Context         | `AGENTS.md`, `CLAUDE.md`                                           | Laravel Brain generated      |

---

## 11. Changelog v1.1

Pembaruan pada versi ini difokuskan pada **UX Overhauls & Peningkatan Fitur**:

- **Customer:**
  - Penambahan popup modal filter di katalog.
  - Implementasi paginasi (4 item per halaman) di katalog.
  - Menu Profil baru untuk mengubah data pribadi dan password.
  - Menu Driver untuk melihat daftar driver.
  - Notifikasi Toast yang lebih elegan.
  - Aturan pemilihan driver diperketat (HANYA untuk pelanggan loyal).
- **Admin:**
  - UI diperbarui dengan tema **URBAN 8 DASHBOARD** (fixed sidebar, breadcrumbs).
  - Penambahan filter di setiap modul (pencarian, rentang waktu, dan harga).
  - Integrasi efek *loading skeleton* dan wrapper saat pemuatan data.
  - Modal konfirmasi aksi yang lebih elegan.
- **Kasir:**
  - Penambahan proses eksplisit untuk verifikasi bukti transfer.
- **General:**
  - Penggantian alert default dengan Toast Notification flash modern.

---

**Maintained by:** Development Team  
**Contact:** [tim@rentcar.test](mailto:tim@rentcar.test)
