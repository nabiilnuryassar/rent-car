# Guide Book Presentasi Rent Car Platform

> Panduan naratif untuk mahasiswa, demo aplikasi, dan tanya jawab
> Versi 1.2 - 12 Mei 2026

Dokumen ini adalah versi presentasi yang sudah dirapikan dari `docs/GUIDE_BOOK.md`.
Bahasa dibuat lebih natural untuk mahasiswa, dengan alur demo, business rules, FAQ, dan roadmap.

## Metadata

- **Aplikasi:** Rent Car Platform
- **Audiens:** Mahasiswa, dosen penguji, dan reviewer proyek
- **Fokus:** Alur bisnis rental kendaraan, shuttle, pembayaran, dispatch, dan laporan
- **Tech stack:** Laravel 13, Inertia.js v3, React 19, Tailwind CSS v4

> **Ringkasan:** Dokumen ini merangkum cara menjelaskan Rent Car Platform secara runtut saat presentasi. Bahasanya dibuat lebih manusiawi, dengan konteks bisnis, alur demo, peran pengguna, business rules, dan panduan menjawab pertanyaan umum.

## 1. Gambaran Umum Aplikasi

Rent Car Platform adalah aplikasi web untuk mengelola layanan rental kendaraan dan antar-jemput. Sistem ini membantu proses yang biasanya manual - melihat kendaraan, membuat pesanan, membayar, memverifikasi pembayaran, menugaskan kendaraan dan supir, mencatat pengembalian, sampai membuat laporan.

Dalam presentasi, posisikan aplikasi ini sebagai solusi operasional untuk usaha rental. Customer mendapatkan pengalaman pemesanan yang jelas, sedangkan admin dan kasir memiliki alat untuk mengontrol pembayaran, ketersediaan armada, dan status perjalanan.

> **Narasi singkat untuk pembuka**
> Aplikasi ini dibuat untuk menyatukan proses customer, admin, kasir, dan supir dalam satu alur kerja. Tujuannya bukan hanya menampilkan katalog mobil, tetapi memastikan order bisa dibayar, diverifikasi, dijalankan, dikembalikan, dan dilaporkan secara tertib.

- Rental kendaraan dengan pilihan durasi per jam, hari, minggu, atau bulan.
- Layanan shuttle point-to-point berdasarkan tarif rute.
- Pembayaran tunai dan transfer manual dengan bukti pembayaran.
- Role-based dashboard untuk admin, kasir, customer, dan supir.
- Audit trail pada operasi penting seperti pembayaran, dispatch, dan pengembalian.

## 2. Masalah yang Diselesaikan

Pada bisnis rental kendaraan, tantangan utama biasanya muncul dari koordinasi manual: stok kendaraan tidak sinkron, bukti transfer tercecer, status order tidak jelas, dan laporan harus dihitung ulang. Platform ini mengurangi risiko tersebut dengan membuat status dan aksi utama berada di dalam sistem.

| Masalah Operasional | Dampak | Solusi di Aplikasi |
| --- | --- | --- |
| Customer sulit melihat kendaraan yang tersedia | Booking lambat dan sering perlu konfirmasi manual | Catalog kendaraan, filter, pagination, dan detail kendaraan |
| Pembayaran transfer harus dicek satu per satu | Risiko salah validasi atau bukti hilang | Upload bukti transfer dan workflow approve/reject |
| Admin harus mengingat status kendaraan dan supir | Kendaraan bisa dipakai tanpa status sistem yang benar | Dispatch mengubah vehicle menjadi in_use dan driver menjadi on_duty |
| Pengembalian terlambat sering dihitung manual | Overtime tidak konsisten | Sistem menghitung overtime berdasarkan kelipatan jam |
| Laporan pendapatan dibuat manual | Sulit mengevaluasi performa bisnis | Report dengan filter tanggal dan revenue paid-only |

## 3. Role dan Hak Akses

