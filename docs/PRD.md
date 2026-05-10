# Product Requirements Document: Web App Sistem Rental Kendaraan

## 1. Document Metadata

- **Project Name:** Rental Kendaraan Web App / Fleet Rental Management System
- **Document Version:** v1.0
- **Product Owner / PM:** TBD
- **Lead Developer:** TBD
- **Status:** Draft
- **Target Release:** MVP Release / Sprint TBD
- **Reference Requirement:** Final Draft Elisitasi Rental Kendaraan

---

## 2. Executive Summary

Web App Sistem Rental Kendaraan adalah platform digital untuk mengelola proses penyewaan kendaraan, layanan antar-jemput, supir, pembayaran, kwitansi, dan histori pelanggan secara terintegrasi. Produk ini bertujuan meningkatkan efisiensi operasional internal sekaligus memberi kemudahan bagi pelanggan dalam melihat katalog kendaraan, melakukan pemesanan, memilih layanan, dan menyelesaikan pembayaran.

---

## 3. Problem Statement & Objective

### The Problem

Saat ini proses rental kendaraan masih memiliki banyak titik operasional yang rawan lambat, tidak konsisten, dan sulit dipantau, seperti pengecekan ketersediaan kendaraan, pencatatan pelanggan lama, perhitungan tarif sewa, verifikasi pembayaran, pemilihan supir, serta penerbitan kwitansi.

Selain itu, aturan bisnis rental cukup kompleks karena mencakup:

- sewa per jam, harian, mingguan, dan bulanan;
- minimal sewa 3 jam untuk rental per jam;
- tarif semakin murah jika durasi sewa semakin panjang;
- tambahan 20% untuk luar kota;
- overtime dihitung per jam;
- pelanggan lama dapat memilih supir;
- kendaraan bisa di-_upgrade_ gratis jika stok kendaraan pilihan tidak tersedia;
- pembayaran transfer harus diverifikasi sebelum transaksi dianggap lunas.

### The Objective

Membangun web app rental kendaraan yang mampu:

- menyediakan katalog kendaraan dan status ketersediaan secara digital;
- mengelola transaksi sewa kendaraan dan layanan antar-jemput;
- menghitung tarif, surcharge, dan overtime secara otomatis;
- mengelola pelanggan, supir, kendaraan, pembayaran, dan kwitansi;
- memastikan kendaraan hanya dapat digunakan/dikirim setelah pembayaran lunas;
- membantu admin dan kasir bekerja lebih cepat, akurat, dan terdokumentasi.

---

## 4. Target Audience

### Primary Users

| User                 | Deskripsi                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Customer / Pelanggan | Pengguna yang melakukan pemesanan sewa kendaraan atau layanan antar-jemput                      |
| Pelanggan Lama       | Customer yang memiliki histori transaksi dan mendapatkan fitur khusus seperti memilih supir     |
| Admin                | Staff internal yang mengelola data kendaraan, tarif, supir, pelanggan, dan transaksi            |
| Kasir                | Staff internal yang mencatat pembayaran tunai, memverifikasi transfer, dan menerbitkan kwitansi |
| Supir                | Driver yang menerima penugasan kendaraan dan menjalankan layanan                                |

### Secondary Users

| User                 | Deskripsi                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Owner / Manajemen    | Pihak manajemen yang membutuhkan laporan transaksi, pendapatan, dan performa operasional |
| System Administrator | Pihak teknis yang mengelola akses, konfigurasi sistem, dan deployment                    |

---

## 5. Project Scope

### In-Scope

Fitur yang wajib dikerjakan pada fase MVP:

1. **Authentication & User Management**
    - Login customer, admin, kasir, dan supir.
    - Registrasi customer.
    - Manajemen profil pelanggan.
    - Identifikasi pelanggan lama berdasarkan histori transaksi.

2. **Customer & History Management**
    - Pencatatan data pelanggan.
    - Riwayat transaksi pelanggan.
    - Penentuan status pelanggan lama.

