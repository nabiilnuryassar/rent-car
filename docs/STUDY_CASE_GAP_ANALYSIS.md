# Analisis Kesesuaian Aplikasi terhadap Studi Kasus

Tanggal analisis: 12 Mei 2026

## Kesimpulan Umum

Secara umum, aplikasi URBAN 8 sudah cukup selaras dengan kebutuhan inti studi kasus dan MVP. Modul utama seperti autentikasi berbasis peran, katalog kendaraan, pemesanan sewa, layanan antar-jemput, pengelolaan kendaraan, pengemudi, tarif, pembayaran, verifikasi pembayaran, kuitansi, dan laporan dasar sudah tersedia.

Kesenjangan terbesar tidak berada pada fungsi dasar MVP, melainkan pada kelengkapan operasional tingkat lanjut yang disebutkan dalam PRD dan studi kasus. Dengan demikian, aplikasi layak dipresentasikan sebagai MVP akademis, tetapi masih memerlukan beberapa penguatan apabila ingin disamakan dengan sistem produksi penuh.

## Area yang Sudah Selaras

- Autentikasi dan peran pengguna sudah mendukung admin, kasir, pelanggan, dan pengemudi.
- Katalog kendaraan sudah menampilkan armada dan status ketersediaan dasar.
- Pemesanan sewa kendaraan sudah mencakup durasi, unit sewa, pengemudi, opsi pengambilan/pengantaran, serta perjalanan luar kota.
- Perhitungan harga sudah memakai aturan tarif per kategori dan unit waktu.
- Layanan antar-jemput sudah memiliki tarif berbasis rute.
- Pembayaran sudah mendukung transfer dan tunai, termasuk verifikasi bukti transfer.
- Kuitansi sudah diterbitkan setelah pembayaran valid.
- Admin sudah dapat mengelola kendaraan, kategori, pengemudi, tarif, denda kelebihan waktu, pesanan, pembayaran, pengaturan, dan laporan dasar.
- Demo seeder sudah disusun untuk mewakili alur status utama yang muncul pada UML, PRD, dan MVP.

## Kesenjangan Prioritas Tinggi

- Verifikasi pembayaran oleh kasir belum sepenuhnya terbuka dari sisi route. Controller mendukung logika staf, tetapi route verifikasi saat ini masih cenderung berada pada area admin.
- Pembayaran denda kelebihan waktu belum sepenuhnya menjadi tagihan terpisah yang mengunci penyelesaian pesanan sampai dibayar.
- Kuitansi masih berupa halaman cetak, belum berupa berkas PDF resmi yang dapat diunduh.
- Ketersediaan katalog masih dominan berdasarkan status kendaraan, belum sepenuhnya berbasis jadwal dan rentang waktu pemesanan pada seluruh permukaan UI.
- Pemilihan pengemudi oleh pelanggan setia masih perlu penguatan aturan agar hanya berlaku sesuai kondisi loyalitas dan jadwal yang valid.

## Kesenjangan Prioritas Menengah

- Audit log sudah tersedia, tetapi belum mencakup seluruh perubahan penting seperti perubahan tarif, kategori, dan konfigurasi perusahaan.
- Laporan masih berupa ringkasan pendapatan rental, belum mencakup ekspor CSV/PDF dan analisis manajemen yang lebih luas.
- Manajemen pelanggan dan riwayat pelanggan belum tersedia sebagai menu admin khusus.
- Manajemen pengguna dan peran belum tersedia sebagai antarmuka admin.
- Fitur perusahaan atau B2B belum lengkap, termasuk dashboard korporasi dan penagihan bulanan.

## Kesenjangan di Luar Cakupan MVP

- Integrasi peta, geofencing, dan estimasi lokasi belum tersedia.
- Integrasi payment gateway, virtual account, atau validasi bank otomatis belum tersedia.
- Sistem rating pengemudi dan umpan balik pelanggan belum tersedia.
- Pengingat perawatan kendaraan berbasis jadwal atau kilometer belum tersedia.
- Analitik performa pengemudi dan armada belum tersedia.

## Penilaian Akhir

Kesenjangan aplikasi terhadap studi kasus tidak tergolong besar untuk ruang lingkup MVP. Aplikasi sudah memenuhi sebagian besar alur utama yang dibutuhkan untuk demonstrasi akademis: pelanggan dapat melakukan pemesanan, pembayaran dapat diverifikasi, admin dapat mengelola operasional, dan pengemudi memiliki konteks penugasan.

Namun, apabila standar pembandingnya adalah PRD penuh atau sistem operasional produksi, masih terdapat gap menengah hingga besar pada otomasi pembayaran, kuitansi PDF, manajemen pelanggan, laporan lanjutan, audit menyeluruh, dan integrasi eksternal.