Sistem memakai pemisahan role agar setiap pengguna hanya melihat fitur yang sesuai tugasnya. Ini penting untuk keamanan, kerapian workflow, dan kemudahan demo karena alur setiap role bisa dijelaskan secara terpisah.

> **Poin penting saat menjelaskan role**
> Tekankan bahwa redirect setelah login mengikuti role. Ini menunjukkan aplikasi sudah memikirkan pengalaman pengguna dan pembatasan akses, bukan sekadar halaman yang berbeda.

| Role | Tanggung Jawab Utama | Dashboard |
| --- | --- | --- |
| Admin | Mengelola master data, pricing, verifikasi, dispatch, return, dan laporan | /admin/dashboard |
| Kasir | Mencatat pembayaran tunai, memverifikasi transfer, dan mencetak kwitansi | /kasir/dashboard |
| Customer | Melihat katalog, membuat booking, upload bukti transfer, dan melihat receipt | /catalog |
| Supir | Melihat order yang ditugaskan dan menjalankan trip sesuai instruksi | /driver/dashboard |

## 4. Alur Utama Customer

Customer adalah titik awal transaksi. Alurnya harus dijelaskan sebagai perjalanan sederhana: registrasi, memilih kendaraan, mengisi detail sewa, meninjau harga, membayar, lalu menerima kwitansi setelah pembayaran valid.

> **Tips demo customer**
> Mulailah dari catalog agar audiens langsung melihat nilai aplikasi. Setelah itu baru masuk ke detail order dan pembayaran. Hindari terlalu lama di form; cukup jelaskan field yang memiliki aturan bisnis seperti minimum tiga jam dan surcharge luar kota.

1. Customer membuka halaman register atau login.
2. Customer masuk ke catalog dan melihat kendaraan dengan pagination empat item per halaman.
3. Customer memakai filter catalog untuk menyaring kategori atau harga.
4. Customer memilih kendaraan, menentukan unit sewa, durasi, waktu mulai, dan opsi pickup.
5. Jika rental keluar kota, sistem menambahkan surcharge sesuai business rule.
6. Sistem menampilkan ringkasan harga sebelum customer mengonfirmasi order.
7. Customer memilih pembayaran tunai atau transfer.
8. Jika transfer, customer upload bukti dan menunggu verifikasi.
9. Setelah payment paid, customer dapat melihat dan mencetak receipt.

## 5. Alur Admin dari Master Data sampai Dispatch

Admin adalah pusat kendali operasional. Admin menyiapkan data kendaraan, kategori, supir, aturan harga, tarif shuttle, lalu memproses order yang sudah dibayar.

1. Admin mengelola vehicle category, termasuk class level untuk membedakan kelas kendaraan.
2. Admin menambah dan memperbarui data kendaraan: plate number, brand, model, year, status, dan lokasi.
3. Admin membuat akun driver dan menjaga status driver agar sesuai kondisi lapangan.
4. Admin mengatur pricing rule berdasarkan kategori, unit rental, durasi minimum, durasi maksimum, dan rate.
5. Admin memverifikasi transfer yang masuk dengan approve atau reject disertai alasan.
6. Admin hanya bisa dispatch order jika payment sudah paid dan order ready_to_dispatch.
7. Saat dispatch, sistem mengubah order menjadi ongoing, vehicle menjadi in_use, dan driver menjadi on_duty.
8. Saat kendaraan kembali, admin mencatat actual return time untuk menghitung overtime jika terlambat.

| Modul Admin | Fungsi Presentasi | Contoh yang Mudah Dijelaskan |
| --- | --- | --- |
| Dashboard | Menunjukkan kondisi operasional | Order hari ini, pending payment, armada available |
| Kategori | Mengelompokkan kendaraan | Sedan, MPV, Premium, atau kelas lain |
| Kendaraan | Mengelola unit fisik | Plat nomor unik dan status kendaraan |
| Harga & Tarif | Menentukan aturan biaya | Daily rate, hourly minimum, surcharge |
| Verifikasi | Mengamankan pembayaran transfer | Approve bukti valid, reject bukti salah |
| Order | Menjalankan transaksi | Dispatch dan record return |
| Laporan | Membaca performa bisnis | Revenue paid-only dan transaksi selesai |