3. **Vehicle Management**
    - Manajemen kategori kendaraan.
    - Manajemen kendaraan.
    - Status ketersediaan kendaraan.
    - Katalog kendaraan untuk customer.

4. **Driver Management**
    - Manajemen data supir.
    - Status ketersediaan supir.
    - Fitur pilih supir khusus pelanggan lama.

5. **Rental Transaction**
    - Pemesanan kendaraan dengan supir.
    - Pilihan durasi sewa: per jam, per hari, per minggu, per bulan.
    - Validasi minimal sewa 3 jam untuk skema per jam.
    - Pilihan ambil kendaraan di tempat atau dikirim ke lokasi customer.
    - Pilihan dalam kota atau luar kota.
    - Free upgrade kendaraan jika kendaraan pilihan tidak tersedia.

6. **Shuttle / Antar-Jemput Service**
    - Pemesanan layanan antar-jemput saja.
    - Perhitungan tarif berdasarkan tabel jarak dan estimasi waktu.

7. **Pricing Engine**
    - Hitung tarif berdasarkan jenis kendaraan.
    - Hitung tarif berdasarkan durasi.
    - Hitung diskon/rate lebih murah untuk durasi lebih panjang.
    - Tambahan biaya 20% untuk luar kota.
    - Hitung overtime per jam.

8. **Payment & Billing**
    - Pembayaran tunai.
    - Pembayaran transfer.
    - Upload bukti transfer.
    - Verifikasi transfer oleh admin/kasir.
    - Lock transaksi sebelum lunas.

9. **Receipt / Kwitansi**
    - Generate kwitansi digital.
    - Cetak/download kwitansi.
    - Nomor kwitansi otomatis.

10. **Admin Dashboard**

- Ringkasan transaksi.
- Status order.
- Status pembayaran.
- Status kendaraan dan supir.

---

### Out-of-Scope

Fitur yang tidak dikerjakan pada MVP dan dapat masuk ke fase berikutnya:

| Fitur                                  | Alasan                                                           |
| -------------------------------------- | ---------------------------------------------------------------- |
| GPS tracking real-time kendaraan       | Dieliminasi dari MVP karena kompleksitas teknis dan biaya tinggi |
| Mobile app native Android/iOS          | MVP difokuskan pada web app                                      |
| Payment gateway otomatis               | MVP menggunakan upload bukti transfer dan verifikasi manual      |
| Integrasi WhatsApp notification        | Bisa dikembangkan setelah core flow stabil                       |
| Live chat customer service             | Bukan kebutuhan inti MVP                                         |
| Dynamic route calculation via Maps API | Tarif antar-jemput pada MVP menggunakan tabel jarak dan waktu    |
| Manajemen BBM                          | Tidak sesuai requirement karena rental tanpa BBM                 |
| Loyalty point / membership reward      | Bisa masuk fase lanjutan                                         |
| Multi-branch management                | MVP diasumsikan untuk satu cabang operasional terlebih dahulu    |

---

## 6. Functional Requirements

