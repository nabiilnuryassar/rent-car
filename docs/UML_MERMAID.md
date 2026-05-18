# UML Mermaid - Rent Car Platform

> **Version:** 1.4 (Academic Friendly)
> **Last Updated:** 2026-05-17
> **Format:** Mermaid.js
> **Tujuan:** Diagram dibuat pendek per topik dan menggunakan bahasa proses bisnis agar mudah dipresentasikan untuk audiens akademis umum.

---

## Cara Membaca Dokumen Ini

Dokumen ini adalah versi Mermaid yang disiapkan untuk presentasi. Diagram besar dari versi sebelumnya dipecah menjadi beberapa bagian kecil supaya presenter tidak perlu menjelaskan terlalu banyak alur dalam satu gambar. Penamaan modul dan istilah pada diagram juga dibuat dalam bahasa proses bisnis agar dapat dipahami oleh pembaca yang tidak berlatar belakang teknis.

Urutan presentasi yang disarankan:

1. Mulai dari **Use Case** untuk menjelaskan siapa saja aktornya.
2. Lanjut ke **Class Diagram** untuk menunjukkan struktur data inti.
3. Gunakan **Sequence Diagram** per skenario untuk menjelaskan komunikasi sistem.
4. Tutup dengan **Activity Diagram Swimlane** untuk memperlihatkan proses lintas role.

---

## 1. Use Case Diagram

Use case dipecah menjadi empat kelompok: Customer, Pembayaran, Admin Operasional, dan Driver/Laporan. Ini lebih enak dipakai di slide karena tiap diagram punya satu fokus cerita.

### 1.1 Use Case Customer - Catalog, Rental, dan Shuttle

```mermaid
flowchart LR
    classDef actor fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px,rx:20
    classDef usecase fill:#fde68a,color:#111827,stroke:#b45309,rx:40
    classDef note fill:#f8fafc,color:#334155,stroke:#cbd5e1,rx:8

    Customer([Customer]):::actor
    Loyal([Customer Loyal]):::actor

    subgraph System["Rent Car Platform - Customer Area"]
        direction TB
        UC01((Registrasi / Login)):::usecase
        UC02((Browse Catalog dan Detail Kendaraan)):::usecase
        UC03((Buat Order Rental)):::usecase
        UC04((Pilih Durasi, Unit, Wilayah, dan Pickup)):::usecase
        UC05((Hitung Tarif Otomatis)):::usecase
        UC06((Pilih Supir)):::usecase
        UC08((Pesan Shuttle)):::usecase
        UC25((Lihat Riwayat Order)):::usecase
    end

    Customer --> UC01
    Customer --> UC02
    Customer --> UC03
    Customer --> UC08
    Customer --> UC25

    Loyal -.->|inherit akses customer| Customer
    Loyal --> UC06

    UC03 -.->|include| UC04
    UC03 -.->|include| UC05
    UC03 -.->|extend: jika loyal| UC06
    UC08 -.->|include| UC05
```

**Keterangan presentasi:**
Diagram ini menjelaskan journey customer dari login, melihat catalog, membuat order rental, atau memilih layanan shuttle. Customer loyal mendapat use case tambahan: memilih supir.

### 1.2 Use Case Pembayaran dan Kwitansi

```mermaid
flowchart LR
    classDef actor fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px,rx:20
    classDef usecase fill:#fde68a,color:#111827,stroke:#b45309,rx:40

    Customer([Customer]):::actor
    Admin([Admin]):::actor
    Kasir([Kasir]):::actor

    subgraph System["Rent Car Platform - Payment Area"]
        direction TB
        UC09((Upload Bukti Transfer)):::usecase
        UC10((Input Pembayaran Tunai)):::usecase
        UC11((Verifikasi Transfer)):::usecase
        UC12((Generate Kwitansi)):::usecase
        UC24((Lihat Receipt)):::usecase
    end

    Customer --> UC09
    Customer --> UC24
    Admin --> UC11
    Admin --> UC24
    Kasir --> UC10
    Kasir --> UC11
    Kasir --> UC24

    UC09 -.->|include| UC11
    UC10 -.->|include| UC12
    UC11 -.->|include| UC12
    UC12 -.->|include| UC24
```