## 6. Alur Kasir

Kasir menangani sisi pembayaran. Role ini sengaja dibuat lebih terbatas dari admin agar proses keuangan bisa dijalankan tanpa memberi akses penuh ke semua master data.

> **Poin pembeda kasir dan admin**
> Admin mengatur operasional penuh, sedangkan kasir berfokus pada pembayaran. Ini contoh penerapan separation of concerns pada level pengguna aplikasi.

1. Kasir mencari order berdasarkan order ID atau nama customer.
2. Untuk pembayaran tunai, kasir memastikan jumlah sesuai total order.
3. Setelah dikonfirmasi, payment berubah menjadi paid dan order menjadi ready_to_dispatch.
4. Sistem membuat receipt dan mencatat audit log.
5. Kasir juga dapat memeriksa bukti transfer lalu approve atau reject sesuai kewenangan.

## 7. Alur Supir

Supir menggunakan dashboard untuk melihat order yang ditugaskan. Untuk versi saat ini, notifikasi otomatis belum menjadi fokus, sehingga koordinasi awal masih dapat dilakukan oleh admin melalui telepon atau WhatsApp.

1. Supir login menggunakan akun yang dibuat admin.
2. Supir melihat detail order yang di-assign: customer, kendaraan, pickup, tujuan, dan jadwal.
3. Supir mengambil kendaraan dari garasi sesuai koordinasi admin.
4. Supir menjalankan trip dan mengembalikan kendaraan setelah selesai.
5. Admin mencatat return agar status order, kendaraan, dan supir kembali sinkron.

## 8. Shuttle Service

Selain rental kendaraan, aplikasi menyediakan layanan antar-jemput atau shuttle. Shuttle menggunakan pola tarif point-to-point, sehingga harga ditentukan dari area asal dan tujuan yang cocok dengan data Shuttle Tariff.

> **Cara menjelaskan shuttle**
> Bedakan shuttle dari rental. Rental bergantung pada kendaraan, durasi, dan opsi pickup. Shuttle lebih mirip layanan perjalanan satu rute dengan harga yang sudah ditentukan.

1. Customer membuka menu Shuttle Service.
2. Customer mengisi pickup address, destination address, dan scheduled date time.
3. Sistem mencari tarif berdasarkan area from dan area to.
4. Sistem menampilkan estimasi jarak, durasi, dan harga tetap.
5. Customer mengonfirmasi order dan melanjutkan ke pembayaran.

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
| BR-009 | Audit log coverage | Operasi penting seperti payment, dispatch, dan return tercatat. |

## 10. Skenario Demo yang Disarankan

Agar presentasi terasa runtut, demo sebaiknya mengikuti satu transaksi dari awal sampai akhir. Gunakan data seeded agar waktu demo tidak habis untuk membuat data master dari nol.

1. Login sebagai customer dan buka catalog.
2. Filter kendaraan, pilih satu kendaraan, lalu buat rental order.
3. Tampilkan review harga dan jelaskan minimum durasi atau surcharge jika dipakai.
4. Simulasikan pembayaran transfer dengan upload bukti.
5. Login sebagai admin atau kasir untuk approve pembayaran.
6. Login sebagai admin, dispatch order yang sudah ready.
7. Record return dan tunjukkan perubahan status kendaraan serta driver.
8. Buka receipt atau laporan untuk menutup cerita transaksi.

| Menit | Bagian Demo | Tujuan |
| --- | --- | --- |
| 0-1 | Pembuka | Jelaskan masalah bisnis dan role pengguna. |
| 1-4 | Customer booking | Tunjukkan nilai utama dari catalog sampai review order. |
| 4-6 | Pembayaran | Jelaskan transfer proof dan approval workflow. |
| 6-8 | Admin dispatch | Tunjukkan validasi paid dan perubahan status operasional. |
| 8-9 | Return dan overtime | Jelaskan logika pengembalian dan biaya terlambat. |
| 9-10 | Laporan dan penutup | Tutup dengan manfaat sistem dan roadmap. |