| Epic / Modul         | User Story                                                                                                     | Acceptance Criteria (Syarat Lulus)                                                                                                                                                                                                                                                    | Priority |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Auth                 | Sebagai customer, saya bisa membuat akun agar dapat melakukan pemesanan kendaraan.                             | 1. Customer dapat mengisi nama, email, nomor HP, dan password. <br><br> 2. Email tidak boleh duplikat. <br><br> 3. Password disimpan dalam bentuk hash. <br><br> 4. Setelah registrasi berhasil, customer dapat login.                                                                | High     |
| Auth                 | Sebagai user, saya bisa login menggunakan email dan password.                                                  | 1. Login berhasil jika kredensial valid. <br><br> 2. Sistem menampilkan pesan error jika email/password salah. <br><br> 3. User diarahkan ke dashboard sesuai role.                                                                                                                   | High     |
| Auth                 | Sebagai admin, saya bisa mengatur role user agar akses sistem sesuai tanggung jawab.                           | 1. Admin dapat melihat daftar user. <br><br> 2. Admin dapat mengubah role user menjadi customer, admin, kasir, atau supir. <br><br> 3. User hanya bisa mengakses fitur sesuai role.                                                                                                   | High     |
| Customer Management  | Sebagai admin, saya bisa melihat data pelanggan dan histori transaksinya.                                      | 1. Admin dapat melihat daftar customer. <br><br> 2. Admin dapat membuka detail customer. <br><br> 3. Sistem menampilkan histori order customer. <br><br> 4. Sistem dapat menandai customer sebagai pelanggan lama berdasarkan histori transaksi.                                      | High     |
| Customer Management  | Sebagai sistem, saya bisa mengidentifikasi pelanggan lama agar fitur khusus dapat diberikan.                   | 1. Customer dengan minimal satu transaksi selesai dianggap pelanggan lama. <br><br> 2. Status pelanggan lama digunakan untuk membuka fitur pilih supir. <br><br> 3. Customer baru tidak dapat memilih supir manual.                                                                   | High     |
| Vehicle Management   | Sebagai admin, saya bisa mengelola kategori kendaraan seperti Sedan, MPV, Mobil Box, Bak Terbuka, dan Minibus. | 1. Admin dapat membuat kategori kendaraan. <br><br> 2. Admin dapat mengubah nama kategori, urutan kelas, dan status aktif. <br><br> 3. Kategori digunakan dalam katalog dan pricing.                                                                                                  | High     |
| Vehicle Management   | Sebagai admin, saya bisa mengelola data kendaraan.                                                             | 1. Admin dapat menambah kendaraan. <br><br> 2. Data kendaraan minimal berisi plat nomor, kategori, nama/model, status, dan tarif dasar. <br><br> 3. Admin dapat mengubah status kendaraan menjadi tersedia, disewa, maintenance, atau nonaktif.                                       | High     |
| Vehicle Catalog      | Sebagai customer, saya bisa melihat katalog kendaraan dan status ketersediaannya.                              | 1. Customer dapat melihat daftar kategori kendaraan. <br><br> 2. Customer dapat melihat kendaraan yang tersedia. <br><br> 3. Kendaraan yang tidak tersedia tidak bisa dipilih untuk order normal.                                                                                     | High     |
| Driver Management    | Sebagai admin, saya bisa mengelola data supir.                                                                 | 1. Admin dapat menambah, mengubah, dan menonaktifkan supir. <br><br> 2. Supir memiliki status tersedia, bertugas, cuti, atau nonaktif. <br><br> 3. Supir tersedia dapat ditugaskan ke transaksi rental.                                                                               | High     |
| Driver Selection     | Sebagai pelanggan lama, saya bisa memilih supir yang diinginkan.                                               | 1. Fitur pilih supir hanya muncul untuk pelanggan lama. <br><br> 2. Sistem hanya menampilkan supir yang tersedia pada jadwal sewa. <br><br> 3. Jika supir tidak tersedia, customer harus memilih supir lain atau sistem memilih otomatis.                                             | High     |
| Rental Order         | Sebagai customer, saya bisa membuat pemesanan sewa kendaraan lengkap dengan supir.                             | 1. Customer dapat memilih kendaraan/kategori kendaraan. <br><br> 2. Customer dapat memilih tanggal dan jam mulai sewa. <br><br> 3. Customer dapat memilih durasi sewa. <br><br> 4. Sistem otomatis memasangkan supir jika customer bukan pelanggan lama.                              | High     |
| Rental Duration      | Sebagai customer, saya bisa memilih skema sewa per jam, harian, mingguan, atau bulanan.                        | 1. Sistem menyediakan pilihan hourly, daily, weekly, monthly. <br><br> 2. Jika memilih hourly, minimal durasi adalah 3 jam. <br><br> 3. Sistem menolak order hourly kurang dari 3 jam.                                                                                                | High     |
| Pickup / Delivery    | Sebagai customer, saya bisa memilih kendaraan diambil di tempat atau dikirim ke lokasi saya.                   | 1. Customer dapat memilih opsi ambil di tempat. <br><br> 2. Customer dapat memilih opsi dikirim ke lokasi. <br><br> 3. Jika memilih dikirim, customer wajib mengisi alamat pengiriman.                                                                                                | High     |
| City Type            | Sebagai customer, saya bisa memilih sewa dalam kota atau luar kota.                                            | 1. Customer dapat memilih jenis wilayah: dalam kota atau luar kota. <br><br> 2. Jika luar kota, sistem menambahkan surcharge 20%. <br><br> 3. Rincian surcharge tampil pada breakdown harga.                                                                                          | High     |
| Pricing Engine       | Sebagai sistem, saya bisa menghitung tarif sewa otomatis berdasarkan kendaraan, durasi, dan wilayah.           | 1. Sistem mengambil tarif dari pricing rule. <br><br> 2. Sistem menghitung subtotal berdasarkan durasi. <br><br> 3. Sistem menurunkan rate jika durasi lebih panjang sesuai aturan tarif. <br><br> 4. Total harga tampil sebelum checkout.                                            | High     |
| Overtime             | Sebagai kasir/admin, saya bisa menghitung denda overtime saat kendaraan dikembalikan terlambat.                | 1. Admin/kasir dapat memasukkan waktu pengembalian aktual. <br><br> 2. Sistem membandingkan waktu selesai sewa dengan waktu aktual. <br><br> 3. Kelebihan waktu dihitung per kelipatan jam. <br><br> 4. Sistem menambahkan biaya overtime ke tagihan akhir.                           | High     |
| Free Upgrade         | Sebagai customer, saya bisa mendapatkan penawaran free upgrade jika kendaraan pilihan tidak tersedia.          | 1. Jika kendaraan/kategori pilihan tidak tersedia, sistem mencari kendaraan kelas lebih tinggi. <br><br> 2. Jika tersedia, sistem menawarkan free upgrade. <br><br> 3. Harga tetap mengikuti harga kendaraan/kategori awal. <br><br> 4. Customer dapat menerima atau menolak upgrade. | Medium   |
| Shuttle Service      | Sebagai customer, saya bisa memesan layanan antar-jemput saja tanpa sewa kendaraan harian.                     | 1. Customer dapat memilih layanan antar-jemput. <br><br> 2. Customer wajib mengisi titik jemput dan tujuan. <br><br> 3. Sistem menghitung tarif berdasarkan tabel jarak dan waktu.                                                                                                    | High     |
| Shuttle Tariff       | Sebagai admin, saya bisa mengelola tabel tarif antar-jemput berdasarkan jarak dan estimasi waktu.              | 1. Admin dapat menambah tarif shuttle. <br><br> 2. Tarif berisi area/jarak, estimasi waktu, dan harga. <br><br> 3. Sistem memakai tabel ini saat customer membuat order shuttle.                                                                                                      | High     |
| Payment Cash         | Sebagai kasir, saya bisa mencatat pembayaran tunai.                                                            | 1. Kasir dapat memilih order yang belum lunas. <br><br> 2. Kasir dapat memasukkan nominal pembayaran. <br><br> 3. Jika nominal sesuai total tagihan, status order menjadi PAID. <br><br> 4. Sistem dapat generate kwitansi.                                                           | High     |
| Payment Transfer     | Sebagai customer, saya bisa mengupload bukti transfer.                                                         | 1. Customer dapat memilih metode transfer. <br><br> 2. Customer dapat mengupload bukti transfer. <br><br> 3. Status pembayaran menjadi WAITING_VERIFICATION. <br><br> 4. Order belum boleh dikirim/diambil sebelum diverifikasi.                                                      | High     |
| Payment Verification | Sebagai kasir/admin, saya bisa memverifikasi pembayaran transfer.                                              | 1. Kasir/admin dapat melihat bukti transfer. <br><br> 2. Kasir/admin dapat menerima atau menolak bukti transfer. <br><br> 3. Jika diterima, status pembayaran menjadi PAID. <br><br> 4. Jika ditolak, sistem memberi status REJECTED dan customer perlu upload ulang.                 | High     |
| Order Locking        | Sebagai sistem, saya bisa mengunci order sebelum pembayaran lunas.                                             | 1. Order dengan status PENDING atau WAITING_VERIFICATION tidak bisa masuk ke proses dispatch. <br><br> 2. Tombol kirim/ambil kendaraan hanya aktif jika pembayaran PAID. <br><br> 3. Admin mendapat warning jika mencoba memproses order yang belum lunas.                            | High     |
| Receipt              | Sebagai customer, saya bisa mendapatkan kwitansi setelah pembayaran lunas.                                     | 1. Kwitansi dibuat hanya setelah status pembayaran PAID. <br><br> 2. Kwitansi berisi nomor transaksi, data customer, detail layanan, breakdown biaya, metode pembayaran, dan tanggal pembayaran. <br><br> 3. Kwitansi dapat diunduh atau dicetak.                                     | High     |
| Dispatch             | Sebagai admin, saya bisa mengkonfirmasi kendaraan dikirim atau diambil setelah order lunas.                    | 1. Admin dapat mengubah status order menjadi ONGOING setelah kendaraan diserahkan/dikirim. <br><br> 2. Status kendaraan berubah menjadi RENTED/IN_USE. <br><br> 3. Status supir berubah menjadi ASSIGNED/ON_DUTY.                                                                     | High     |
| Return Process       | Sebagai admin/kasir, saya bisa mencatat pengembalian kendaraan.                                                | 1. Admin/kasir dapat memasukkan waktu kendaraan kembali. <br><br> 2. Sistem menghitung apakah terjadi overtime. <br><br> 3. Jika tidak ada overtime, order dapat diselesaikan. <br><br> 4. Jika ada overtime, sistem membuat tambahan tagihan.                                        | High     |
| Dashboard            | Sebagai admin, saya bisa melihat ringkasan operasional rental.                                                 | 1. Dashboard menampilkan total order hari ini. <br><br> 2. Dashboard menampilkan order pending payment. <br><br> 3. Dashboard menampilkan kendaraan tersedia/disewa. <br><br> 4. Dashboard menampilkan supir tersedia/bertugas.                                                       | Medium   |
| Reporting            | Sebagai manajemen, saya bisa melihat laporan transaksi dan pendapatan.                                         | 1. Sistem menyediakan filter tanggal. <br><br> 2. Sistem menampilkan total transaksi. <br><br> 3. Sistem menampilkan total pendapatan. <br><br> 4. Data dapat diekspor ke CSV/PDF pada fase lanjutan.                                                                                 | Medium   |