**Keterangan presentasi:**
Pembayaran dipisah karena ini adalah titik kontrol penting. Transfer harus diverifikasi, sedangkan cash diinput oleh kasir. Keduanya menghasilkan receipt setelah status payment menjadi paid.

### 1.3 Use Case Admin - Master Data dan Operasional Order

```mermaid
flowchart LR
    classDef actor fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px,rx:20
    classDef usecase fill:#fde68a,color:#111827,stroke:#b45309,rx:40

    Admin([Admin]):::actor

    subgraph System["Rent Car Platform - Admin Area"]
        direction TB
        UC13((Kelola Kendaraan dan Kategori)):::usecase
        UC14((Kelola Pricing Rule dan Overtime)):::usecase
        UC15((Kelola Data Supir)):::usecase
        UC19((Kelola Tarif Shuttle)):::usecase
        UC16((Dispatch Order)):::usecase
        UC17((Catat Return)):::usecase
        UC18((Hitung Overtime)):::usecase
        UC20((Complete Order)):::usecase
    end

    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC19
    Admin --> UC16
    Admin --> UC17
    Admin --> UC20

    UC16 -.->|guard: payment paid| UC20
    UC17 -.->|include| UC18
    UC20 -.->|include| UC17
```

**Keterangan presentasi:**
Diagram ini menjelaskan peran admin sebagai pengendali operasional. Admin menyiapkan master data, menjalankan dispatch, mencatat return, dan menyelesaikan order.

### 1.4 Use Case Dashboard, Audit, dan Driver

```mermaid
flowchart LR
    classDef actor fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px,rx:20
    classDef usecase fill:#fde68a,color:#111827,stroke:#b45309,rx:40
    classDef gap fill:#fee2e2,color:#7f1d1d,stroke:#ef4444,rx:8

    Admin([Admin]):::actor
    Driver([Supir]):::actor

    subgraph System["Rent Car Platform - Monitoring Area"]
        direction TB
        UC21((Lihat Dashboard Operasional)):::usecase
        UC22((Generate Laporan Transaksi dan Revenue)):::usecase
        UC23((View Audit Log Internal)):::usecase
        UC26((Role-Based Dashboard Redirect)):::usecase
        UC27((Lihat Order Assigned)):::usecase
        GAP1[Notifikasi otomatis ke supir belum tersedia]:::gap
    end

    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC26
    Driver --> UC26
    Driver --> UC27
    UC27 -.-> GAP1
```

**Keterangan presentasi:**
Bagian ini cocok dipakai untuk menjelaskan dashboard, laporan, audit, dan batasan versi. Supir dapat melihat area kerjanya, tetapi notifikasi otomatis masih menjadi roadmap.

---

## 2. Class Diagram

Class diagram menggambarkan keseluruhan struktur data inti sistem mengikuti standar UML: **class** (nama, atribut bertipe data, metode), **multiplicities** (1, 0..1, 0..\*, 1..\*), serta tiga jenis hubungan (**association** untuk relasi biasa, **composition** untuk lifecycle terikat, **inheritance** untuk peran user). `OrderRental` dan `OrderShuttle` adalah dua jenis transaksi utama; `Pembayaran` bersifat polimorfik agar dapat dipakai untuk keduanya. `KategoriKendaraan` menjadi sumber `AturanHarga` dan `DendaKeterlambatan`. Visibility memakai konvensi `-` (private field), `+` (public method).

