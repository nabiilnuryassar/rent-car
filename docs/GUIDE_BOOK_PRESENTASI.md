# Guide Book Presentasi — URBAN 8 Rent Car Platform

> Panduan naratif untuk mahasiswa, demo aplikasi, dan tanya jawab
> Versi 1.2 — 24 Mei 2026

Dokumen ini adalah versi presentasi yang sudah dirapikan dari `docs/GUIDE_BOOK.md`.
Bahasa dibuat lebih natural untuk mahasiswa, dengan alur demo, business rules, FAQ, dan roadmap.

## Metadata

- **Aplikasi:** URBAN 8 Rent Car Platform
- **Audiens:** Mahasiswa, dosen penguji, dan reviewer proyek
- **Fokus:** Alur bisnis rental kendaraan, shuttle, pembayaran, dispatch, dan laporan
- **Tech stack:** Laravel 13, Inertia.js v3, React 19, Tailwind CSS v4

> **Ringkasan:** Dokumen ini merangkum cara menjelaskan URBAN 8 Rent Car Platform secara runtut saat presentasi. Bahasanya dibuat lebih manusiawi, dengan konteks bisnis, alur demo, peran pengguna, business rules, dan panduan menjawab pertanyaan umum.

## 1. Gambaran Umum Aplikasi

URBAN 8 Rent Car Platform adalah aplikasi web untuk mengelola layanan rental kendaraan dan antar-jemput. Sistem ini membantu proses yang biasanya manual — melihat kendaraan, membuat pesanan, membayar, memverifikasi pembayaran, menugaskan kendaraan dan supir, mencatat pengembalian, sampai membuat laporan.

Dalam presentasi, posisikan aplikasi ini sebagai solusi operasional untuk usaha rental. Customer mendapatkan pengalaman pemesanan yang jelas dan modern, sedangkan admin dan kasir memiliki alat untuk mengontrol pembayaran, ketersediaan armada, dan status perjalanan.

> **Narasi singkat untuk pembuka**
> Aplikasi ini dibuat untuk menyatukan proses customer, admin, kasir, dan supir dalam satu alur kerja. Tujuannya bukan hanya menampilkan katalog mobil, tetapi memastikan order bisa dibayar, diverifikasi, dijalankan, dikembalikan, dan dilaporkan secara tertib.

- Rental kendaraan dengan pilihan durasi per jam, hari, minggu, atau bulan.
- Layanan shuttle point-to-point berdasarkan tarif rute yang sudah ditentukan.
- Pembayaran tunai dan transfer manual dengan upload bukti dan konfirmasi preview.
- Role-based dashboard untuk admin, kasir, customer, dan supir.
- Pembatalan order oleh customer dengan alasan (rental maupun shuttle).
- Pengecekan ketersediaan kendaraan dan upgrade otomatis ke kelas lebih tinggi.
- Notifikasi in-app untuk driver saat ditugaskan ke order baru.
- Audit trail pada operasi penting seperti pembayaran, dispatch, dan pengembalian.

## 2. Masalah yang Diselesaikan

Pada bisnis rental kendaraan, tantangan utama biasanya muncul dari koordinasi manual: stok kendaraan tidak sinkron, bukti transfer tercecer, status order tidak jelas, dan laporan harus dihitung ulang. Platform ini mengurangi risiko tersebut dengan membuat status dan aksi utama berada di dalam sistem.

