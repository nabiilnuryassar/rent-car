# Design System: FleetGo Mobile App 📱✨

> Tema: Premium, clean, dan aesthetic!

Tampilan versi _mobile_ ini bawa _vibe_ yang sama kayak _desktop_, tapi lebih padat dan fokus ke _scrolling_ vertikal. Poin utamanya ada di navigasi bawah yang ngambang (_floating_) dan kartu mobil yang dibikin horizontal.

## 🎨 Warna (Color Palette)

| Nama             | Kode Hex  | Kedudukan di Design System                                                                     |
| :--------------- | :-------- | :--------------------------------------------------------------------------------------------- |
| **Navy Blue**    | `#0f172a` | _Primary_: Warna teks utama, super kontras dan tajam.                                          |
| **Amber Gold**   | `#f59e0b` | _Accent / Warning_: _Highlight_ menu aktif, grafik, tombol, dan _badge_ notif.                 |
| **Pale Amber**   | `#fffbeb` | _Warning Background_: Latar belakang khusus peringatan/perhatian.                              |
| **Success Green**| `#10b981` | _Success_: Indikator tren naik, status aman/berhasil.                                          |
| **Pale Green**   | `#ecfdf5` | _Success Background_: Latar belakang status aman/berhasil.                                     |
| **Slate Gray**   | `#64748b` | _Text Secondary_: Teks sekunder, deskripsi, atau detail data.                                  |
| **Surface Gray** | `#f8fafc` | _Surface_: _Background_ buat _card_ KPI, _sidebar_, sama _header_. Memisahkan dari latar utama.|
| **Base White**   | `#ffffff` | _Base / Background_: _Background_ utama layar. Memberi kesan ruang kerja yang luas dan bersih. |

## ✍️ Tipografi (Font)

- **Font Utama (Sans-serif):** Buat detail mobil, harga, lokasi, sama menu bawah. Bikin UI keliatan bersih dan modern di layar kecil.
- **Font Aksen (Serif):** Dipakai buat _header_ raksasa ("Fleet Rental") dan nama mobil di dalam kartu. Ngasih kesan mahal.
- **Hierarki:** Judul wajib _Extrabold_, nama mobil _Bold_, detail lainnya _Medium/Regular_.

## 🔲 Bentuk & Layout (Shapes & Spacing)

- **Kartu Mobil (Horizontal Card):** Tampilannya nyamping. Gambar mobil di kiri, info di kanan. Sudut luar kartu melengkung `24px` plus efek _soft shadow_ biar kerasa _3D_ / timbul.
- **Navigasi Bawah (Floating Bottom Nav):** Bentuknya kapsul panjang (`rounded-full`), ngambang di atas _background_ utama, dikasih _shadow_ biar nggak nyaru.
- **Gambar Mobil:** Punya lengkungan sendiri `16px`, proporsinya ngisi sisi kiri kartu.

## 🕹️ Komponen Kunci

1.  **Tombol "Book":** Ukuran lebih mungil dibanding _desktop_, _background_ kuning `#ffd801`, ujung kapsul, ditaruh di pojok kanan bawah tiap kartu.
2.  **Tag / Badge Status:** Nempel di atas nama mobil. Bentuknya lonjong kecil, ada ikon _micro_, dan warnanya ngikutin konteks (misal ijo buat "Free Upgrade").
3.  **Header:** Simpel aja, lokasi di kiri atas (pakai ikon _pin_ kuning) sama tombol filter di kanan atas pakai _background_ transparan/putih tipis.