```mermaid
classDiagram
    direction LR

    class Pengguna {
        -id : Long
        -nama : String
        -email : String
        -kataSandi : String
        -peran : Peran
        +login(email, kataSandi) bool
        +keluar() void
        +punyaPeran(peran) bool
    }

    class Pelanggan {
        -id : Long
        -noTelepon : String
        -alamat : String
        -tipePelanggan : TipePelanggan
        -totalOrderSelesai : int
        +apakahPelangganLoyal() bool
        +naikkanTotalOrder() void
    }

    class Supir {
        -id : Long
        -noLisensi : String
        -noTelepon : String
        -gelarProfesional : String
        -tahunPengalaman : int
        -status : StatusSupir
        +ubahStatus(status) void
        +sedangBertugas() bool
    }

    class KategoriKendaraan {
        -id : Long
        -nama : String
        -deskripsi : String
        -statusAktif : bool
        +daftarAturanHarga() List~AturanHarga~
    }

    class Kendaraan {
        -id : Long
        -noPlat : String
        -merk : String
        -model : String
        -tahun : int
        -status : StatusKendaraan
        -lokasiSekarang : String
        -gambar : List~String~
        +cekKetersediaan(mulai, selesai) bool
        +pesan() void
        +lepaskan() void
    }

    class AturanHarga {
        -id : Long
        -satuanSewa : SatuanSewa
        -durasiMin : int
        -durasiMax : int
        -tarifDasar : Money
        -diskon : Decimal
        -biayaLuarKota : Decimal
        +hitungTarif(durasi, luarKota) Money
    }

    class DendaKeterlambatan {
        -id : Long
        -tarifPerJam : Money
        +hitungDenda(jamTerlambat) Money
    }

    class TarifShuttle {
        -id : Long
        -areaAsal : String
        -areaTujuan : String
        -estimasiJarakKm : Decimal
        -estimasiDurasiMenit : int
        -tarif : Money
    }

    class OrderRental {
        -id : Long
        -nomorOrder : String
        -status : StatusOrder
        -waktuMulai : DateTime
        -waktuSelesai : DateTime
        -waktuKembaliAktual : DateTime
        -totalBiaya : Money
        -satuanSewa : SatuanSewa
        -durasi : int
        -luarKota : bool
        -opsiPenjemputan : OpsiPenjemputan
        -alamatAntar : String
        +konfirmasi() void
        +berangkatkan() void
        +catatPengembalian(waktu) void
        +batalkan() void
    }

    class OrderShuttle {
        -id : Long
        -nomorOrder : String
        -alamatJemput : String
        -alamatTujuan : String
        -waktuJadwal : DateTime
        -status : StatusOrder
        -totalBiaya : Money
        +konfirmasi() void
        +batalkan() void
    }

    class Pembayaran {
        -id : Long
        -metode : MetodePembayaran
        -status : StatusPembayaran
        -nominal : Money
        -waktuBayar : DateTime
        -urlBuktiTransfer : String
        -waktuVerifikasi : DateTime
        -diverifikasiOleh : Long
        +unggahBukti(file) void
        +verifikasi(kasir) void
        +tolak(alasan) void
        +catatTunai(kasir) void
    }

    class Kwitansi {
        -id : Long
        -nomorKwitansi : String
        -waktuTerbit : DateTime
        -urlPdf : String
        +unduh() File
    }

    class PenawaranUpgrade {
        -id : Long
        -status : StatusPenawaran
        +setujui() void
        +tolak() void
    }

    class CatatanAudit {
        -id : Long
        -aksi : String
        -tipeSubjek : String
        -idSubjek : Long
        -metadata : Json
        -waktu : DateTime
    }

    Pengguna <|-- Pelanggan : peran
    Pengguna <|-- Supir : peran

    Pengguna "1" -- "0..*" CatatanAudit : mencatat

    KategoriKendaraan "1" -- "0..*" Kendaraan : mengelompokkan
    KategoriKendaraan "1" *-- "0..*" AturanHarga : punya
    KategoriKendaraan "1" *-- "0..1" DendaKeterlambatan : punya

    Pelanggan "1" -- "0..*" OrderRental : memesan
    Pelanggan "1" -- "0..*" OrderShuttle : memesan
    Kendaraan "1" -- "0..*" OrderRental : disewa
    Supir "0..1" -- "0..*" OrderRental : ditugaskan
    TarifShuttle "1" -- "0..*" OrderShuttle : merujuk

    OrderRental "1" *-- "0..*" Pembayaran : melunasi
    OrderShuttle "1" *-- "0..*" Pembayaran : melunasi
    Pembayaran "1" *-- "0..1" Kwitansi : menerbitkan
    Pengguna "1" -- "0..*" Pembayaran : memverifikasi

    OrderRental "1" *-- "0..1" PenawaranUpgrade : menawarkan
    PenawaranUpgrade "0..*" -- "1" KategoriKendaraan : asal
    PenawaranUpgrade "0..*" -- "1" Kendaraan : upgrade
```

**Keterangan standar UML yang dipakai:**

