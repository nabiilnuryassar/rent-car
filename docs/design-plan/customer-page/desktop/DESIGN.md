# Design System: FleetGo Customer Page 🚗✨

> Tema: Terang, asik, dan super clean!

Visualnya pakai dominan kuning pastel yang _fresh_ dipadu sama elemen item pekat biar teksnya gampang dibaca. Bentuknya banyak main di sudut melengkung biar keliatan _friendly_.

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

- **Font Utama (Sans-serif):** Dipakai buat teks biasa, deksripsi, navigasi, dan harga. Bikin tampilan modern dan rapi.
- **Font Aksen (Georgia/Serif):** Cuma dipakai buat judul raksasa di _sidebar_ ("Fleet Rental Management") biar ngasih kesan elegan dan premium.
- **Ketebalan (Weight):** Main di _Extrabold_ (buat judul utama), _Bold_ (buat nama mobil/fitur), dan _Medium/Regular_ (teks biasa).

## 🔲 Bentuk & Jarak (Shapes & Spacing)

- **Wadah Utama:** Punya lengkungan mulus banget `24px` plus bayangan super tipis biar berasa ngambang.
- **Kartu Mobil:** Sudutnya melengkung `20px`, dikasih _border_ tipis biar pisah dari _background_.
- **Tombol & Bar Pencarian:** Wajib bentuk kapsul / _pill_ (`rounded-full`). Bikin UI kerasa dinamis dan kekinian.
- **Foto Mobil:** Melengkung dikit `12px` ngikutin bentuk kartunya.

## 🕹️ Komponen Kunci

1.  **Tombol Utama (Booking):** _Background_ `#ffd801`, teks hitam tebal, ujungnya kapsul. Pas di-_hover_, warnanya agak lebih kuning terang.
2.  **Tag / Label:** _Background_ kuning transparan, teks hitam, ada _border_ kuning tipis. Bentuknya kecil, ujungnya agak kotak (`rounded-md`).
3.  **Status Indikator:** Pake titik hijau kecil plus teks hijau tua buat nandain mobil "Tersedia".