---

## 7. Non-Functional Requirements

### Tech Stack

| Layer          | Rekomendasi                                                             |
| -------------- | ----------------------------------------------------------------------- |
| Frontend       | Next.js / React                                                         |
| Backend        | Laravel / NestJS                                                        |
| Database       | PostgreSQL / MySQL                                                      |
| Authentication | JWT / Session Auth                                                      |
| Storage        | Local storage / S3-compatible storage untuk bukti transfer dan kwitansi |
| PDF Generator  | Server-side PDF generation                                              |
| Deployment     | Docker-based deployment                                                 |
| Web Server     | Nginx                                                                   |
| OS Server      | Linux Ubuntu LTS                                                        |

---

### Performance

- API response time untuk endpoint umum maksimal **500ms** pada beban normal.
- Halaman katalog kendaraan harus dapat dimuat maksimal **3 detik** pada koneksi normal.
- Dashboard admin harus dapat menampilkan data ringkasan maksimal **5 detik**.
- Sistem harus mampu menangani minimal:
    - 100 customer aktif per hari;
    - 1.000 data transaksi awal;
    - 500 data pelanggan awal;
    - 100 data kendaraan awal.

---

### Security & Compliance

- Password wajib di-_hash_ menggunakan bcrypt/argon2.
- Semua halaman authenticated harus dilindungi session/JWT.
- Role-based access control wajib diterapkan untuk customer, admin, kasir, dan supir.
- Upload bukti transfer hanya menerima file:
    - JPG
    - PNG
    - PDF