- **Class 3-bagian:** nama (header), atribut bertipe data (`field : Tipe`), metode (`+nama() Tipe`).
- **Visibility:** `-` (private) untuk field karena diakses lewat method, `+` (public) untuk operasi yang dipanggil dari luar.
- **Inheritance** (`<|--`): `Pelanggan` dan `Supir` mewarisi `Pengguna` (peran user).
- **Composition** (`*--`): `Pembayaran` dan `Kwitansi`, `Order` dan `Pembayaran`, `KategoriKendaraan` dan aturan harganya — bagian tidak bisa hidup tanpa whole.
- **Association** (`--`): relasi biasa tanpa kepemilikan kuat (Pelanggan-Order, Kendaraan-Order, dst).
- **Multiplicities:** `1`, `0..1`, `0..*`, dengan label kata kerja (`memesan`, `melunasi`, `mengelompokkan`).

**Keterangan presentasi:**
`Pengguna` adalah akun yang dapat masuk ke sistem dan dipakai sebagai pelaku `CatatanAudit`. `Pelanggan` dan `Supir` adalah spesialisasi `Pengguna` (inheritance). `KategoriKendaraan` mengelompokkan kendaraan dan memiliki `AturanHarga` (tarif per satuan sewa) serta `DendaKeterlambatan` (tarif per jam terlambat) — keduanya komposisi karena mati bersama kategori. `OrderRental` menyimpan transaksi sewa kendaraan, `OrderShuttle` untuk layanan antar-jemput dengan tarif rute. Keduanya memiliki banyak `Pembayaran` secara polimorfik (komposisi karena hidup-mati bersama order). Setiap pembayaran lunas menerbitkan satu `Kwitansi` dan dicatat siapa kasir yang memverifikasi. `PenawaranUpgrade` menangani skenario kendaraan terpilih tidak tersedia sehingga sistem menawarkan kategori lebih tinggi.

---

## 3. Sequence Diagram

Sequence diagram dipecah per skenario supaya tiap slide hanya menjelaskan satu alur komunikasi. Nama partisipan menggunakan istilah modul fungsional, bukan nama kelas teknis, agar mudah diikuti audiens umum.

### 3.1 Sequence - Browse Catalog dan Login

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan
    participant Aplikasi as Aplikasi Web
    participant Auth as Modul Autentikasi
    participant Katalog as Modul Katalog Kendaraan
    participant Basis as Basis Data

    Pelanggan->>Aplikasi: Membuka halaman katalog
    Aplikasi->>Katalog: Meminta daftar kendaraan
    Katalog->>Basis: Mengambil kategori dan kendaraan tersedia
    Basis-->>Katalog: Data katalog
    Katalog-->>Aplikasi: Menyusun tampilan katalog
    Aplikasi-->>Pelanggan: Menampilkan daftar kendaraan

    Pelanggan->>Aplikasi: Memilih kendaraan untuk dipesan
    Aplikasi->>Auth: Memeriksa status sesi pengguna
    alt Belum masuk sistem
        Auth-->>Aplikasi: Mengarahkan ke halaman login
        Pelanggan->>Auth: Mengisi data login
        Auth-->>Aplikasi: Login berhasil dan redirect sesuai peran
    else Sudah masuk sistem
        Auth-->>Aplikasi: Sesi pengguna valid
    end
    Aplikasi-->>Pelanggan: Menampilkan formulir pemesanan
```

**Keterangan presentasi:**
Gunakan diagram ini untuk membuka cerita. Pelanggan tidak langsung membuat order; sistem memastikan data katalog tersedia dan pengguna sudah masuk.

### 3.2 Sequence - Membuat Order Rental

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan
    participant Aplikasi as Aplikasi Web
    participant Pemesanan as Modul Pemesanan Rental
    participant Tarif as Modul Perhitungan Tarif
    participant Penjadwalan as Modul Penjadwalan Supir
    participant Basis as Basis Data

    Pelanggan->>Aplikasi: Mengisi dan mengirim formulir pemesanan
    Aplikasi->>Pemesanan: Meneruskan data pemesanan
    Pemesanan->>Pemesanan: Memvalidasi input dan minimum tiga jam
    Pemesanan->>Tarif: Meminta perhitungan tarif
    Tarif->>Basis: Mengambil aturan tarif yang sesuai
    Basis-->>Tarif: Aturan tarif
    Tarif-->>Pemesanan: Subtotal, biaya tambahan, total

    alt Pelanggan loyal
        Pemesanan->>Penjadwalan: Meminta daftar supir tersedia
        Penjadwalan-->>Pemesanan: Daftar supir
        Pemesanan-->>Aplikasi: Menampilkan opsi pemilihan supir
        Pelanggan->>Aplikasi: Memilih supir
    else Pelanggan baru
        Pemesanan->>Penjadwalan: Meminta penugasan otomatis
        Penjadwalan-->>Pemesanan: Supir terpilih
    end

    Pemesanan->>Basis: Menyimpan order dengan status Menunggu Pembayaran
    Pemesanan->>Basis: Menyimpan tagihan dengan status Belum Lunas
    Pemesanan-->>Aplikasi: Mengarahkan ke halaman detail order
    Aplikasi-->>Pelanggan: Menampilkan opsi pembayaran
```

