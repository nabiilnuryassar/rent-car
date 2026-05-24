# Elisitasi Sistem Rental Kendaraan

## 1. Elisitasi Tahap I

Tahap ini berisi seluruh kebutuhan awal sistem berdasarkan proses bisnis rental kendaraan.

| No  | Requirement (Kebutuhan Sistem)                                                                 | Keterangan / Sumber                          |
| --- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | Sistem menyediakan fitur pendaftaran dan pencatatan histori pelanggan                          | Untuk membedakan pelanggan baru dan lama     |
| 2   | Sistem menampilkan katalog jenis kendaraan (Sedan, MPV, Mobil Box, dll) beserta tarifnya       | Kebutuhan dasar sewa kendaraan               |
| 3   | Sistem mendukung pemesanan kendaraan lengkap dengan supir                                      | Aturan bisnis: sewa termasuk supir tanpa BBM |
| 4   | Sistem menyediakan opsi pengambilan: datang langsung atau dikirim ke tempat                    | Kebutuhan layanan pelanggan                  |
| 5   | Sistem menyediakan opsi durasi: per jam (min 3 jam), harian, mingguan, hingga bulanan          | Pilihan waktu penyewaan fleksibel            |
| 6   | Sistem menghitung tarif dinamis (semakin lama sewa, harga semakin murah)                       | Aturan bisnis penetapan harga                |
| 7   | Sistem menghitung biaya kelebihan waktu (_overtime_) per kelipatan jam                         | Denda keterlambatan pengembalian             |
| 8   | Sistem menghitung biaya tambahan (_surcharge_) 20% untuk sewa luar kota                        | Aturan bisnis wilayah sewa                   |
| 9   | Sistem melayani pemesanan antar-jemput saja                                                    | Layanan tambahan perusahaan                  |
| 10  | Sistem menghitung tarif antar-jemput berdasarkan tabel perkiraan jarak & waktu                 | Aturan harga layanan antar-jemput            |
| 11  | Sistem memberikan fitur bagi pelanggan lama untuk memilih supir yang diinginkan                | Hak istimewa pelanggan lama                  |
| 12  | Sistem memiliki fitur _free upgrade_ otomatis ke kelas kendaraan lebih tinggi jika stok kosong | Solusi operasional                           |
| 13  | Sistem memblokir penggunaan/pengiriman sebelum pembayaran lunas                                | Aturan pelunasan di awal                     |
| 14  | Sistem melayani pencatatan pembayaran tunai                                                    | Metode pembayaran                            |
| 15  | Sistem melayani pembayaran transfer bank dan verifikasi bukti transfer                         | Transfer harus diverifikasi                  |
| 16  | Sistem otomatis mencetak/menerbitkan kwitansi setelah pembayaran lunas                         | Bukti transaksi                              |
| 17  | Sistem memiliki notifikasi tracking posisi kendaraan saat dikirim                              | Kebutuhan tambahan                           |
| 18  | Sistem menghitung estimasi biaya BBM harian                                                    | Usulan tambahan                              |

---

# 2. Elisitasi Tahap II (MDI)

Klasifikasi kebutuhan berdasarkan:

- **M** = Mandatory (Wajib)
- **D** = Desirable (Disarankan)
- **I** = Inessential (Tidak penting / dieliminasi)

| No  | Requirement                     | MDI | Alasan                                 |
| --- | ------------------------------- | --- | -------------------------------------- |
| 1   | Pendaftaran & histori pelanggan | M   | Fitur wajib                            |
| 2   | Katalog kendaraan               | M   | Inti sistem                            |
| 3   | Sewa kendaraan + supir          | M   | Fitur utama                            |
| 4   | Ambil langsung / dikirim        | M   | Kebutuhan layanan                      |
| 5   | Durasi sewa bertingkat          | M   | Aturan bisnis                          |
| 6   | Tarif dinamis                   | M   | Aturan harga                           |
| 7   | Denda overtime                  | M   | Aturan denda                           |
| 8   | Surcharge luar kota             | M   | Aturan harga                           |
| 9   | Layanan antar-jemput            | M   | Bagian bisnis                          |
| 10  | Tarif antar-jemput              | M   | Penentuan harga                        |
| 11  | Pilih supir                     | M   | Hak pelanggan lama                     |
| 12  | Free upgrade kendaraan          | M   | Penanganan stok                        |
| 13  | Pelunasan sebelum penggunaan    | M   | Aturan operasional                     |
| 14  | Pembayaran tunai                | M   | Metode bayar                           |
| 15  | Verifikasi transfer             | M   | Validasi pembayaran                    |
| 16  | Kwitansi pembayaran             | M   | Bukti transaksi                        |
| 17  | Tracking kendaraan              | D   | Nilai tambah                           |
| 18  | Estimasi biaya BBM              | I   | Bertentangan dengan aturan “tanpa BBM” |

---

# 3. Elisitasi Tahap III (TOE + HML)

