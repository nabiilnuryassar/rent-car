# Fix Pricing Calculator: Show Discount Breakdown

Date: 2026-05-24  
Area: frontend  
Type: fix

## Context

Harga yang tampil di estimasi catalog (booking modal) tidak konsisten dengan harga di invoice dan detail pesanan. Catalog menampilkan `base_rate × duration` tanpa memperhitungkan `discount_rate`, sedangkan backend (`RentalPricingService`) sudah menghitung diskon dengan benar sejak awal. Hasilnya: catalog menampilkan Rp 2.700.000 tapi invoice menunjukkan Rp 2.400.000 untuk rule yang sama (karena ada discount_rate ~11%).

Selain itu, halaman admin Harga dan Tarif tidak menampilkan kolom diskon dan harga aktual, sehingga admin tidak bisa melihat efek discount_rate yang sudah di-set.

## What changed

- **`resources/js/components/customer/VehicleModal.tsx`**
  - Tambah `discount_rate?` dan `out_of_town_surcharge_rate?` ke type `PricingRule`
  - Kalkulasi estimasi harga di booking step sekarang mengikuti logika `RentalPricingService`:
    1. `subtotal = base_rate × duration`
    2. `discountAmount = round(subtotal × discount_rate)`
    3. `afterDiscount = subtotal − discountAmount`
    4. `surchargeAmount = round(afterDiscount × surcharge_rate)` (hanya jika luar kota)
    5. `total = afterDiscount + surchargeAmount`
  - UI breakdown ditampilkan baris per baris: subtotal → diskon (% badge hijau, hanya muncul jika > 0) → surcharge luar kota (hanya muncul jika centang) → total
  
- **`resources/js/pages/admin/pricing/index.tsx`**
  - Tambah field input **Diskon %** di form tambah aturan harga (opsional, 0–100%)
  - Preview real-time "Harga setelah diskon" muncul di bawah input jika diisi
  - Tabel pricing rules kini menampilkan:
    - **Harga Dasar** — dicoret jika ada diskon
    - **Diskon** — badge hijau `-X%`, atau `—` jika tidak ada
    - **Harga Aktual** — harga efektif setelah diskon (bold navy)
  - Submit form mengkonversi persen → desimal sebelum dikirim ke backend (karena validasi backend `max:1`)

## Impact

- Catalog calculator sekarang konsisten dengan invoice
- Admin bisa melihat dan memahami efek `discount_rate` tanpa menghitung manual
- Fitur diskon sekarang transparan bagi customer (tampil di breakdown estimasi)
- Tidak ada perubahan logika backend atau database

## How to test

1. Buka `/catalog` sebagai customer, klik kendaraan, masuk ke step Pemesanan
2. Isi unit sewa (misal: Per Minggu), isi durasi (misal: 1)
3. Estimasi sekarang menampilkan subtotal + baris diskon (jika ada) + total
4. Ceklis "Perjalanan Luar Kota" — baris surcharge muncul
5. Buat order → bandingkan total di invoice dengan estimasi di catalog (seharusnya sama)
6. Buka `/admin/pricing` → lihat kolom Diskon dan Harga Aktual di tabel
7. Coba tambah rule baru dengan diskon 10% → preview muncul sebelum submit

## Rollback plan

- Revert `VehicleModal.tsx` ke versi sebelumnya (hapus field discount_rate dari type, kembalikan kalkulasi `base_rate × duration` sederhana)
- Revert `admin/pricing/index.tsx` ke versi sebelumnya (hapus kolom Diskon/Harga Aktual dan field input %)