| Masalah Operasional | Dampak | Solusi di Aplikasi |
| --- | --- | --- |
| Customer sulit melihat kendaraan yang tersedia | Booking lambat dan sering perlu konfirmasi manual | Catalog kendaraan dengan filter, pagination, dan detail lengkap |
| Pembayaran transfer harus dicek satu per satu | Risiko salah validasi atau bukti hilang | Upload bukti transfer dengan preview dan workflow approve/reject |
| Admin harus mengingat status kendaraan dan supir | Kendaraan bisa dipakai tanpa status sistem yang benar | Dispatch otomatis mengubah vehicle menjadi in_use dan driver menjadi on_duty |
| Pengembalian terlambat sering dihitung manual | Overtime tidak konsisten | Sistem menghitung overtime berdasarkan kelipatan jam otomatis |
| Laporan pendapatan dibuat manual | Sulit mengevaluasi performa bisnis | Dashboard chart real-time, report dengan filter tanggal, dan export CSV |
| Kendaraan yang dipesan ternyata sudah terpakai | Double booking dan kekecewaan customer | Pengecekan ketersediaan otomatis dan penawaran upgrade gratis |
| Driver tidak tahu ada order baru | Koordinasi terlambat | Notifikasi in-app langsung ke dashboard driver |

## 3. Role dan Hak Akses

Sistem memakai pemisahan role agar setiap pengguna hanya melihat fitur yang sesuai tugasnya. Ini penting untuk keamanan, kerapian workflow, dan kemudahan demo karena alur setiap role bisa dijelaskan secara terpisah.

> **Poin penting saat menjelaskan role**
> Tekankan bahwa redirect setelah login mengikuti role. Ini menunjukkan aplikasi sudah memikirkan pengalaman pengguna dan pembatasan akses, bukan sekadar halaman yang berbeda. Kasir hanya melihat menu yang relevan (Dasbor, Verifikasi Pembayaran, Laporan) meskipun masuk ke dashboard yang sama dengan admin.

| Role | Tanggung Jawab Utama | Dashboard |
| --- | --- | --- |
| Admin | Mengelola master data, pricing, shuttle tariff, verifikasi, dispatch, return, laporan, dan pengaturan perusahaan | /admin/dashboard |
| Kasir | Mencatat pembayaran tunai, memverifikasi transfer, dan mencetak kwitansi | /admin/dashboard (menu terbatas) |
| Customer | Melihat katalog, membuat booking rental & shuttle, upload bukti transfer, membatalkan order, melihat receipt, profil | /catalog |
| Supir | Melihat order yang ditugaskan, mengatur status ketersediaan, melihat notifikasi, mengelola profil | /driver/dashboard |

## 4. Alur Utama Customer

Customer adalah titik awal transaksi. Alurnya harus dijelaskan sebagai perjalanan sederhana: registrasi, memilih kendaraan, mengisi detail sewa, meninjau harga, membayar, lalu menerima kwitansi setelah pembayaran valid.

> **Tips demo customer**
> Mulailah dari catalog agar audiens langsung melihat nilai aplikasi. Setelah itu baru masuk ke detail order dan pembayaran. Hindari terlalu lama di form; cukup jelaskan field yang memiliki aturan bisnis seperti minimum tiga jam dan surcharge luar kota. Tunjukkan juga navigasi mobile (bottom nav pill) untuk menunjukkan responsive design.

**Navigasi Customer:**
- Desktop: top bar horizontal dengan menu Katalog, Driver, Shuttle, Pesanan, dan tombol "+ Pemesanan Baru"
- Mobile: bottom navigation pill mengambang dengan 5 ikon — Katalog, Driver, Shuttle, Pesanan, Profil

**Alur Rental:**

1. Customer membuka halaman register atau login.
2. Customer masuk ke catalog dan melihat kendaraan dengan pagination empat item per halaman.
3. Customer memakai filter catalog (popup modal) untuk menyaring kategori atau harga.
4. Customer memilih kendaraan, menentukan unit sewa (jam/hari/minggu/bulan), durasi, waktu mulai, dan opsi pickup.
5. Jika rental keluar kota, sistem menambahkan surcharge 20% sesuai business rule.
6. Jika kendaraan tidak tersedia untuk periode yang diminta, sistem otomatis menawarkan upgrade gratis ke kelas lebih tinggi.
7. Pelanggan loyal (sudah selesaikan minimal 1 order) bisa memilih driver favorit.
8. Sistem menampilkan ringkasan harga sebelum customer mengonfirmasi order.
9. Customer memilih pembayaran tunai atau transfer.
10. Jika transfer, customer upload bukti (dengan konfirmasi preview) dan menunggu verifikasi.
11. Setelah payment paid, customer dapat melihat dan mencetak receipt.