- Maksimal ukuran file bukti transfer: **5 MB**.
- File upload harus divalidasi MIME type-nya.
- Sistem wajib berjalan di atas HTTPS pada production.
- Data transaksi tidak boleh dapat diubah sembarangan setelah status COMPLETED.
- Kwitansi yang sudah terbit harus memiliki nomor unik.
- Aktivitas penting seperti verifikasi pembayaran, perubahan tarif, dan pembatalan order harus tercatat di audit log.

---

### Availability & Reliability

- Target uptime production minimal **99%** untuk MVP.
- Backup database minimal **1x per hari**.
- Sistem harus memiliki mekanisme rollback deployment.
- Error pada proses pembayaran/verifikasi tidak boleh menghapus data order.

---

### Usability

- UI harus responsif untuk desktop dan mobile browser.
- Customer dapat menyelesaikan order dalam maksimal 5 langkah:
    1. pilih layanan,
    2. pilih kendaraan / tujuan,
    3. isi jadwal dan detail,
    4. lihat total biaya,
    5. bayar / upload bukti transfer.

- Admin dashboard harus memiliki navigasi jelas untuk:
    - kendaraan,
    - supir,
    - pelanggan,
    - transaksi,
    - pembayaran,
    - laporan.

---

### Environment

| Environment | Fungsi                        |
| ----------- | ----------------------------- |
| Local       | Development individu          |
| Staging     | QA, UAT, review PM            |
| Production  | Sistem live untuk operasional |

