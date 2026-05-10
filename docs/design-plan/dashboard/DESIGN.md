# Design System: FleetGo Admin Dashboard 📊✨

> Tema: Profesional, padat data, tapi tetep _chill_ dan _fresh_!

Visual _dashboard_ ini dibikin rapi dan muat banyak info, tapi nggak bikin mata sepet. Main di _background_ pastel dan _card_ terang biar fokusnya langsung ke angka metrik dan grafik.

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

- **Font Utama (Sans-serif):** Dipakai di 90% UI (angka metrik, tabel data, menu). Tujuannya biar data gampang di-_scan_ cepat.
- **Font Aksen (Serif/Georgia):** Cuma dipake buat teks sapaan kayak "Good Morning, Admin" biar ada sentuhan _classy_ dan elegan.
- **Hierarki Ketebalan:** Angka metrik gede wajib _Extrabold_, nama menu/judul _card_ pakai _Bold_, detail data pakai _Medium_.

## 🔲 Bentuk & Layout (Shapes & Spacing)

- **Wadah Card & Panel:** Semua kotak data punya sudut melengkung `20px`, _border_ abu-abu tipis, dan _shadow_ super halus. Bikin UI kerasa numpuk rapi (_layered_).
- **Search & Tombol Icon:** Wajib bentuk kapsul bulat penuh (`rounded-full`).
- **Sidebar:** Kaku di kiri, pake penanda garis vertikal kuning buat nunjukin menu mana yang lagi aktif.

## 🕹️ Komponen Kunci

1.  **KPI Cards:** Tampilannya langsung _to-the-point_. Ada ikon bulat berwarna di kiri, judul kecil, angka raksasa, dan indikator persentase naik-turun di bawahnya.
2.  **Badge Status Tabel:** Bentuknya lonjong mungil, teks _uppercase_ kecil tebal. Warnanya ngikutin status (Ijo = _Rented_, Kuning = _Pending_, Merah = _Overdue_).
3.  **Tabel Data:** Bersih banget. _Border_ pembatasnya tipis, dan tiap baris kalau disentuh (_hover_) bakal nyala dikit biar gampang dibaca sebaris.