**Alur Pembatalan:**

12. Customer dapat membatalkan order selama status belum Ongoing — buka detail order, klik "Batalkan Pesanan", isi alasan, konfirmasi.

## 5. Alur Admin dari Master Data sampai Dispatch

Admin adalah pusat kendali operasional. Admin menyiapkan data kendaraan, kategori, supir, aturan harga, tarif shuttle, lalu memproses order yang sudah dibayar.

> **Cara menjelaskan admin saat presentasi**
> Tunjukkan sidebar navigasi yang lengkap (Dasbor, Kategori, Kendaraan, Pengemudi, Harga dan Tarif, Antar-Jemput, Pesanan, Verifikasi Pembayaran, Laporan, Pengaturan). Tekankan bahwa setiap modul punya breadcrumbs, filter, dan loading state.

1. Admin mengelola vehicle category, termasuk class level untuk membedakan kelas kendaraan.
2. Admin menambah dan memperbarui data kendaraan: plate number, brand, model, year, status, lokasi, dan gambar (multi-image).
3. Admin membuat akun driver dan menjaga status driver agar sesuai kondisi lapangan.
4. Admin mengatur pricing rule berdasarkan kategori, unit rental, durasi minimum, durasi maksimum, dan rate.
5. Admin mengelola tarif shuttle berdasarkan rute (area asal, area tujuan, jarak, durasi, dan harga tetap).
6. Admin memverifikasi transfer yang masuk dengan approve atau reject disertai alasan.
7. Admin hanya bisa dispatch order jika payment sudah paid dan order ready_to_dispatch.
8. Saat dispatch, sistem mengubah order menjadi ongoing, vehicle menjadi in_use, dan driver menjadi on_duty.
9. Saat kendaraan kembali, admin mencatat actual return time untuk menghitung overtime jika terlambat.
10. Admin bisa membatalkan order yang belum berstatus ongoing.
11. Admin mengatur pengaturan perusahaan (logo, nama, telepon, alamat) melalui menu Pengaturan.

| Modul Admin | Fungsi Presentasi | Contoh yang Mudah Dijelaskan |
| --- | --- | --- |
| Dashboard | Menunjukkan kondisi operasional real-time | Order hari ini, pending payment, armada available, chart tren revenue, export CSV |
| Kategori | Mengelompokkan kendaraan | Sedan, MPV, Premium, atau kelas lain |
| Kendaraan | Mengelola unit fisik | Plat nomor unik, multi-image, dan status kendaraan |
| Pengemudi | Mengelola akun dan data driver | Nama, lisensi, status ketersediaan |
| Harga & Tarif | Menentukan aturan biaya rental | Daily rate, hourly minimum, surcharge, overtime penalty |
| Antar-Jemput | Mengelola tarif shuttle per rute | Area asal-tujuan, jarak, durasi, harga tetap |
| Pesanan | Menjalankan transaksi | Dispatch, record return, pembatalan |
| Verifikasi | Mengamankan pembayaran transfer | Approve bukti valid, reject bukti salah, input cash |
| Laporan | Membaca performa bisnis | Revenue paid-only, transaksi selesai, filter tanggal |
| Pengaturan | Konfigurasi perusahaan | Logo, nama, telepon (untuk WhatsApp support), alamat |

## 6. Alur Kasir

Kasir menangani sisi pembayaran. Role ini sengaja dibuat lebih terbatas dari admin agar proses keuangan bisa dijalankan tanpa memberi akses penuh ke semua master data.

> **Poin pembeda kasir dan admin**
> Admin mengatur operasional penuh, sedangkan kasir berfokus pada pembayaran. Kasir login ke dashboard yang sama (/admin/dashboard) tetapi hanya melihat tiga menu: Dasbor, Verifikasi Pembayaran, dan Laporan. Ini contoh penerapan separation of concerns pada level pengguna aplikasi.

