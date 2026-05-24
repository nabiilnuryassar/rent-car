# 📘 URBAN 8 Rent Car Platform — Guide Book

> **Version:** 1.2  
> **Last Updated:** 2026-05-24  
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
11. [Changelog](#11-changelog)

---

## 1. Tentang Aplikasi

**URBAN 8 Rent Car Platform** adalah aplikasi web untuk layanan rental kendaraan dan antar-jemput (shuttle) dengan fitur:

- 🚗 **Rental Kendaraan** — sewa per jam/hari/minggu/bulan dengan pengemudi profesional
- 🚐 **Antar-Jemput (Shuttle)** — layanan point-to-point berdasarkan rute tarif
- 💳 **Pembayaran Fleksibel** — tunai atau transfer bank dengan upload bukti
- 👥 **Priority Member** — pelanggan loyal bisa pilih supir favorit
- 🎁 **Free Upgrade** — otomatis tawarkan kelas lebih tinggi saat unit tidak tersedia
- 📊 **Dashboard & Laporan** — chart tren real-time, export CSV, dan laporan pendapatan
- 🔔 **Notifikasi In-App** — driver mendapat notifikasi saat ditugaskan ke order
- ❌ **Pembatalan Order** — customer dapat membatalkan pesanan rental maupun shuttle
- 🛡️ **Audit Trail** — semua operasi kritis tercatat

**Tech Stack:** Laravel 13 + Inertia.js v3 + React 19 + Tailwind CSS v4

---

## 2. Role & Akses

Aplikasi memiliki **4 role** dengan akses berbeda:

| Role            | Akses                                                                                 | Dashboard URL       |
| --------------- | ------------------------------------------------------------------------------------- | ------------------- |
| 🧑‍💼 **Admin**    | Full access: master data, pricing, verifikasi, dispatch, return, report, pengaturan   | `/admin/dashboard`  |
| 💵 **Kasir**    | Verifikasi transfer, input pembayaran tunai, cetak kwitansi, laporan                  | `/admin/dashboard`  |
| 🧑 **Customer** | Booking rental, shuttle, upload bukti transfer, lihat receipt, profil, pembatalan      | `/catalog`          |
| 🚗 **Supir**    | Lihat order yang di-assign, atur status ketersediaan, profil, notifikasi              | `/driver/dashboard` |

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

### 3.3 Navigasi Utama Customer

**Desktop:** Navigasi horizontal di bagian atas halaman — Katalog, Driver, Shuttle, Pesanan, + Pemesanan Baru, dan avatar profil.

**Mobile:** Bottom navigation bar berupa pill mengambang dengan 5 menu — Katalog, Driver, Shuttle, Pesanan, Profil.

### 3.4 Browse Catalog & Booking Kendaraan

**Step 1: Pilih Vehicle**

1. Dari `/catalog`, browse kendaraan yang available. Kendaraan ditampilkan dengan **Pagination (4 item/halaman)**.
2. Gunakan **Filter Catalog (Modal Popup)** untuk menyaring kendaraan berdasarkan kategori atau harga.
3. Klik kendaraan untuk lihat detail.
4. Klik **"Book This Vehicle"** untuk mulai proses booking.

**Step 2: Isi Form Booking (Multi-Step Modal)**

1. **Detail Tab:** Pilih **Rental Unit** (Hour / Day / Week / Month), isi **Duration** (jumlah unit), dan pilih **Start Date & Time**.
    - ⚠️ Minimum 3 jam jika unit = Hour.
2. Pilih **Pickup Option**:
    - `Ambil di Kantor` — ambil di kantor
    - `Diantar ke Alamat Saya` — dikirim ke alamat customer
3. Jika delivery, isi **Delivery Address**.
4. Centang **"Out of Town"** jika keluar kota (akan kena +20% surcharge).
5. **Driver Selection Tab** (muncul HANYA jika Anda Pelanggan Loyal):
    - Pelanggan loyal = sudah pernah selesaikan min. 1 order
    - Bisa pilih driver dari list available
    - Pelanggan baru: driver di-auto-assign
6. Klik **"Review Order"**

**Step 3: Review & Confirm**

- Sistem tampilkan breakdown harga:
    - Base rate × duration
    - Out-of-town surcharge (jika applicable)
    - Total
- Klik **"Confirm Booking"**

**Step 4: Bayar**

- Order dibuat dengan status `Pending Payment`
- Pilih metode pembayaran (cash atau transfer)

**Availability Check:**
Jika kendaraan yang dipilih tidak tersedia untuk periode yang diminta, sistem otomatis menawarkan upgrade gratis ke kendaraan kelas lebih tinggi yang tersedia (dengan harga yang sama).

### 3.5 Booking Antar-Jemput (Shuttle)

1. Dari navigasi utama, klik menu **"Shuttle"** (mengarah ke `/shuttle`)
2. Pilih **rute perjalanan** dari daftar tarif yang tersedia (ditampilkan sebagai kartu rute dengan ikon peta)
3. Kartu rute menampilkan area asal, area tujuan, estimasi jarak, durasi, dan harga
4. Setelah memilih rute, isi form:
    - **Alamat Jemput** (pickup address)
    - **Alamat Tujuan** (destination address)
    - **Tanggal & Waktu** (scheduled date & time)
5. Review ringkasan tarif di panel samping
6. Klik **"Konfirmasi & Pesan"**
7. Order dibuat → lanjut ke pembayaran

**Riwayat Shuttle:** Klik tombol **"Riwayat Pesanan"** di halaman shuttle untuk melihat daftar pesanan shuttle sebelumnya.

### 3.6 Pembayaran Transfer

1. Di halaman order detail, lihat rekening tujuan
2. Transfer manual ke rekening tersebut
3. Upload bukti transfer:
    - Format: JPG / PNG / PDF
    - Max size: 5 MB
    - **Konfirmasi modal** akan muncul dengan preview gambar atau info file sebelum upload
4. Status berubah jadi **Waiting Verification**
5. Tunggu admin/kasir verifikasi (biasanya < 1 jam)
6. Jika approved: status **Paid**, kwitansi otomatis generated
7. Jika rejected: upload ulang bukti yang benar

### 3.7 Lihat Receipt

1. Setelah payment paid, buka order detail
2. Klik **"Lihat Kwitansi"**
3. Halaman receipt bisa di-print lewat browser (Ctrl+P) — layout dioptimalkan untuk kertas statement

### 3.8 Pembatalan Order

Customer dapat membatalkan pesanan (rental maupun shuttle) selama status order masih dalam salah satu kondisi berikut:
- Draft
- Pending Payment
- Waiting Verification
- Paid
- Ready to Dispatch

**Cara membatalkan:**
1. Buka halaman detail order
2. Klik **"Batalkan Pesanan"**
3. Isi alasan pembatalan
4. Konfirmasi → order berubah status menjadi **Cancelled**

⚠️ Order yang sudah berstatus **Ongoing** atau **Completed** tidak dapat dibatalkan.

### 3.9 Riwayat Order

1. Menu **"Pesanan"** di navigasi utama
2. Filter by status: Semua / Menunggu Bayar / Verifikasi / Dibayar / Siap Kirim / Berjalan / Selesai / Dibatalkan
3. Pagination tersedia untuk daftar panjang

### 3.10 Profil & Keamanan

1. Buka menu **"Profil"** di navigasi utama (mobile bottom nav atau dropdown avatar di desktop)
2. Update **Data Pribadi** (Nama, Email, No. HP)
3. Update **Password** untuk keamanan akun

### 3.11 Daftar Driver

1. Buka menu **"Driver"** dari navigasi
2. Anda dapat melihat daftar driver yang tersedia (nama, status) untuk referensi saat melakukan booking

---

## 4. Panduan Admin

### 4.0 Antarmuka Admin

Sistem admin menggunakan standar **URBAN 8 DASHBOARD**:
- **Fixed Sidebar:** Navigasi tetap di sisi kiri dengan menu: Dasbor, Kategori, Kendaraan, Pengemudi, Harga dan Tarif, Antar-Jemput, Pesanan, Verifikasi Pembayaran, Laporan, Pengaturan.
- **Breadcrumbs:** Menunjukkan lokasi halaman saat ini.
- **Filter di Setiap Modul:** Pencarian cepat (search), filter tanggal, dan harga.
- **Loading Skeleton & Wrapper:** Indikator loading saat data sedang dimuat.
- **Modal Konfirmasi & Toast Notification:** Aksi hapus/update menggunakan modal konfirmasi dan notifikasi toast.
- **Branding:** Logo URBAN 8 di header sidebar.
- **Tombol Bantuan:** Tersambung ke WhatsApp menggunakan nomor telepon dari Pengaturan (fallback ke halaman Settings jika belum diisi).

### 4.1 Dashboard Overview

Dashboard admin (`/admin/dashboard`) menampilkan:

- Total order hari ini
- Pending payment count
- Waiting verification count
- Available vs in-use vehicles
- Available vs on-duty drivers
- Recent bookings (dengan tombol "Update Status" untuk aksi cepat)
- **Chart Tren Real-Time** — grafik bulanan rental vs. revenue (range 6 bulan / 12 bulan)
- **Export CSV** — download data tren dalam format CSV

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
    - Gambar kendaraan (multi-image upload, bisa hapus per gambar)
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

1. Menu **"Harga dan Tarif"** → tab **"Pricing Rules"**
2. Klik **"+ Tambah Rule"**
3. Isi:
    - Vehicle Category
    - Rental Unit: hour/day/week/month
    - Min duration, Max duration
    - Base rate per unit
    - Discount rate (decimal, misal 0.10 = 10% off)
    - Out-of-town surcharge rate (default 0.20 = 20%)

**Contoh:** Sedan Premium — Daily — 1-6 days — Rp 300.000/day

### 4.6 Kelola Overtime Penalty

1. Menu **"Harga dan Tarif"** → tab **"Overtime"**
2. Per kategori, set `hourly_rate` (biaya keterlambatan per jam)
3. Saat customer return terlambat, sistem auto-calculate: `ceil(minutes_late / 60) × hourly_rate`

### 4.7 Kelola Shuttle Tariff

1. Menu **"Antar-Jemput"**
2. **"+ Tambah"**:
    - Area from (misal: "Bandara Juanda")
    - Area to (misal: "Hotel Mulia")
    - Estimated distance (km)
    - Estimated duration (minutes)
    - Tariff (fix price)

### 4.8 Verifikasi Pembayaran Transfer

1. Menu **"Verifikasi Pembayaran"** → list transfer pending
2. Klik order → lihat bukti transfer
3. Pilih:
    - **Approve** → status Paid, kwitansi generated, order → ready_to_dispatch
    - **Reject** → isi alasan, status rejected, customer bisa upload ulang

### 4.9 Dispatch Order

⚠️ **Hanya bisa dispatch order dengan:**

- Payment status = Paid
- Order status = ReadyToDispatch

1. Menu **"Pesanan"** → filter status `ready_to_dispatch`
2. Klik order → **"Dispatch"**
3. Konfirmasi
4. Sistem otomatis:
    - Order → ongoing
    - Vehicle → in_use
    - Driver → on_duty

### 4.10 Catat Return

1. Menu **"Pesanan"** → filter status `ongoing`
2. Klik order → **"Record Return"**
3. Isi actual return date & time
4. Sistem hitung overtime:
    - Jika late: order → waiting_overtime_payment, create payment baru
    - Jika on-time: order → completed, vehicle/driver released

### 4.11 Pembatalan Order (Admin)

1. Menu **"Pesanan"** → pilih order yang belum ongoing
2. Klik **"Batalkan"** → isi alasan pembatalan
3. Konfirmasi → order cancelled

### 4.12 Laporan

Menu **"Laporan"**:

- Filter by date range
- Total completed transactions
- Total revenue (paid only, exclude cancelled)
- Breakdown per vehicle category

### 4.13 Pengaturan Perusahaan

Menu **"Pengaturan"** (Admin only):

- **Logo Perusahaan** — upload gambar logo
- **Nama Perusahaan** — untuk ditampilkan di receipt/kwitansi
- **Nomor Telepon** — untuk fitur Bantuan (WhatsApp)
- **Alamat Perusahaan** — untuk di-cetak pada kwitansi

---

## 5. Panduan Kasir

Kasir punya akses terbatas ke operasi pembayaran. Kasir login ke `/admin/dashboard` namun hanya melihat menu: **Dasbor**, **Verifikasi Pembayaran**, dan **Laporan**.

### 5.1 Input Pembayaran Tunai

1. Customer datang dengan order ID
2. Buka **"Verifikasi Pembayaran"**
3. Cari order by ID atau customer name
4. Input pembayaran tunai (cash) — jumlah harus match dengan `total_amount` order
5. Konfirmasi — sistem otomatis:
    - Payment → paid
    - Order → ready_to_dispatch
    - Generate receipt
    - Log audit

### 5.2 Verifikasi Transfer

1. Buka menu **"Verifikasi Pembayaran"**
2. Lihat daftar transfer yang berstatus pending
3. Klik order untuk memeriksa validitas bukti transfer (PDF/JPG/PNG)
4. Klik **"Approve"** jika valid, atau **"Reject"** dengan alasan jika tidak sesuai

### 5.3 Cetak Kwitansi

1. Setelah payment paid, klik receipt number
2. Browser print (Ctrl+P) — layout dioptimalkan untuk kertas statement

---

## 6. Panduan Supir

### 6.1 Login

- Email/password dari admin saat create driver account
- Dashboard: `/driver/dashboard`

### 6.2 Navigasi Driver

Halaman driver dirancang **mobile-first** dengan layout menyerupai aplikasi smartphone:
- **Top bar fixed** — menampilkan avatar, nama pengemudi, label "Pengemudi", tombol notifikasi, dan tombol keluar. Header ini tetap terlihat saat scroll.
- **Bottom navigation pill** — menu: Dasbor, Pesanan, Status, Profil.

### 6.3 Dashboard

Dashboard driver menampilkan:
- Status ketersediaan saat ini (Tersedia/Off/Sedang Bertugas)
- Statistik: jumlah order aktif, order hari ini, total order selesai
- **Notifikasi terbaru** — pemberitahuan saat driver di-assign ke order baru (menampilkan customer, kendaraan, pickup info)
- Quick toggle untuk mengubah status

### 6.4 Lihat Order Assigned

1. Menu **"Pesanan"** di bottom navigation
2. Daftar order yang di-assign ke driver
3. Detail: customer, vehicle, pickup, schedule, status
4. Filter berdasarkan status order

### 6.5 Atur Status Ketersediaan

1. Menu **"Status"** di bottom navigation
2. Toggle antara **Tersedia** dan **Off**
3. ⚠️ Status **Dipesan** dan **Sedang Bertugas** ditetapkan otomatis oleh sistem berdasarkan siklus pesanan — tidak bisa diubah manual

### 6.6 Profil Driver

1. Menu **"Profil"** di bottom navigation
2. Update data pribadi (nama, email, no. HP)
3. Update password

### 6.7 Pelaksanaan Trip

1. Terima pemberitahuan via dashboard (notifikasi in-app)
2. Ambil vehicle dari garasi (koordinasi dengan admin)
3. Jalankan trip sesuai order
4. Return vehicle setelah selesai → lapor ke admin untuk record return

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
├── Enums/                 # UserRole, OrderStatus, PaymentStatus, dll
├── Http/
│   ├── Controllers/
│   │   ├── Admin/         # Admin-only controllers
│   │   ├── Customer/      # Customer-only controllers (Order, Shuttle, Profile, Driver)
│   │   ├── Driver/        # Driver-only controllers (Dashboard, Order, Status, Profile)
│   │   └── ...            # Shared: Catalog, Payment, Receipt, DashboardRedirect
│   ├── Middleware/
│   └── Requests/          # Form request validation
├── Models/                # Eloquent models
├── Notifications/         # DriverAssignedToOrder, dll
├── Policies/              # Authorization policies
└── Services/
    ├── Audit/             # AuditLogger
    ├── Dashboard/         # DashboardTrendService
    ├── Drivers/           # Assignment, availability
    ├── Orders/            # Lifecycle (Rental + Shuttle), status service
    ├── Pricing/           # Rental + shuttle pricing
    ├── Receipts/          # Receipt generation
    └── Vehicles/          # Upgrade service

database/
├── migrations/            # Schema
├── factories/             # Test data
└── seeders/               # Dev data

resources/js/
├── pages/                 # Inertia pages
│   ├── admin/             # Admin CRUD pages
│   ├── customer/          # Customer pages (orders, shuttle-orders, profile, drivers)
│   ├── driver/            # Driver pages (dashboard, orders, status, profile)
│   ├── catalog/           # Public catalog
│   ├── auth/              # Login, Register
│   ├── dashboards/        # Dashboard redirect pages
│   └── receipts/          # Receipt view/print
├── layouts/               # AdminLayout, CustomerLayout, DriverLayout
├── components/            # Shared UI components (customer/, driver/, ui/, dashboard/)
├── hooks/                 # Custom React hooks (use-flash-toast, dll)
├── lib/                   # Utility functions (labels, formatters)
├── routes/                # Wayfinder auto-generated route functions
└── types/                 # TypeScript type definitions

tests/
├── Feature/               # Integration tests
└── Unit/                  # Unit tests
```

### 7.4 Key URLs & Routes

| URL                           | Role     | Keterangan                             |
| ----------------------------- | -------- | -------------------------------------- |
| `/`                           | Public   | Welcome/landing page                   |
| `/catalog`                    | Public   | Browse kendaraan                       |
| `/catalog/{category}`         | Customer | Detail kategori                        |
| `/drivers`                    | Public   | Daftar driver                          |
| `/shuttle`                    | Customer | Booking shuttle (create)               |
| `/orders`                     | Customer | Daftar pesanan rental                  |
| `/orders/{order}`             | Customer | Detail pesanan                         |
| `/customer/shuttle-orders`    | Customer | Daftar pesanan shuttle                 |
| `/customer/shuttle-orders/{id}` | Customer | Detail pesanan shuttle               |
| `/profile`                    | Customer | Pengaturan profil                      |
| `/admin/dashboard`            | Admin/Kasir | Dashboard admin/kasir               |
| `/driver/dashboard`           | Driver   | Dashboard driver                       |
| `/driver/orders`              | Driver   | Daftar order driver                    |
| `/driver/status`              | Driver   | Atur status ketersediaan               |
| `/driver/profile`             | Driver   | Profil driver                          |

### 7.5 Running Tests

```bash
# All tests
php artisan test --compact

# Specific file
php artisan test --compact --filter=RentalPricingServiceTest

# Coverage
php artisan test --coverage

# TypeScript type check
npm run types:check
```

### 7.6 Code Style

```bash
# Laravel Pint (PHP formatter)
vendor/bin/pint --dirty --format agent

# Frontend
npm run lint:check
npm run types:check
npm run build
```

### 7.7 Wayfinder (Route Generation)

Wayfinder auto-generates TypeScript functions for Laravel routes. After adding/changing routes:

```bash
php artisan wayfinder:generate
```

Import from `@/actions/` (controllers) or `@/routes/` (named routes) in frontend code.

### 7.8 Laravel Brain (Project Analysis)

```bash
# Scan project
php artisan brain:scan

# Export AI context
php artisan brain:export-context --output=docs/brain-context/full-context.md --force

# Generate AI rules files
php artisan brain:generate-rules --force
```

### 7.9 Adding New Features

1. **Check guideline files:**
    - `AGENTS.md` — project architecture
    - `GEMINI.md` — AI agent rules
    - `docs/` — existing documentation

2. **Follow pattern:**
    - Route → Controller → Form Request → Service → Model
    - Write Pest test for behavior
    - Run `vendor/bin/pint --dirty` after changes

3. **Use Laravel Boost tools:**
    - `search-docs` for version-specific docs
    - `database-schema` before migrations

---

## 8. Business Rules

### BR-001: Min 3 Jam untuk Hourly Rental

Jika rental unit = hour, durasi minimal adalah 3 jam.

Implementation: `app/Services/Pricing/RentalPricingService.php`

### BR-002: Duration-Based Pricing

- Match `PricingRule` via `vehicle_category_id`, `rental_unit`, dan range `min_duration`-`max_duration`
- Formula: `total = base_rate × duration`

### BR-003: Out-of-Town Surcharge

- Jika `is_out_of_town = true`
- `surcharge = total × out_of_town_surcharge_rate` (default 0.20 = 20%)

### BR-004: Overtime Hitung Kelipatan Jam

- `overtime_hours = ceil(minutes_late / 60)`
- `overtime_charge = overtime_hours × hourly_rate`

### BR-005: Loyal Customer Detection

- `$customer->total_completed_orders >= 1`
- Pelanggan loyal bisa memilih driver saat booking

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
- Order: dispatched, returned, completed, cancelled
- Pricing: changes (future)

### BR-010: Vehicle Availability Check

- Sistem memeriksa ketersediaan kendaraan berdasarkan range tanggal (start-end)
- Jika kendaraan tidak tersedia, otomatis tawarkan upgrade ke kelas lebih tinggi

### BR-011: Order Cancellation Rules

- Order rental dan shuttle bisa dibatalkan pada status: Draft, Pending Payment, Waiting Verification, Paid, Ready to Dispatch
- Status **Ongoing** dan **Completed** tidak dapat dibatalkan
- Pembatalan wajib menyertakan alasan

### BR-012: Shuttle Tariff Matching

- Shuttle order menggunakan tarif tetap berdasarkan rute (area_from → area_to)
- Harga sudah ditentukan per rute, tidak dihitung berdasarkan durasi

### BR-013: Driver Status Lock

- Status driver **Dipesan (reserved)** dan **Sedang Bertugas (on_duty)** dikunci oleh sistem
- Driver hanya bisa toggle antara **Tersedia** dan **Off** secara manual

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

### "Kendaraan ini sudah dipesan"

**Cause:** Kendaraan tidak tersedia untuk periode yang diminta dan tidak ada kendaraan kelas lebih tinggi  
**Fix:** Pilih kendaraan lain atau ubah periode rental

### "Pesanan ini tidak dapat dibatalkan"

**Cause:** Order sudah berstatus ongoing atau completed  
**Fix:** Status tersebut tidak dapat dibatalkan; hubungi admin untuk penanganan manual

### Driver status terkunci

**Cause:** Ada order aktif yang mengunci status driver ke reserved / on_duty  
**Fix:** Status akan otomatis kembali setelah order selesai

---

## 10. FAQ

**Q: Berapa lama verifikasi transfer?**  
A: Manual oleh admin atau kasir, biasanya < 1 jam di jam kerja.

**Q: Bisa cancel order?**  
A: Ya, order bisa dibatalkan selama statusnya belum Ongoing atau Completed. Buka detail order → "Batalkan Pesanan" → isi alasan.

**Q: Refund bagaimana?**  
A: Refund masih diproses manual oleh admin. Full refund flow otomatis masih dalam roadmap.

**Q: Payment gateway VA kapan?**  
A: Roadmap v2.0.

**Q: Ada aplikasi mobile?**  
A: Belum, web responsive untuk sekarang. Halaman driver sudah dirancang mobile-first. v2.0 roadmap.

**Q: B2B account (corporate)?**  
A: `customer_type` enum sudah support `corporate`, tapi dashboard B2B khusus belum ada. v2.0 roadmap.

**Q: Apa bedanya rental dan shuttle?**  
A: Rental menyewa kendaraan berdasarkan durasi (jam/hari/minggu/bulan). Shuttle adalah layanan antar-jemput satu rute dengan harga tetap berdasarkan tarif rute.

**Q: Bagaimana driver tahu ada order baru?**  
A: Sistem mengirimkan notifikasi in-app ke dashboard driver ketika mereka di-assign ke order baru. Notifikasi menampilkan detail customer, kendaraan, dan pickup.

**Q: Receipt PDF download?**  
A: Saat ini cetak via browser (Ctrl+P). Layout sudah dioptimalkan untuk kertas statement. PDF download di roadmap.

**Q: Apakah ada pengecekan ketersediaan kendaraan?**  
A: Ya, sistem sudah memeriksa ketersediaan kendaraan berdasarkan range tanggal. Jika tidak tersedia, otomatis menawarkan upgrade gratis ke kelas lebih tinggi.

---

## 11. Changelog

### v1.2 (24 Mei 2026)

- **Shuttle Redesign:** Halaman shuttle order (booking, list, detail) sepenuhnya di-redesign untuk match dengan estetika catalog utama. Menu shuttle diakses via `/shuttle` dari navigasi utama.
- **Pembatalan Order:** Customer kini dapat membatalkan pesanan rental maupun shuttle (selama status memenuhi syarat).
- **Driver Fixed Topbar:** Header driver portal kini tetap terlihat saat scroll (fixed/sticky) dengan ukuran compact.
- **Redirect 301:** URL lama `/customer/shuttle-orders/create` otomatis redirect ke `/shuttle`.

### v1.1 (12 Mei 2026)

- **Customer:** Popup modal filter di katalog, paginasi, menu profil, menu driver, toast notification, driver selection untuk loyal customer.
- **Admin:** UI dengan tema URBAN 8 (fixed sidebar, breadcrumbs), filter di setiap modul, loading skeleton, modal konfirmasi, chart tren real-time, export CSV, admin settings, support WhatsApp.
- **Kasir:** Proses eksplisit verifikasi bukti transfer.
- **Driver:** Portal mobile-first dengan dashboard, order list, status toggle, profil, notifikasi in-app.
- **General:** Toast notification modern, receipt layout statement paper, branding URBAN 8 konsisten.

### v1.0 (9 Mei 2026)

- Initial release: Full MVP implementation (master data, booking engine, payment & order lifecycle, dashboard, reports, audit).

---

## Referensi Dokumen

| Dokumen            | Path                                     | Isi                          |
| ------------------ | ---------------------------------------- | ---------------------------- |
| PRD                | `docs/PRD.md`                            | Product requirement document |
| Study Case         | `docs/STUDY_CASE.md`                     | Business requirement awal    |
| UML (design)       | `docs/UML_Rental_Kendaraan_PlantUML/`    | UML target design            |
| UML (as-built)     | `docs/UML_FINAL/`                        | UML sesuai implementasi      |
| MVP Final          | `docs/MVP_FINAL.md`                      | Final MVP as-built           |
| Design System      | `docs/DESIGN.md`                         | Design tokens & styling      |
| Deployment         | `docs/DEPLOYMENT.md`                     | Docker & deployment guide    |
| AI Context         | `AGENTS.md`, `GEMINI.md`                 | Laravel Brain generated      |

---

**Maintained by:** Development Team  
**Brand:** URBAN 8