**Keterangan presentasi:**
Fokuskan pada aturan bisnis: minimum durasi tiga jam, perhitungan tarif otomatis, biaya tambahan luar kota, dan keistimewaan pelanggan loyal yang dapat memilih supir.

### 3.3 Sequence - Pembayaran Transfer

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan
    participant Aplikasi as Aplikasi Web
    participant Pembayaran as Modul Pembayaran
    actor AdminKasir as Admin atau Kasir
    participant Verifikasi as Modul Verifikasi Pembayaran
    participant Kwitansi as Modul Kwitansi
    participant Aktivitas as Modul Pencatatan Aktivitas
    participant Basis as Basis Data

    Pelanggan->>Aplikasi: Mengunggah bukti transfer
    Aplikasi->>Pembayaran: Mengirim file bukti
    Pembayaran->>Pembayaran: Memvalidasi format dan ukuran file
    Pembayaran->>Basis: Menyetel pembayaran ke status Menunggu Verifikasi
    Pembayaran-->>Aplikasi: Menampilkan pesan menunggu verifikasi

    AdminKasir->>Verifikasi: Membuka bukti pembayaran
    alt Bukti valid
        Verifikasi->>Basis: Menyetel pembayaran ke status Lunas
        Verifikasi->>Kwitansi: Meminta pembuatan kwitansi
        Kwitansi->>Basis: Menyimpan nomor kwitansi unik
        Verifikasi->>Basis: Menyetel order ke status Siap Berangkat
        Verifikasi->>Aktivitas: Mencatat aktivitas pembayaran disetujui
        Verifikasi-->>AdminKasir: Persetujuan berhasil
    else Bukti tidak valid
        Verifikasi->>Basis: Menyetel pembayaran ke status Ditolak beserta alasan
        Verifikasi->>Aktivitas: Mencatat aktivitas pembayaran ditolak
        Verifikasi-->>AdminKasir: Penolakan tercatat
        Aplikasi-->>Pelanggan: Pelanggan dapat mengunggah ulang bukti
    end
```

**Keterangan presentasi:**
Diagram ini menunjukkan kenapa status Menunggu Verifikasi diperlukan. Sistem tidak langsung menganggap transfer valid sebelum diperiksa oleh admin atau kasir.

### 3.4 Sequence - Pembayaran Tunai

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan
    actor Kasir
    participant Pembayaran as Modul Pembayaran
    participant Kwitansi as Modul Kwitansi
    participant Aktivitas as Modul Pencatatan Aktivitas
    participant Basis as Basis Data

    Pelanggan->>Kasir: Membayar tunai sesuai total tagihan
    Kasir->>Pembayaran: Mencatat pembayaran tunai
    Pembayaran->>Basis: Memeriksa total tagihan
    Pembayaran->>Basis: Menyetel pembayaran ke status Lunas dengan metode Tunai
    Pembayaran->>Kwitansi: Meminta pembuatan kwitansi
    Kwitansi->>Basis: Menyimpan kwitansi
    Pembayaran->>Basis: Menyetel order ke status Siap Berangkat
    Pembayaran->>Aktivitas: Mencatat aktivitas pembayaran tunai
    Pembayaran-->>Kasir: Pembayaran berhasil
    Kasir-->>Pelanggan: Kwitansi siap dicetak
```

**Keterangan presentasi:**
Alur tunai lebih pendek dibanding transfer karena tidak perlu unggah dan verifikasi bukti. Namun tetap menghasilkan kwitansi dan catatan aktivitas.