1. Kasir mencari order berdasarkan order ID atau nama customer.
2. Untuk pembayaran tunai, kasir memastikan jumlah sesuai total order.
3. Setelah dikonfirmasi, payment berubah menjadi paid dan order menjadi ready_to_dispatch.
4. Sistem membuat receipt dan mencatat audit log.
5. Kasir juga dapat memeriksa bukti transfer lalu approve atau reject sesuai kewenangan.
6. Kasir bisa mencetak kwitansi melalui browser (Ctrl+P) dengan layout kertas statement.

## 7. Alur Supir

Supir menggunakan dashboard yang dirancang khusus untuk perangkat mobile (mobile-first design). Tampilan menyerupai aplikasi smartphone dengan header fixed, konten compact, dan bottom navigation pill.

> **Cara menjelaskan portal driver saat presentasi**
> Tunjukkan bahwa halaman driver sudah dirancang mobile-first — header tetap di atas saat scroll, konten ringkas, dan navigasi di bawah. Driver kini mendapatkan notifikasi in-app langsung saat di-assign ke order baru, tidak perlu koordinasi manual.

1. Supir login menggunakan akun yang dibuat admin.
2. Dashboard menampilkan status saat ini (Tersedia/Off/Sedang Bertugas), statistik order, dan notifikasi terbaru.
3. Supir bisa mengatur status ketersediaan: toggle antara **Tersedia** dan **Off** melalui menu Status.
4. Status **Dipesan** dan **Sedang Bertugas** dikunci otomatis oleh sistem saat ada order aktif.
5. Supir melihat detail order yang di-assign: customer, kendaraan, pickup, tujuan, dan jadwal melalui menu Pesanan.
6. Supir menerima notifikasi in-app saat ditugaskan ke order baru (detail customer, kendaraan, pickup).
7. Supir mengambil kendaraan dari garasi sesuai koordinasi admin, menjalankan trip, dan mengembalikan kendaraan.
8. Admin mencatat return agar status order, kendaraan, dan supir kembali sinkron.
9. Supir bisa mengelola profil dan mengubah password melalui menu Profil.

**Navigasi driver (bottom nav):** Dasbor, Pesanan, Status, Profil

## 8. Shuttle Service

Selain rental kendaraan, aplikasi menyediakan layanan antar-jemput atau shuttle. Shuttle menggunakan pola tarif point-to-point, sehingga harga ditentukan dari area asal dan tujuan yang cocok dengan data Shuttle Tariff.

> **Cara menjelaskan shuttle**
> Bedakan shuttle dari rental. Rental bergantung pada kendaraan, durasi, dan opsi pickup. Shuttle lebih mirip layanan perjalanan satu rute dengan harga yang sudah ditentukan. Halaman shuttle kini terintegrasi dengan navigasi utama customer melalui menu "Shuttle" yang mengarah ke `/shuttle`.

1. Customer membuka menu **Shuttle** dari navigasi utama (desktop maupun mobile).
2. Halaman `/shuttle` menampilkan daftar rute tarif sebagai kartu visual (ikon peta, area asal-tujuan, jarak, durasi, harga).
3. Customer memilih rute yang sesuai — kartu akan ter-highlight.
4. Customer mengisi alamat jemput, alamat tujuan, dan jadwal (tanggal & waktu).
5. Panel samping menampilkan ringkasan tarif: rute, estimasi jarak, estimasi durasi, dan total harga.
6. Customer klik **"Konfirmasi & Pesan"** untuk membuat order.
7. Order dibuat dengan status Pending Payment, lanjut ke pembayaran.
8. Riwayat pesanan shuttle tersedia melalui tombol **"Riwayat Pesanan"** atau di `/customer/shuttle-orders`.
9. Customer bisa membatalkan order shuttle dengan alasan (selama status memenuhi syarat).

## 9. Business Rules Penting

Business rules adalah bagian yang biasanya menarik bagi dosen penguji karena menunjukkan bahwa aplikasi memiliki logika bisnis, bukan hanya CRUD. Gunakan tabel berikut sebagai peta cepat saat presentasi.