---

## 8. Dependencies & Assumptions

### Dependencies

| Dependency               | Keterangan                                     | Risiko Jika Belum Siap                     |
| ------------------------ | ---------------------------------------------- | ------------------------------------------ |
| Data kendaraan           | Data kategori, armada, plat nomor, tarif dasar | Katalog dan order tidak bisa berjalan      |
| Data supir               | Nama supir, kontak, status, jadwal             | Assignment driver tidak akurat             |
| Tabel tarif rental       | Tarif per kategori dan durasi                  | Pricing engine tidak bisa menghitung biaya |
| Tabel tarif antar-jemput | Tarif berdasarkan jarak/waktu                  | Modul shuttle tidak bisa digunakan         |
| Format kwitansi          | Template resmi perusahaan                      | Kwitansi tidak sesuai kebutuhan bisnis     |
| Rekening bank perusahaan | Informasi rekening untuk pembayaran transfer   | Customer tidak bisa melakukan transfer     |
| Admin/kasir verifier     | Personel internal untuk validasi pembayaran    | Transfer tidak bisa dikonfirmasi           |
| Server production        | Infrastruktur hosting                          | Aplikasi tidak bisa dirilis                |
| Domain & SSL             | URL resmi dan keamanan HTTPS                   | Production tidak memenuhi standar keamanan |

---

### Assumptions

- Perusahaan menggunakan satu cabang operasional pada fase MVP.
- Semua rental kendaraan sudah termasuk supir.
- Biaya BBM tidak dihitung oleh sistem karena rental bersifat tanpa BBM.
- Customer memiliki koneksi internet untuk mengakses web app.
- Customer dapat mengupload bukti transfer jika memilih metode transfer.
- Admin/kasir tersedia untuk memverifikasi transfer secara manual.
- Tarif kendaraan dan tarif antar-jemput akan disediakan oleh pihak bisnis sebelum development pricing engine.
- Free upgrade hanya berlaku jika kendaraan kelas lebih tinggi tersedia.
- Harga free upgrade tetap memakai harga kendaraan/kategori awal.
- Pelanggan lama ditentukan berdasarkan histori transaksi selesai.
- GPS tracking tidak termasuk dalam MVP.

---

## 9. Success Metrics (KPIs)