### 3.5 Sequence - Dispatch Order

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant StatusOrder as Modul Status Order
    participant Validasi as Modul Validasi Status
    participant Aktivitas as Modul Pencatatan Aktivitas
    participant Basis as Basis Data

    Admin->>StatusOrder: Menekan tombol berangkatkan order
    StatusOrder->>Validasi: Memeriksa kelayakan keberangkatan
    Validasi->>Basis: Mengecek pembayaran lunas dan status Siap Berangkat

    alt Tidak memenuhi syarat
        Validasi-->>StatusOrder: Menolak permintaan
        StatusOrder-->>Admin: Menampilkan pesan kesalahan
    else Memenuhi syarat
        Validasi-->>StatusOrder: Disetujui
        StatusOrder->>Basis: Menyetel order ke status Sedang Berjalan
        StatusOrder->>Basis: Menyetel kendaraan ke status Sedang Digunakan
        StatusOrder->>Basis: Menyetel supir ke status Sedang Bertugas
        StatusOrder->>Aktivitas: Mencatat aktivitas keberangkatan order
        StatusOrder-->>Admin: Keberangkatan berhasil
    end
```

**Keterangan presentasi:**
Tekankan kunci pembayaran. Admin tidak dapat memberangkatkan order yang belum dibayar agar proses operasional tidak berjalan mendahului pembayaran.

### 3.6 Sequence - Pengembalian, Keterlambatan, dan Penyelesaian Order

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant StatusOrder as Modul Status Order
    participant Tarif as Modul Perhitungan Tarif
    participant Aktivitas as Modul Pencatatan Aktivitas
    participant Basis as Basis Data

    Admin->>StatusOrder: Mencatat pengembalian beserta waktu sebenarnya
    StatusOrder->>Basis: Menyimpan waktu pengembalian aktual
    StatusOrder->>Tarif: Meminta perhitungan biaya keterlambatan
    Tarif->>Basis: Mengambil aturan denda berdasarkan kategori
    Tarif-->>StatusOrder: Nilai denda keterlambatan

    alt Terlambat
        StatusOrder->>Basis: Menyetel order ke status Menunggu Pelunasan Keterlambatan
        StatusOrder->>Basis: Membuat tagihan denda dengan status Belum Lunas
        StatusOrder-->>Admin: Pelanggan perlu melunasi denda keterlambatan
    else Tepat waktu
        StatusOrder->>Basis: Menyetel order ke status Selesai
        StatusOrder->>Basis: Mengembalikan kendaraan ke status Tersedia
        StatusOrder->>Basis: Mengembalikan supir ke status Tersedia
        StatusOrder->>Basis: Menambah jumlah order selesai pelanggan
        StatusOrder->>Aktivitas: Mencatat aktivitas penyelesaian order
        StatusOrder-->>Admin: Order selesai
    end
```

**Keterangan presentasi:**
Diagram ini menjelaskan akhir siklus rental. Jika terlambat, sistem membuat tagihan denda. Jika tepat waktu, order selesai dan sumber daya kendaraan serta supir dilepaskan kembali.

---

## 4. Activity Diagram Swimlane

Activity diagram dibuat seperti tabel/kolom agar mirip template swimlane pada gambar referensi. Setiap kolom menunjukkan siapa yang bertanggung jawab atas aktivitas tersebut.

### 4.1 Activity - Rental Booking sampai Order Dibuat