| Kode | Aturan | Penjelasan Singkat |
| --- | --- | --- |
| BR-001 | Minimum tiga jam untuk hourly rental | Jika rental unit hour, durasi minimal adalah 3 jam. |
| BR-002 | Duration-based pricing | PricingRule dipilih berdasarkan kategori kendaraan, unit rental, dan range durasi. |
| BR-003 | Out-of-town surcharge | Jika keluar kota, total dikenakan surcharge default 20 persen. |
| BR-004 | Overtime kelipatan jam | Keterlambatan dihitung ceil(minutes_late / 60) dikali hourly rate. |
| BR-005 | Loyal customer | Customer dengan minimal satu order selesai bisa memilih driver favorit. |
| BR-006 | Payment lock | Dispatch hanya boleh dilakukan saat payment paid dan order ready_to_dispatch. |
| BR-007 | Receipt uniqueness | Nomor kwitansi dibuat unik oleh generator receipt. |
| BR-008 | Vehicle status sync | Dispatch dan complete otomatis menyinkronkan status kendaraan dan driver. |
| BR-009 | Audit log coverage | Operasi penting seperti payment, dispatch, return, dan cancel tercatat. |
| BR-010 | Availability check | Kendaraan diperiksa ketersediaannya berdasarkan range tanggal; jika tidak tersedia, tawarkan upgrade otomatis. |
| BR-011 | Order cancellation | Order bisa dibatalkan pada status Draft, Pending Payment, Waiting Verification, Paid, Ready to Dispatch — wajib isi alasan. |
| BR-012 | Shuttle tariff matching | Harga shuttle ditentukan oleh tarif rute (area_from → area_to), bukan durasi. |
| BR-013 | Driver status lock | Status Dipesan dan Sedang Bertugas dikunci sistem; driver hanya bisa toggle Tersedia/Off. |

## 10. Skenario Demo yang Disarankan

Agar presentasi terasa runtut, demo sebaiknya mengikuti satu transaksi dari awal sampai akhir. Gunakan data seeded agar waktu demo tidak habis untuk membuat data master dari nol.

### Skenario A: Rental Kendaraan (Alur Utama)

1. Login sebagai customer dan buka catalog.
2. Filter kendaraan, pilih satu kendaraan, lalu buat rental order.
3. Tampilkan review harga dan jelaskan minimum durasi atau surcharge jika dipakai.
4. Simulasikan pembayaran transfer dengan upload bukti (tunjukkan konfirmasi preview).
5. Login sebagai admin atau kasir untuk approve pembayaran.
6. Login sebagai admin, dispatch order yang sudah ready.
7. Tunjukkan dashboard driver — notifikasi muncul bahwa driver mendapat tugas baru.
8. Record return dan tunjukkan perubahan status kendaraan serta driver.
9. Buka receipt atau laporan untuk menutup cerita transaksi.

### Skenario B: Shuttle Service

1. Login sebagai customer.
2. Klik menu "Shuttle" dari navigasi.
3. Pilih rute dari daftar kartu tarif.
4. Isi form dan konfirmasi order.
5. Tunjukkan riwayat pesanan shuttle.

### Skenario C: Pembatalan Order

1. Buat order baru (rental atau shuttle).
2. Buka detail order → "Batalkan Pesanan" → isi alasan → konfirmasi.
3. Tunjukkan status berubah menjadi Cancelled.

### Timeline Demo

| Menit | Bagian Demo | Tujuan |
| --- | --- | --- |
| 0-1 | Pembuka | Jelaskan masalah bisnis dan role pengguna. |
| 1-3 | Customer booking | Tunjukkan catalog, filter, dan multi-step booking modal. |
| 3-4 | Shuttle service | Tunjukkan alur shuttle melalui navigasi terintegrasi. |
| 4-6 | Pembayaran | Jelaskan transfer proof, preview upload, dan approval workflow. |
| 6-8 | Admin dispatch | Tunjukkan validasi paid, dispatch, dan perubahan status operasional. |
| 8-9 | Driver portal | Tunjukkan notifikasi in-app, status toggle, dan tampilan mobile-first. |
| 9-10 | Return, laporan, penutup | Jelaskan overtime, chart tren, export CSV, pembatalan order, dan roadmap. |

