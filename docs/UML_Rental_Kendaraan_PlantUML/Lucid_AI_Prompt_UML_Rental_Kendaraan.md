# Prompt / Specification untuk Lucid AI atau Lucid Manual Build

Buat satu dokumen Lucidchart berjudul: **UML Sistem Informasi Rental Kendaraan**.

Buat 4 halaman:
1. Use Case Diagram
2. Activity Diagram
3. Sequence Diagram
4. Class Diagram

## Halaman 1 — Use Case Diagram

Gunakan **UML actor/stick figure** untuk aktor berikut:
- Pelanggan
- Pelanggan Lama, generalization dari Pelanggan
- Admin
- Kasir
- Supir
- Bank/Transfer

System boundary: **Sistem Informasi Rental Kendaraan**.

Use case di dalam boundary:
- Registrasi / Login
- Lihat Katalog & Cek Ketersediaan
- Buat Pemesanan Sewa Kendaraan
- Pilih Durasi, Armada, Wilayah & Lokasi
- Hitung Tarif Otomatis
- Pilih Supir
- Free Upgrade Kendaraan
- Pesan Layanan Antar-Jemput
- Upload Bukti Transfer
- Input Pembayaran Tunai
- Verifikasi Pembayaran
- Generate / Cetak Kwitansi
- Kelola Data Kendaraan
- Kelola Tarif & Aturan Pricing
- Kelola Data Supir
- Konfirmasi Pengiriman / Ambil
- Catat Pengembalian Kendaraan
- Hitung Denda Overtime

Relasi penting:
- Buat Pemesanan Sewa Kendaraan <<include>> Pilih Durasi, Armada, Wilayah & Lokasi
- Buat Pemesanan Sewa Kendaraan <<include>> Hitung Tarif Otomatis
- Buat Pemesanan Sewa Kendaraan <<extend>> Pilih Supir [pelanggan lama]
- Buat Pemesanan Sewa Kendaraan <<extend>> Free Upgrade Kendaraan [stok kosong]
- Pesan Layanan Antar-Jemput <<include>> Hitung Tarif Otomatis
- Upload Bukti Transfer <<include>> Verifikasi Pembayaran
- Input Pembayaran Tunai <<include>> Generate / Cetak Kwitansi
- Verifikasi Pembayaran <<include>> Generate / Cetak Kwitansi
- Catat Pengembalian Kendaraan <<include>> Hitung Denda Overtime

## Halaman 2 — Activity Diagram

Buat swimlane/partition:
- CUSTOMER
- INTERNAL SYSTEM
- ADMIN / KASIR
- SUPIR

Alur utama:
Start -> Registrasi/Login -> Pilih jenis layanan.
Decision: Sewa Kendaraan atau Antar/Jemput.

Sewa Kendaraan:
Pilih jenis kendaraan -> isi durasi -> pilih ambil/kirim -> pilih dalam/luar kota -> validasi minimum 3 jam -> cek status pelanggan -> cek kendaraan -> jika pelanggan lama pilih supir, jika tidak assign otomatis -> jika kendaraan kosong cari kelas lebih tinggi dan tawarkan free upgrade.

Antar/Jemput:
Isi lokasi jemput -> isi tujuan -> isi jadwal -> sistem ambil tarif tabel jarak & waktu.

Merge:
Hitung total biaya -> pilih pembayaran -> jika tunai kasir input pembayaran -> jika transfer pelanggan upload bukti dan admin verifikasi -> jika valid set PAID -> generate kwitansi -> unlock order -> jadwal supir -> supir melaksanakan layanan -> admin input pengembalian -> sistem hitung overtime -> transaksi selesai.

## Halaman 3 — Sequence Diagram

Gunakan section/box horizontal:
**CUSTOMER | INTERNAL SYSTEM | ADMIN / KASIR | DRIVER | EXTERNAL**.

Participant:
CUSTOMER: Pelanggan
INTERNAL SYSTEM: Web/App, Rental Service, Inventory Service, Pricing Engine, Driver Service, Payment Service, Receipt Service
ADMIN / KASIR: Admin/Kasir
DRIVER: Supir
EXTERNAL: Bank

Message utama:
1. Pelanggan registrasi/login ke Web/App
2. Pelanggan melihat katalog
3. Web/App meminta available vehicles ke Inventory
4. Pelanggan submit pemesanan
5. Rental Service menghitung harga via Pricing Engine
6. Rental Service reserve kendaraan ke Inventory
7. Alt tersedia/tidak tersedia: jika tidak tersedia cari higher class vehicle dan offer free upgrade
8. Opt pelanggan lama: tampilkan dan reserve supir pilihan
9. Alt pembayaran tunai/transfer
10. Tunai: Admin/Kasir record cash payment
11. Transfer: Customer upload bukti, Admin/Kasir verify, Payment Service validasi bank optional
12. Receipt Service generate kwitansi
13. Rental Service mark as PAID
14. Driver Service assign schedule
15. Supir kirim kendaraan / melaksanakan layanan
16. Admin input waktu pengembalian
17. Pricing Engine hitung overtime jika terlambat
18. Web/App menampilkan transaksi selesai

## Halaman 4 — Class Diagram

Class utama:
- User
- Customer
- Admin
- Cashier
- Driver
- VehicleCategory
- Vehicle
- PricingRule
- OvertimePenalty
- Order
- RentalOrder
- ShuttleOrder
- UpgradeOffer
- Payment
- Receipt
- ShuttleTariff

Inheritance:
- User <|-- Customer
- User <|-- Admin
- User <|-- Cashier
- User <|-- Driver
- Order <|-- RentalOrder
- Order <|-- ShuttleOrder

Relasi:
- Customer 1 -- 0..* Order
- VehicleCategory 1 -- 0..* Vehicle
- VehicleCategory 1 -- 0..* PricingRule
- VehicleCategory 1 -- 1 OvertimePenalty
- RentalOrder 1 -- 1 Vehicle
- RentalOrder 1 -- 1 Driver
- RentalOrder 0..1 -- 1 UpgradeOffer
- Order 1 -- 0..* Payment
- Payment 1 -- 0..1 Receipt
- ShuttleOrder 1 -- 1 ShuttleTariff
- Cashier 1 -- 0..* Payment
- Admin 1 -- 0..* Payment
- Driver 1 -- 0..* RentalOrder