```mermaid
flowchart LR
    classDef lane fill:#ffffff,stroke:#111827,stroke-width:2px
    classDef action fill:#7dd3fc,color:#0f172a,stroke:#0369a1,rx:12
    classDef decision fill:#fde68a,color:#111827,stroke:#b45309,rx:8
    classDef startend fill:#111827,color:#ffffff,stroke:#111827,rx:20

    subgraph PELANGGAN["PELANGGAN"]
        direction TB
        A0((Mulai)):::startend
        A1[Browse katalog]:::action
        A2[Pilih kendaraan]:::action
        A3[Isi formulir pemesanan]:::action
        A4[Pilih metode pembayaran]:::action
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1[Tampilkan kendaraan tersedia]:::action
        B2{Durasi valid?}:::decision
        B3[Hitung tarif dan biaya tambahan]:::action
        B4{Pelanggan loyal?}:::decision
        B5[Tampilkan opsi pemilihan supir]:::action
        B6[Tugaskan supir secara otomatis]:::action
        B7[Buat order dengan status Menunggu Pembayaran]:::action
        B8[Buat tagihan dengan status Belum Lunas]:::action
    end

    subgraph ADMIN_KASIR["ADMIN / KASIR"]
        direction TB
        C1[Belum terlibat]:::action
    end

    subgraph SUPIR["SUPIR"]
        direction TB
        D1[Menunggu penugasan]:::action
    end

    A0 --> A1 --> B1 --> A2 --> A3 --> B2
    B2 -->|Tidak| A3
    B2 -->|Ya| B3 --> B4
    B4 -->|Ya| B5 --> A4
    B4 -->|Tidak| B6 --> A4
    A4 --> B7 --> B8 --> C1
    B6 -.-> D1
```

**Keterangan presentasi:**
Swimlane ini menunjukkan bahwa sampai order dibuat, tanggung jawab utama ada pada pelanggan dan sistem. Admin atau kasir baru terlibat setelah pelanggan memilih metode pembayaran.

### 4.2 Activity - Pembayaran Transfer

```mermaid
flowchart LR
    classDef action fill:#7dd3fc,color:#0f172a,stroke:#0369a1,rx:12
    classDef decision fill:#fde68a,color:#111827,stroke:#b45309,rx:8
    classDef startend fill:#111827,color:#ffffff,stroke:#111827,rx:20

    subgraph PELANGGAN["PELANGGAN"]
        direction TB
        A0((Mulai transfer)):::startend
        A1[Transfer manual ke rekening]:::action
        A2[Unggah bukti transfer]:::action
        A3[Unggah ulang jika ditolak]:::action
        A4[Lihat kwitansi]:::action
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1[Validasi format dan ukuran file bukti]:::action
        B2[Setel pembayaran ke status Menunggu Verifikasi]:::action
        B3[Setel pembayaran ke status Lunas]:::action
        B4[Buat kwitansi]:::action
        B5[Setel order ke status Siap Berangkat]:::action
        B6[Setel pembayaran ke status Ditolak beserta alasan]:::action
    end

    subgraph ADMIN_KASIR["ADMIN / KASIR"]
        direction TB
        C1[Tinjau bukti transfer]:::action
        C2{Bukti valid?}:::decision
    end

    subgraph SUPIR["SUPIR"]
        direction TB
        D1[Belum terlibat]:::action
    end

    A0 --> A1 --> A2 --> B1 --> B2 --> C1 --> C2
    C2 -->|Ya| B3 --> B4 --> B5 --> A4
    C2 -->|Tidak| B6 --> A3 --> A2
    B5 -.-> D1
```

**Keterangan presentasi:**
Diagram ini cocok untuk menjelaskan persetujuan dan penolakan. Jika bukti salah, pelanggan tidak harus membuat order baru; cukup mengunggah ulang bukti pembayaran.

### 4.3 Activity - Pembayaran Tunai

```mermaid
flowchart LR
    classDef action fill:#7dd3fc,color:#0f172a,stroke:#0369a1,rx:12
    classDef startend fill:#111827,color:#ffffff,stroke:#111827,rx:20

    subgraph PELANGGAN["PELANGGAN"]
        direction TB
        A0((Mulai pembayaran tunai)):::startend
        A1[Datang atau konfirmasi ke kasir]:::action
        A2[Terima kwitansi]:::action
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1[Cek total tagihan]:::action
        B2[Setel pembayaran ke status Lunas]:::action
        B3[Buat kwitansi]:::action
        B4[Setel order ke status Siap Berangkat]:::action
        B5[Catat aktivitas pembayaran tunai]:::action
    end

    subgraph KASIR["KASIR"]
        direction TB
        C1[Terima pembayaran tunai]:::action
        C2[Input pembayaran ke sistem]:::action
        C3[Cetak atau arahkan kwitansi]:::action
    end

    subgraph ADMIN_SUPIR["ADMIN / SUPIR"]
        direction TB
        D1[Menunggu order Siap Berangkat]:::action
    end

    A0 --> A1 --> C1 --> C2 --> B1 --> B2 --> B3 --> B4 --> B5 --> C3 --> A2
    B4 -.-> D1
```