| KPI                                    | Target MVP                                                     |
| -------------------------------------- | -------------------------------------------------------------- |
| Digital order adoption                 | Minimal 60% order baru dicatat melalui sistem                  |
| Payment verification time              | Rata-rata verifikasi transfer maksimal 15 menit pada jam kerja |
| Order processing accuracy              | Minimal 95% transaksi tidak membutuhkan koreksi manual         |
| Receipt generation success rate        | 100% pembayaran PAID menghasilkan kwitansi                     |
| Vehicle availability accuracy          | Minimal 95% status kendaraan sesuai kondisi aktual             |
| Reduction in manual calculation errors | Turun minimal 80% dibanding proses manual                      |
| Admin task efficiency                  | Waktu input transaksi turun minimal 40%                        |
| Customer booking completion rate       | Minimal 70% customer yang mulai booking menyelesaikan order    |
| System uptime                          | Minimal 99% selama periode MVP                                 |
| Payment lock compliance                | 100% kendaraan tidak dapat diproses sebelum pembayaran PAID    |

---

## 10. Design & Architecture Attachments

### UI/UX Design

- **Figma:** TBD
- **Design System:** TBD
- **Responsive Breakpoints:**
    - Mobile: 360px – 767px
    - Tablet: 768px – 1023px
    - Desktop: ≥1024px

---

### UML Attachments

Berdasarkan UML yang sudah dibahas, dokumen desain sistem harus memiliki:

| Diagram          | Isi Utama                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case Diagram | Customer, pelanggan lama, admin, kasir, supir, bank/transfer; fitur rental, shuttle, pembayaran, kwitansi, manajemen kendaraan dan supir |
| Activity Diagram | Alur customer memilih layanan, sistem menghitung harga, pembayaran, verifikasi, dispatch, return, overtime                               |
| Sequence Diagram | Section/lifeline: CUSTOMER, INTERNAL SYSTEM, ADMIN/KASIR, DRIVER, EXTERNAL/BANK                                                          |
| Class Diagram    | User, Customer, Admin, Cashier, Driver, Vehicle, VehicleCategory, PricingRule, RentalOrder, ShuttleOrder, Payment, Receipt, UpgradeOffer |

---

### Suggested System Architecture

```text
[Customer Web App]
        |
        v
[Frontend - Next.js/React]
        |
        v
[Backend API - Laravel/NestJS]
        |
        +--> [Auth Service]
        +--> [Customer Service]
        +--> [Vehicle Service]
        +--> [Driver Service]
        +--> [Rental Order Service]
        +--> [Shuttle Service]
        +--> [Pricing Engine]
        +--> [Payment Service]
        +--> [Receipt Service]
        +--> [Reporting Service]
        |
        v
[Database - PostgreSQL/MySQL]
        |
        v
[File Storage - Transfer Proof / Receipt PDF]
```

---

## 11. Core Business Rules

### Rental Rules

| Rule ID | Rule                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| BR-001  | Semua rental kendaraan sudah termasuk supir                                                                         |
| BR-002  | Rental tidak termasuk BBM                                                                                           |
| BR-003  | Rental per jam memiliki minimal durasi 3 jam                                                                        |
| BR-004  | Rental dapat dilakukan per jam, harian, mingguan, atau bulanan                                                      |
| BR-005  | Semakin panjang durasi sewa, rate harga semakin murah                                                               |
| BR-006  | Sewa luar kota dikenakan tambahan 20% dari tarif normal                                                             |
| BR-007  | Overtime dihitung per kelipatan jam                                                                                 |
| BR-008  | Kendaraan tidak boleh dikirim atau diambil sebelum pembayaran lunas                                                 |
| BR-009  | Pelanggan lama dapat memilih supir                                                                                  |
| BR-010  | Jika kendaraan pilihan tidak tersedia, sistem dapat menawarkan free upgrade ke kelas lebih tinggi dengan harga awal |
| BR-011  | Pembayaran tunai langsung dapat dikonfirmasi oleh kasir                                                             |
| BR-012  | Pembayaran transfer baru dianggap sah setelah bukti transfer diverifikasi                                           |
| BR-013  | Kwitansi hanya dibuat setelah pembayaran lunas dan valid                                                            |
| BR-014  | Layanan antar-jemput menggunakan tabel tarif berdasarkan jarak dan estimasi waktu                                   |

---

## 12. Status Model

### Order Status