## 11. Panduan Teknis untuk Developer

Bagian teknis cukup dijelaskan ringkas saat presentasi, kecuali audiens meminta detail. Fokuskan pada arsitektur Route -> Middleware -> Controller -> Service -> Model, karena pola ini mudah dipahami dan menunjukkan pemisahan tanggung jawab.

| Area | Isi | Catatan Presentasi |
| --- | --- | --- |
| Backend | Laravel 13, Fortify, Spatie Permission | Menangani auth, role, controller, service, dan model. |
| Frontend | Inertia.js v3, React 19, TypeScript, Tailwind v4 | SPA-like experience tanpa memisahkan API penuh. |
| Routing | Wayfinder | Auto-generate TypeScript functions untuk routes Laravel. |
| Testing | Pest | Dipakai untuk memastikan pricing, order, dan workflow penting. |
| Tooling | Pint, Vite, Laravel Brain | Menjaga style, build frontend, dan dokumentasi arsitektur. |
| Notifications | Laravel Notifications | Notifikasi in-app untuk driver assignment. |

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
composer run dev
```

## 12. Akun Demo Seeded

Gunakan akun ini untuk mempercepat demo. Sebaiknya siapkan browser atau tab terpisah untuk role customer, admin, kasir, dan supir agar perpindahan alur terlihat jelas.

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@rentcar.test | password |
| Kasir | kasir@rentcar.test | password |
| Customer | customer@rentcar.test | password |
| Driver | driver@rentcar.test | password |

## 13. Troubleshooting Saat Demo

Bagian ini membantu presenter tetap tenang saat terjadi error umum. Jelaskan penyebabnya sebagai validasi sistem, bukan sebagai kegagalan demo.

| Masalah | Penyebab | Solusi Cepat |
| --- | --- | --- |
| Minimum 3 jam | Rental unit hour dengan durasi kurang dari 3 | Naikkan durasi menjadi 3 jam atau pilih unit day. |
| Cannot dispatch | Payment belum paid atau order belum ready_to_dispatch | Approve pembayaran atau input cash terlebih dahulu. |
| Upload bukti gagal | File lebih dari 5 MB atau format tidak didukung | Gunakan JPG, PNG, atau PDF di bawah 5 MB. |
| No pricing rule found | Kategori, unit, dan durasi tidak cocok dengan PricingRule | Pilih kombinasi lain atau tambahkan rule sebagai admin. |
| Kendaraan sudah dipesan | Kendaraan tidak tersedia untuk periode tersebut | Sistem otomatis tawarkan upgrade; jika tidak ada upgrade, pilih kendaraan lain. |
| Pesanan tidak bisa dibatalkan | Order sudah berstatus Ongoing atau Completed | Jelaskan sebagai validasi bisnis — order yang sedang berjalan tidak boleh dibatalkan. |
| Driver status terkunci | Ada order aktif yang mengunci status | Status akan kembali otomatis setelah order selesai. |
| Halaman tidak terupdate | Asset frontend belum di-build | Jalankan `npm run build` atau `npm run dev`. |

## 14. FAQ untuk Sesi Tanya Jawab

Gunakan jawaban berikut sebagai pegangan. Jawaban dibuat singkat agar presenter bisa menjawab dengan percaya diri tanpa membuka terlalu banyak detail teknis.

**Q: Berapa lama verifikasi transfer?**
A: Manual oleh admin atau kasir. Dalam skenario bisnis, targetnya kurang dari satu jam kerja.

**Q: Apakah customer bisa membatalkan order?**
A: Ya, customer bisa membatalkan order selama statusnya belum Ongoing atau Completed. Pembatalan wajib disertai alasan dan berlaku untuk pesanan rental maupun shuttle.

**Q: Apakah sistem sudah punya payment gateway?**
A: Belum. Sistem mendukung cash dan transfer manual; virtual account atau payment gateway cocok untuk pengembangan berikutnya.

**Q: Bagaimana jika kendaraan terlambat kembali?**
A: Admin mencatat actual return time, lalu sistem menghitung overtime berdasarkan kelipatan jam secara otomatis.

**Q: Mengapa loyal customer bisa memilih driver?**
A: Ini fitur customer retention. Pelanggan yang pernah menyelesaikan minimal satu order diberi kontrol lebih terhadap pengalaman layanan.

**Q: Apa bedanya rental dan shuttle?**
A: Rental menyewa kendaraan berdasarkan durasi (jam/hari/minggu/bulan) dengan harga dihitung dari pricing rule. Shuttle adalah layanan antar-jemput satu rute dengan harga tetap berdasarkan tarif rute.

**Q: Bagaimana driver tahu ada order baru?**
A: Sistem mengirimkan notifikasi in-app langsung ke dashboard driver saat mereka di-assign ke order baru. Notifikasi menampilkan detail customer, kendaraan, dan informasi pickup.

**Q: Apakah ada pengecekan ketersediaan kendaraan?**
A: Ya, sistem memeriksa ketersediaan kendaraan berdasarkan range tanggal. Jika kendaraan tidak tersedia, otomatis menawarkan upgrade gratis ke kendaraan kelas lebih tinggi dengan harga yang sama.

**Q: Apakah aplikasi mobile tersedia?**
A: Saat ini berbasis web responsive. Halaman driver sudah dirancang mobile-first dengan layout menyerupai aplikasi smartphone. Aplikasi mobile native dapat menjadi pengembangan berikutnya.

**Q: Apakah data bisa di-export?**
A: Ya, dashboard admin memiliki fitur export CSV untuk data tren revenue dan rental bulanan.

**Q: Bagaimana keamanan pembagian role?**
A: Sistem menggunakan Spatie Permission untuk pembatasan akses berbasis role. Setiap route dilindungi middleware. Kasir hanya bisa melihat menu pembayaran dan laporan meskipun mengakses dashboard yang sama dengan admin.

## 15. Roadmap dan Batasan Versi

Setiap aplikasi punya batasan versi. Menyampaikan batasan dengan jujur justru membuat presentasi lebih profesional, karena menunjukkan tim memahami prioritas dan pengembangan bertahap.

| Area | Kondisi Saat Ini | Roadmap |
| --- | --- | --- |
| Notifikasi driver | Notifikasi in-app sudah tersedia | Notifikasi push, email, atau WhatsApp integration. |
| Cancel dan refund | Pembatalan order sudah tersedia | Workflow refund otomatis dan policy biaya pembatalan. |
| Payment gateway | Cash dan transfer manual | Virtual account atau payment gateway otomatis. |
| Availability check | Pengecekan berdasarkan range tanggal sudah tersedia | Penguatan UI calendar view dan manajemen slot. |
| Receipt | Cetak dari browser (layout statement) | Download PDF receipt langsung dari aplikasi. |
| Corporate account | Enum customer_type sudah mendukung | Dashboard khusus B2B dan kontrak pelanggan korporat. |
| Mobile app | Web responsive, driver portal mobile-first | Aplikasi mobile native (iOS/Android). |

## 16. Penutup Presentasi

Tutup presentasi dengan mengulang nilai utama aplikasi: sistem membantu bisnis rental mengelola transaksi dari awal sampai akhir secara lebih rapi, terukur, dan mudah diaudit.

> **Kalimat penutup yang bisa dipakai**
> Dengan URBAN 8 Rent Car Platform, proses rental tidak berhenti di katalog kendaraan. Aplikasi ini menghubungkan customer, kasir, admin, dan supir dalam satu workflow: booking, pembayaran, verifikasi, dispatch, return, receipt, dan laporan — lengkap dengan pembatalan order, pengecekan ketersediaan, dan notifikasi otomatis untuk pengemudi.