**Keterangan presentasi:**
Alur tunai lebih sederhana karena kasir langsung memvalidasi pembayaran. Namun sistem tetap memperbarui status dan menyimpan catatan aktivitas.

### 4.4 Activity - Dispatch, Trip, Pengembalian, dan Keterlambatan

```mermaid
flowchart LR
    classDef action fill:#7dd3fc,color:#0f172a,stroke:#0369a1,rx:12
    classDef decision fill:#fde68a,color:#111827,stroke:#b45309,rx:8
    classDef startend fill:#111827,color:#ffffff,stroke:#111827,rx:20

    subgraph PELANGGAN["PELANGGAN"]
        direction TB
        A1[Menunggu kendaraan atau layanan]:::action
        A2[Menggunakan kendaraan atau layanan]:::action
        A3[Membayar denda jika terlambat]:::action
        A4((Selesai)):::startend
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1{Pembayaran lunas dan order siap berangkat?}:::decision
        B2[Setel order ke status Sedang Berjalan]:::action
        B3[Setel kendaraan Sedang Digunakan dan supir Sedang Bertugas]:::action
        B4[Hitung biaya keterlambatan]:::action
        B5{Terlambat?}:::decision
        B6[Buat tagihan denda keterlambatan]:::action
        B7[Setel order ke status Selesai]:::action
        B8[Lepaskan kendaraan dan supir]:::action
        B9[Tambah jumlah order selesai pelanggan]:::action
    end

    C0((Mulai dispatch)):::startend

    subgraph ADMIN["ADMIN"]
        direction TB
        C1[Tekan tombol berangkatkan order]:::action
        C2[Hubungi supir secara manual]:::action
        C3[Catat waktu pengembalian aktual]:::action
    end

    subgraph SUPIR["SUPIR"]
        direction TB
        D1[Menerima informasi order]:::action
        D2[Mengambil kendaraan]:::action
        D3[Menjalankan perjalanan]:::action
        D4[Mengembalikan kendaraan dan melapor ke admin]:::action
    end

    C0 --> C1
    C1 --> B1
    B1 -->|Tidak| C0
    B1 -->|Ya| B2 --> B3 --> C2 --> D1 --> D2 --> A1 --> A2 --> D3 --> D4 --> C3
    C3 --> B4 --> B5
    B5 -->|Ya| B6 --> A3 --> B7
    B5 -->|Tidak| B7
    B7 --> B8 --> B9 --> A4
```

**Keterangan presentasi:**
Diagram ini menunjukkan proses lintas peran paling lengkap. Admin memberangkatkan, sistem mengunci validasi pembayaran, supir menjalankan perjalanan, pelanggan menerima layanan, lalu admin mencatat pengembalian.

---

## 5. Catatan Presenter

Gunakan catatan ini agar penjelasan diagram tidak terlalu teknis:

- Untuk **use case**, jelaskan aktor dan tujuan, bukan detail kode.
- Untuk **class diagram**, fokus ke relasi utama: `Pelanggan -> OrderRental -> Pembayaran -> Kwitansi`.
- Untuk **sequence diagram**, pilih satu skenario saja per slide dan baca seperti kronologi peristiwa.
- Untuk **activity diagram**, ikuti kolom dari kiri ke kanan seperti proses bisnis lintas bagian.
- Saat ada gap seperti notifikasi supir atau peningkatan otomatis status pelanggan, sampaikan sebagai batasan versi dan rencana pengembangan, bukan kekurangan aplikasi.

---

## 6. Ringkasan Perubahan dari Versi Sebelumnya

- Use case besar dipecah menjadi 4 diagram pendek.
- Sequence end-to-end dipecah menjadi 6 sequence kecil.
- Activity diagram dibuat menjadi swimlane berbasis kolom peran.
- Penamaan partisipan pada sequence diagram diganti dari nama kelas teknis menjadi nama modul fungsional yang mudah dipahami audiens akademis umum.
- Atribut class diagram disederhanakan tanpa tipe data programming agar fokus pada makna data.
- Status order, kendaraan, dan pembayaran ditulis dalam bahasa Indonesia untuk konsistensi.
- Karakter encoding rusak dari versi lama dibersihkan.