| Status                   | Deskripsi                                                    |
| ------------------------ | ------------------------------------------------------------ |
| DRAFT                    | Order baru dibuat tetapi belum dikonfirmasi                  |
| PENDING_PAYMENT          | Order menunggu pembayaran                                    |
| WAITING_VERIFICATION     | Customer sudah upload bukti transfer dan menunggu verifikasi |
| PAID                     | Pembayaran sudah lunas/valid                                 |
| READY_TO_DISPATCH        | Order siap diproses untuk pengiriman/ambil kendaraan         |
| ONGOING                  | Kendaraan sedang digunakan                                   |
| WAITING_OVERTIME_PAYMENT | Ada tagihan overtime yang belum dibayar                      |
| COMPLETED                | Transaksi selesai                                            |
| CANCELLED                | Transaksi dibatalkan                                         |

---

### Payment Status

| Status               | Deskripsi                                    |
| -------------------- | -------------------------------------------- |
| UNPAID               | Belum ada pembayaran                         |
| WAITING_VERIFICATION | Transfer menunggu verifikasi                 |
| REJECTED             | Bukti transfer ditolak                       |
| PAID                 | Pembayaran diterima/lunas                    |
| REFUNDED             | Dana dikembalikan, jika ada kebijakan refund |

---

### Vehicle Status

| Status      | Deskripsi                  |
| ----------- | -------------------------- |
| AVAILABLE   | Kendaraan tersedia         |
| RESERVED    | Kendaraan sudah dipesan    |
| IN_USE      | Kendaraan sedang digunakan |
| MAINTENANCE | Kendaraan dalam perawatan  |
| INACTIVE    | Kendaraan tidak aktif      |

---

### Driver Status

| Status    | Deskripsi               |
| --------- | ----------------------- |
| AVAILABLE | Supir tersedia          |
| RESERVED  | Supir sudah dijadwalkan |
| ON_DUTY   | Supir sedang bertugas   |
| OFF_DUTY  | Supir tidak bertugas    |
| INACTIVE  | Supir tidak aktif       |

---

## 13. Data Model Summary

| Entity          | Key Fields                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| User            | id, name, email, password_hash, role, status                                                               |
| Customer        | id, user_id, phone, address, customer_type, total_completed_orders                                         |
| Driver          | id, user_id, license_number, phone, status                                                                 |
| VehicleCategory | id, name, class_level, description, status                                                                 |
| Vehicle         | id, category_id, plate_number, brand, model, status                                                        |
| PricingRule     | id, vehicle_category_id, duration_type, min_duration, max_duration, rate                                   |
| OvertimePenalty | id, vehicle_category_id, hourly_rate                                                                       |
| RentalOrder     | id, customer_id, vehicle_id, driver_id, start_at, end_at, actual_return_at, city_type, pickup_type, status |
| ShuttleOrder    | id, customer_id, pickup_location, destination, tariff_id, scheduled_at, status                             |
| ShuttleTariff   | id, area_from, area_to, estimated_distance, estimated_duration, price                                      |
| Payment         | id, order_id, method, amount, proof_file_url, status, verified_by                                          |
| Receipt         | id, payment_id, receipt_number, issued_at, pdf_url                                                         |
| UpgradeOffer    | id, rental_order_id, original_vehicle_category_id, upgraded_vehicle_id, status                             |

---

## 14. MVP Release Criteria

MVP dianggap siap rilis jika:

- Customer dapat registrasi, login, melihat katalog, dan membuat order rental.
- Sistem dapat menghitung tarif rental, surcharge luar kota, dan overtime.
- Admin dapat mengelola kendaraan, supir, tarif, dan transaksi.
- Kasir dapat mencatat pembayaran tunai dan memverifikasi transfer.
- Sistem dapat mengunci order sebelum pembayaran lunas.
- Sistem dapat menghasilkan kwitansi setelah pembayaran lunas.
- Customer lama dapat memilih supir.
- Sistem dapat menawarkan free upgrade jika kendaraan pilihan tidak tersedia.
- Layanan antar-jemput dapat dibuat berdasarkan tabel tarif.
- Semua role utama memiliki akses sesuai haknya.
