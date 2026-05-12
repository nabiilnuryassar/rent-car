# 🚗 URBAN 8 Rent Car — Demo Seeder Data

> Panduan lengkap data demo yang tersedia di sistem untuk keperluan **presentasi** dan **uji coba**.
> Semua data di-seed melalui `database/seeders/DatabaseSeeder.php`.

---

## 🔐 Demo Accounts

Semua akun menggunakan password yang sama: **`password`**

| 👤 Role | 📧 Email | 🔑 Password | 📝 Catatan |
|---|---|---|---|
| 👑 **Admin** | `admin@urban8.com` | `password` | Akses penuh ke dashboard admin, manajemen armada, verifikasi pembayaran |
| 💰 **Kasir** | `kasir@urban8.com` | `password` | Memproses pembayaran tunai, cetak kwitansi |
| 🆕 **Customer Baru** | `customer@urban8.com` | `password` | Belum pernah order (**tidak bisa pilih driver**) |
| ⭐ **Customer Loyal** | `loyal@urban8.com` | `password` | 6 order selesai (**berhak pilih driver**) |
| 🚘 **Driver** | `driver@urban8.com` | `password` | Pengemudi Eksekutif · 8 tahun pengalaman |

> 💡 **Tip Presentasi:** Siapkan dua tab browser terpisah untuk demo side-by-side antara customer baru dan customer loyal.

---

## 📊 Data Volume Overview

Ringkasan volume data yang tersedia setelah `php artisan db:seed`:

| 📦 Entitas | 🔢 Jumlah | 🏷️ Keterangan |
|---|---|---|
| 🚗 **Vehicles** | **71** | Tersebar di 7 kategori |
| 🗂️ **Vehicle Categories** | **7** | Sedan, MPV, SUV, Hatchback, Pickup, Box, Minibus |
| 👨‍✈️ **Drivers** | **21** | Status bervariasi: Available, OnDuty, OffDuty, Reserved |
| 👥 **Customers** | **14** | Campuran tipe **New** dan **Loyal** |
| 📋 **Rental Orders** | **42** | 7 skenario demo + 35 bulk orders |
| 🚕 **Shuttle Orders** | **2** | Bandara & Stasiun |
| 💳 **Payments** | **40+** | Cash & Bank Transfer dengan berbagai status |
| 💰 **Pricing Rules** | **28** | 4 unit waktu × 7 kategori |

### 🚗 Distribusi Kendaraan per Kategori

| Kategori | Contoh Unit | Estimasi |
|---|---|---|
| 🚙 **Sedan** | Honda City, Toyota Vios, Camry, Civic, Corolla, Mazda3, C-Class | ~11 unit |
| 🚐 **MPV** | Avanza, Xpander, Innova Zenix, Ertiga, Xenia, Mobilio, Stargazer, Confero | ~16 unit |
| 🏔️ **SUV** | Fortuner, Pajero Sport, HR-V, CR-V, Creta, Rush, Terios, BR-V | ~16 unit |
| 🚗 **Hatchback** | Brio, Yaris, Jazz, Baleno, Agya | ~10 unit |
| 🛻 **Bak Terbuka (Pickup)** | Gran Max, Hilux, Carry, Triton | ~7 unit |
| 📦 **Mobil Box** | L300 Box, Hino Engkel, Isuzu Traga | ~5 unit |
| 🚌 **Minibus** | Hiace Premio, Hiace Commuter, Isuzu Elf | ~5 unit |

### 📋 Distribusi Status Order

| Status | Estimasi | Warna Badge |
|---|---|---|
| 🟡 **Pending Payment** | ~6 order | Kuning |
| 🔵 **Waiting Verification** | ~3 order | Biru |
| 🟢 **Paid** | ~2 order | Hijau |
| 🟣 **Ready to Dispatch** | ~3 order | Ungu |
| 🟠 **Ongoing** | ~4 order | Oranye |
| ✅ **Completed** | ~7 order | Hijau tua |
| ❌ **Cancelled** | ~2 order | Merah |
| ⏰ **Waiting Overtime Payment** | 1 order | Amber |
| 📝 **Draft (with Upgrade Offer)** | 1 order | Abu-abu |