## 11. Panduan Teknis untuk Developer

Bagian teknis cukup dijelaskan ringkas saat presentasi, kecuali audiens meminta detail. Fokuskan pada arsitektur Route -> Middleware -> Controller -> Service -> Model, karena pola ini mudah dipahami dan menunjukkan pemisahan tanggung jawab.

| Area | Isi | Catatan Presentasi |
| --- | --- | --- |
| Backend | Laravel 13, Fortify, Spatie Permission | Menangani auth, role, controller, service, dan model. |
| Frontend | Inertia.js v3, React 19, TypeScript, Tailwind v4 | SPA-like experience tanpa memisahkan API penuh. |
| Testing | Pest | Dipakai untuk memastikan pricing, order, dan workflow penting. |
| Tooling | Pint, Vite, Laravel Brain | Menjaga style, build frontend, dan dokumentasi arsitektur. |

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
| Driver belum tahu order | Notifikasi otomatis belum tersedia | Admin menghubungi driver secara manual untuk versi ini. |

## 14. FAQ untuk Sesi Tanya Jawab

Gunakan jawaban berikut sebagai pegangan. Jawaban dibuat singkat agar presenter bisa menjawab dengan percaya diri tanpa membuka terlalu banyak detail teknis.

**Q: Berapa lama verifikasi transfer?**  
A: Manual oleh admin atau kasir. Dalam skenario bisnis, targetnya kurang dari satu jam kerja.

**Q: Apakah customer bisa membatalkan order?**  
A: Untuk versi ini belum menjadi workflow utama. Pembatalan dan refund bisa menjadi roadmap berikutnya.

**Q: Apakah sistem sudah punya payment gateway?**  
A: Belum. Sistem mendukung cash dan transfer manual; virtual account atau payment gateway cocok untuk v2.0.

**Q: Bagaimana jika kendaraan terlambat kembali?**  
A: Admin mencatat actual return time, lalu sistem menghitung overtime berdasarkan kelipatan jam.

**Q: Mengapa loyal customer bisa memilih driver?**  
A: Ini fitur customer retention. Pelanggan yang pernah menyelesaikan order diberi kontrol lebih terhadap pengalaman layanan.

**Q: Apakah aplikasi mobile tersedia?**  
A: Saat ini berbasis web responsive. Aplikasi mobile dapat menjadi pengembangan berikutnya.

## 15. Roadmap dan Batasan Versi

Setiap aplikasi punya batasan versi. Menyampaikan batasan dengan jujur justru membuat presentasi lebih profesional, karena menunjukkan tim memahami prioritas dan pengembangan bertahap.

| Area | Kondisi Saat Ini | Roadmap |
| --- | --- | --- |
| Notifikasi driver | Masih koordinasi manual | Notifikasi real-time atau WhatsApp integration. |
| Cancel dan refund | Belum menjadi flow utama | Workflow cancel, refund approval, dan policy biaya. |
| Payment gateway | Cash dan transfer manual | Virtual account atau payment gateway otomatis. |
| Availability check | Perlu penguatan untuk range tanggal | Pencegahan double-booking berbasis jadwal. |
| Receipt | Cetak dari browser | Download PDF receipt langsung dari aplikasi. |
| Corporate account | Enum customer_type sudah mendukung | Dashboard khusus B2B dan kontrak pelanggan korporat. |

## 16. Penutup Presentasi

Tutup presentasi dengan mengulang nilai utama aplikasi: sistem membantu bisnis rental mengelola transaksi dari awal sampai akhir secara lebih rapi, terukur, dan mudah diaudit.

> **Kalimat penutup yang bisa dipakai**
> Dengan Rent Car Platform, proses rental tidak berhenti di katalog kendaraan. Aplikasi ini menghubungkan customer, kasir, admin, dan supir dalam satu workflow: booking, pembayaran, verifikasi, dispatch, return, receipt, dan laporan.