Analisis:

- **T** = Technical
- **O** = Operational
- **E** = Economic

Nilai:

- **H** = High
- **M** = Medium
- **L** = Low

| No  | Requirement                   | T   | O   | E   | HML | Keputusan   |
| --- | ----------------------------- | --- | --- | --- | --- | ----------- |
| 1   | Histori pelanggan             | L   | L   | L   | L   | Diterima    |
| 2   | Katalog kendaraan             | L   | L   | L   | L   | Diterima    |
| 3   | Sewa kendaraan + supir        | L   | L   | L   | L   | Diterima    |
| 4   | Ambil / kirim kendaraan       | M   | L   | L   | M   | Diterima    |
| 5   | Durasi sewa fleksibel         | M   | L   | L   | M   | Diterima    |
| 6   | Tarif dinamis                 | M   | M   | L   | M   | Diterima    |
| 7   | Denda overtime                | M   | M   | L   | M   | Diterima    |
| 8   | Surcharge luar kota           | L   | L   | L   | L   | Diterima    |
| 9   | Antar-jemput                  | L   | L   | L   | L   | Diterima    |
| 10  | Tarif berdasarkan jarak/waktu | M   | M   | M   | M   | Diterima    |
| 11  | Pilih supir                   | M   | L   | L   | M   | Diterima    |
| 12  | Free upgrade kendaraan        | M   | M   | M   | M   | Diterima    |
| 13  | Pelunasan wajib               | L   | L   | L   | L   | Diterima    |
| 14  | Pembayaran tunai              | L   | L   | L   | L   | Diterima    |
| 15  | Verifikasi transfer           | M   | M   | L   | M   | Diterima    |
| 16  | Kwitansi otomatis             | L   | L   | L   | L   | Diterima    |
| 17  | Tracking kendaraan            | H   | H   | H   | H   | Dieliminasi |

---

# 4. Final Draft Elisitasi

Final requirement yang siap masuk ke tahap desain sistem UML dan development.

| No  | Requirement Final                             | Prioritas | Modul                |
| --- | --------------------------------------------- | --------- | -------------------- |
| 1   | Portal registrasi & histori pelanggan         | Tinggi    | User Management      |
| 2   | Katalog kendaraan & status ketersediaan       | Tinggi    | Vehicle Management   |
| 3   | Transaksi sewa kendaraan lengkap dengan supir | Tinggi    | Rental Transaction   |
| 4   | Tarif dinamis berdasarkan durasi              | Tinggi    | Pricing Engine       |
| 5   | Perhitungan otomatis overtime                 | Tinggi    | Billing & Penalty    |
| 6   | Tambahan biaya 20% luar kota                  | Tinggi    | Pricing Engine       |
| 7   | Modul layanan antar-jemput                    | Tinggi    | Shuttle Service      |
| 8   | Pengiriman kendaraan / ambil di tempat        | Tinggi    | Rental Transaction   |
| 9   | Fitur pilih supir untuk pelanggan lama        | Tinggi    | Driver Management    |
| 10  | Free upgrade kendaraan otomatis               | Sedang    | Rental Transaction   |
| 11  | Lock transaksi sebelum lunas                  | Tinggi    | Payment System       |
| 12  | Input pembayaran tunai                        | Tinggi    | Payment System       |
| 13  | Upload & verifikasi bukti transfer            | Tinggi    | Payment System       |
| 14  | Generate kwitansi digital/cetak               | Tinggi    | Reporting & Document |

---

# 5. Catatan Teknis untuk Developer / AI Agent

## Aktor Sistem

- Customer
- Admin
- Kasir
- Driver

---

## Core Entity

- User
- Customer
- Vehicle
- VehicleCategory
- Driver
- RentalTransaction
- ShuttleTransaction
- Payment
- Invoice
- PricingRule
- OvertimePenalty

---

## Rule Bisnis Penting

### Rental

- Minimal rental per jam = 3 jam
- Rental dapat:
  - per jam
  - harian
  - mingguan
  - bulanan

### Pricing

- Semakin lama durasi sewa → harga lebih murah
- Surcharge luar kota = 20%
- Overtime dihitung per jam

### Driver

- Semua rental wajib dengan supir
- Pelanggan lama dapat memilih supir

### Vehicle Upgrade

- Jika kendaraan tidak tersedia:
  - sistem menawarkan upgrade
  - harga tetap menggunakan harga awal

### Payment

- Status booking:
  - `PENDING`
  - `WAITING_VERIFICATION`
  - `PAID`
  - `COMPLETED`
  - `CANCELLED`

- Kendaraan tidak boleh dikirim sebelum status `PAID`

---

# 6. Rekomendasi Arsitektur Sistem

## Backend

- Laravel / Inertia JS

## Frontend

- React / Alpine JS

## Database

- PostgreSQL / MySQL

## Authentication

- JWT / Session Auth

## Storage

- Upload bukti transfer
- Generate PDF kwitansi