---

## 🎬 Use Cases Ready to Demo

Empat skenario demo yang dapat langsung dipresentasikan menggunakan data seeder:

### 1️⃣ Catalog Pagination

> **Fitur:** Menampilkan 4 kendaraan per halaman dari total 71 unit.

| Langkah | Aksi |
|---|---|
| 1 | Buka halaman `/catalog` (tanpa perlu login) |
| 2 | Tunjukkan **4 kartu kendaraan** per halaman |
| 3 | Klik tombol navigasi paginasi untuk pindah halaman |
| 4 | Sorot total halaman yang banyak sebagai bukti **data skala nyata** |

🎯 **Highlight:** Performa tetap ringan meski data besar, berkat **server-side pagination** dari Laravel.

---

### 2️⃣ Driver Restriction (Customer Type)

> **Fitur:** Hanya customer **Loyal** yang berhak memilih driver secara manual.

| 🧪 Skenario | 🔑 Akun | 🎬 Hasil |
|---|---|---|
| Customer Baru | `customer@urban8.com` | 🚫 **Tidak bisa pilih driver** — sistem otomatis menugaskan |
| Customer Loyal | `loyal@urban8.com` | ✅ **Bisa pilih driver** dari daftar pengemudi tersedia |

🎯 **Highlight:** Logika bisnis **loyalty tier** yang memberi reward privilege bagi pelanggan setia.

---

### 3️⃣ Order History (Customer Dashboard)

> **Fitur:** Customer melihat riwayat pesanan dengan berbagai status.

| Langkah | Aksi |
|---|---|
| 1 | Login sebagai `loyal@urban8.com` |
| 2 | Buka halaman **My Orders** / Riwayat Pesanan |
| 3 | Tunjukkan **tab status yang bervariasi**: Ongoing, Completed, Pending Payment, Waiting Verification |
| 4 | Klik salah satu order untuk melihat detail, bukti transfer, dan kwitansi |

🎯 **Highlight:** Pengalaman customer yang **transparan** dengan status real-time di setiap tahap pesanan.

---

### 4️⃣ Admin Dashboard (Operasional)

> **Fitur:** Dashboard admin dengan statistik, filter, dan kontrol penuh.

| Langkah | Aksi |
|---|---|
| 1 | Login sebagai `admin@urban8.com` |
| 2 | Lihat **data statistik** di dashboard (total order, revenue, armada aktif) |
| 3 | Buka **Manajemen Armada** → demo **filter kendaraan** berdasarkan status & kategori |
| 4 | Buka salah satu order aktif → demo **cancel order** |
| 5 | Refresh atau pindah halaman untuk demo **skeleton loading state** |

🎯 **Highlight:** Kontrol operasional terpusat dengan **UX modern** (skeleton, filter reaktif, optimistic updates).

---

## 🎯 Ringkasan Demo Flow

Urutan ideal untuk presentasi 15 menit:

1. 🏠 **Homepage & Catalog** → tunjukkan paginasi 71 kendaraan
2. 🆕 **Login Customer Baru** → coba order, tunjukkan driver tidak bisa dipilih
3. ⭐ **Logout & Login Customer Loyal** → order ulang, driver bisa dipilih
4. 📋 **Riwayat Pesanan Loyal** → tampilkan variasi status
5. 👑 **Login Admin** → dashboard statistik, filter armada, cancel order
6. 💰 **Login Kasir** → verifikasi pembayaran & cetak kwitansi

---

## 🛠️ Menjalankan Ulang Seeder

```bash
php artisan migrate:fresh --seed
```

> ⚠️ Perintah di atas akan **menghapus seluruh data** dan mengisi ulang dari nol. Gunakan hanya di environment **development** atau **demo**.

---

**Dokumen ini dibuat untuk presentasi demo URBAN 8 Rent Car.**
Sumber data: `database/seeders/DatabaseSeeder.php`
