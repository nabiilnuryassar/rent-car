# UML Mermaid - Rent Car Platform

> **Version:** 1.3 (Presentation Ready)
> **Last Updated:** 2026-05-12
> **Format:** Mermaid.js
> **Tujuan:** Diagram dibuat pendek per topik agar lebih mudah dipresentasikan.

---

## Cara Membaca Dokumen Ini

Dokumen ini adalah versi Mermaid yang disiapkan untuk presentasi. Diagram besar dari versi sebelumnya dipecah menjadi beberapa bagian kecil supaya presenter tidak perlu menjelaskan terlalu banyak alur dalam satu gambar.

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

Class diagram tetap disatukan karena struktur data inti masih bisa dibaca dalam satu gambar. `RentalOrder` menjadi pusat transaksi rental, sedangkan `Payment` dibuat polymorphic agar bisa dipakai untuk jenis order lain seperti shuttle.

```mermaid
classDiagram
    direction LR

    class User {
        +id: BigInt
        +name: String
        +email: String
        +password: String
    }

    class Customer {
        +id: BigInt
        +user_id: FK
        +phone: String
        +address: String
        +customer_type: CustomerType
        +total_completed_orders: Integer
        +isLoyalCustomer() Boolean
    }

    class Driver {
        +id: BigInt
        +user_id: FK
        +license_number: String
        +phone: String
        +status: DriverStatus
    }

    class VehicleCategory {
        +id: BigInt
        +name: String
        +class_level: Integer
        +is_active: Boolean
    }

    class Vehicle {
        +id: BigInt
        +vehicle_category_id: FK
        +plate_number: String
        +brand: String
        +model: String
        +status: VehicleStatus
        +availableForPeriod(start, end)
    }

    class RentalOrder {
        +id: BigInt
        +order_number: String
        +customer_id: FK
        +vehicle_id: FK
        +driver_id: FK
        +status: OrderStatus
        +total_amount: Decimal
        +start_at: DateTime
        +end_at: DateTime
    }

    class Payment {
        +id: BigInt
        +orderable_id: BigInt
        +orderable_type: String
        +method: PaymentMethod
        +status: PaymentStatus
        +amount: Decimal
        +verified_by: FK
    }

    class Receipt {
        +id: BigInt
        +payment_id: FK
        +receipt_number: String
        +issued_at: DateTime
        +pdf_url: String
    }

    User "1" --> "0..1" Customer
    User "1" --> "0..1" Driver
    VehicleCategory "1" --> "0..*" Vehicle
    Customer "1" --> "0..*" RentalOrder
    Vehicle "1" --> "0..*" RentalOrder
    Driver "1" --> "0..*" RentalOrder
    RentalOrder "1" --> "0..*" Payment : morphMany
    Payment "1" --> "0..1" Receipt
    Payment "0..*" --> "1" User : verified_by
```

**Keterangan presentasi:**
Jelaskan dari kiri ke kanan. `User` adalah akun login. `Customer` dan `Driver` adalah profil sesuai role. `VehicleCategory` mengelompokkan kendaraan. `RentalOrder` menyimpan transaksi rental. `Payment` dan `Receipt` menangani pembayaran dan bukti transaksi.

---

## 3. Sequence Diagram

Sequence diagram dipecah per skenario supaya tiap slide hanya menjelaskan satu alur komunikasi.

### 3.1 Sequence - Browse Catalog dan Login

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as React/Inertia UI
    participant Auth as Fortify Auth
    participant Catalog as CatalogController
    participant DB as Database

    Customer->>UI: Buka halaman catalog
    UI->>Catalog: GET /catalog
    Catalog->>DB: Ambil kategori dan kendaraan available
    DB-->>Catalog: Data catalog
    Catalog-->>UI: Render catalog
    UI-->>Customer: Tampilkan kendaraan

    Customer->>UI: Klik kendaraan / booking
    UI->>Auth: Cek session login
    alt Belum login
        Auth-->>UI: Redirect ke /login
        Customer->>Auth: Login
        Auth-->>UI: Login sukses dan role redirect
    else Sudah login
        Auth-->>UI: Session valid
    end
    UI-->>Customer: Tampilkan form booking
```

**Keterangan presentasi:**
Gunakan diagram ini untuk membuka cerita. Customer tidak langsung membuat order; sistem memastikan data catalog tersedia dan user sudah login.

### 3.2 Sequence - Create Rental Order

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as React/Inertia UI
    participant Ctrl as RentalOrderController
    participant Pricing as RentalPricingService
    participant DriverSvc as DriverAssignmentService
    participant DB as Database

    Customer->>UI: Submit booking form
    UI->>Ctrl: POST /customer/rental-orders
    Ctrl->>Ctrl: Validasi input dan minimum 3 jam
    Ctrl->>Pricing: calculateQuote(vehicle, unit, duration, out_of_town)
    Pricing->>DB: Cari PricingRule yang cocok
    DB-->>Pricing: PricingRule
    Pricing-->>Ctrl: Quote subtotal, surcharge, total

    alt Customer loyal
        Ctrl->>DriverSvc: getAvailableDrivers(schedule)
        DriverSvc-->>Ctrl: Daftar driver available
        Ctrl-->>UI: Tampilkan opsi pilih driver
        Customer->>UI: Pilih driver
    else Customer baru
        Ctrl->>DriverSvc: assign(schedule)
        DriverSvc-->>Ctrl: Driver otomatis
    end

    Ctrl->>DB: Create RentalOrder status pending_payment
    Ctrl->>DB: Create Payment status unpaid
    Ctrl-->>UI: Redirect ke detail order
    UI-->>Customer: Tampilkan opsi pembayaran
```

**Keterangan presentasi:**
Fokuskan pada business rules: minimum tiga jam, pricing rule, surcharge luar kota, dan customer loyal yang bisa memilih driver.

### 3.3 Sequence - Pembayaran Transfer

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as React/Inertia UI
    participant PayCtrl as PaymentController
    actor AdminKasir as Admin atau Kasir
    participant VerifyCtrl as PaymentVerificationController
    participant Receipt as ReceiptService
    participant Audit as AuditLogger
    participant DB as Database

    Customer->>UI: Upload bukti transfer
    UI->>PayCtrl: POST upload proof
    PayCtrl->>PayCtrl: Validasi JPG/PNG/PDF <= 5 MB
    PayCtrl->>DB: Payment status waiting_verification
    PayCtrl-->>UI: Menunggu verifikasi

    AdminKasir->>VerifyCtrl: Review bukti pembayaran
    alt Bukti valid
        VerifyCtrl->>DB: Payment status paid
        VerifyCtrl->>Receipt: generateForPayment(payment)
        Receipt->>DB: Create receipt number unique
        VerifyCtrl->>DB: Order status ready_to_dispatch
        VerifyCtrl->>Audit: log payment_approved
        VerifyCtrl-->>AdminKasir: Approve sukses
    else Bukti tidak valid
        VerifyCtrl->>DB: Payment status rejected dan alasan
        VerifyCtrl->>Audit: log payment_rejected
        VerifyCtrl-->>AdminKasir: Reject sukses
        UI-->>Customer: Customer dapat upload ulang
    end
```

**Keterangan presentasi:**
Diagram ini menunjukkan kenapa status `waiting_verification` diperlukan. Sistem tidak langsung menganggap transfer valid sebelum dicek admin atau kasir.

### 3.4 Sequence - Pembayaran Tunai

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Kasir
    participant PayCtrl as PaymentController
    participant Receipt as ReceiptService
    participant Audit as AuditLogger
    participant DB as Database

    Customer->>Kasir: Bayar tunai sesuai total order
    Kasir->>PayCtrl: POST /payments/{id}/cash
    PayCtrl->>DB: Cek payment dan total tagihan
    PayCtrl->>DB: Payment status paid, method cash
    PayCtrl->>Receipt: generateForPayment(payment)
    Receipt->>DB: Create receipt
    PayCtrl->>DB: Order status ready_to_dispatch
    PayCtrl->>Audit: log cash_recorded
    PayCtrl-->>Kasir: Pembayaran berhasil
    Kasir-->>Customer: Receipt dapat dicetak
```

**Keterangan presentasi:**
Cash flow lebih pendek daripada transfer karena tidak perlu upload dan verifikasi bukti. Namun tetap menghasilkan receipt dan audit log.

### 3.5 Sequence - Dispatch Order

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant LifeCtrl as OrderLifecycleController
    participant StatusSvc as OrderStatusService
    participant Audit as AuditLogger
    participant DB as Database

    Admin->>LifeCtrl: POST /admin/orders/{id}/dispatch
    LifeCtrl->>StatusSvc: assertCanDispatch(order)
    StatusSvc->>DB: Cek payment paid dan order ready_to_dispatch

    alt Tidak memenuhi syarat
        StatusSvc-->>LifeCtrl: ValidationException
        LifeCtrl-->>Admin: Tampilkan error
    else Valid
        StatusSvc-->>LifeCtrl: OK
        LifeCtrl->>DB: Order status ongoing
        LifeCtrl->>DB: Vehicle status in_use
        LifeCtrl->>DB: Driver status on_duty
        LifeCtrl->>Audit: log order_dispatched
        LifeCtrl-->>Admin: Dispatch berhasil
    end
```

**Keterangan presentasi:**
Tekankan payment lock. Admin tidak bisa dispatch order yang belum dibayar agar proses operasional tidak berjalan mendahului pembayaran.

### 3.6 Sequence - Return, Overtime, dan Complete Order

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant LifeCtrl as OrderLifecycleController
    participant Pricing as RentalPricingService
    participant Audit as AuditLogger
    participant DB as Database

    Admin->>LifeCtrl: POST return dengan actual_return_at
    LifeCtrl->>DB: Simpan actual_return_at
    LifeCtrl->>Pricing: calculateOvertime(order)
    Pricing->>DB: Ambil OvertimePenalty berdasarkan kategori
    Pricing-->>LifeCtrl: overtime charge

    alt Terlambat
        LifeCtrl->>DB: Order status waiting_overtime_payment
        LifeCtrl->>DB: Create Payment overtime status unpaid
        LifeCtrl-->>Admin: Customer perlu bayar overtime
    else Tepat waktu
        LifeCtrl->>DB: Order status completed
        LifeCtrl->>DB: Vehicle status available
        LifeCtrl->>DB: Driver status available
        LifeCtrl->>DB: Increment total_completed_orders
        LifeCtrl->>Audit: log order_completed
        LifeCtrl-->>Admin: Order selesai
    end
```

**Keterangan presentasi:**
Diagram ini menjelaskan akhir siklus rental. Jika terlambat, sistem membuat tagihan overtime. Jika tepat waktu, order selesai dan resource dilepas.

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
        A1[Browse catalog]:::action
        A2[Pilih kendaraan]:::action
        A3[Isi form booking]:::action
        A4[Pilih metode pembayaran]:::action
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1[Tampilkan kendaraan available]:::action
        B2{Durasi valid?}:::decision
        B3[Hitung tarif dan surcharge]:::action
        B4{Customer loyal?}:::decision
        B5[Tampilkan pilihan driver]:::action
        B6[Auto assign driver]:::action
        B7[Buat RentalOrder pending_payment]:::action
        B8[Buat Payment unpaid]:::action
    end

    subgraph ADMIN_KASIR["ADMIN / KASIR"]
        direction TB
        C1[Belum terlibat]:::action
    end

    subgraph SUPIR["SUPIR"]
        direction TB
        D1[Menunggu assignment]:::action
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
Swimlane ini menunjukkan bahwa sampai order dibuat, tanggung jawab utama ada pada pelanggan dan sistem. Admin/kasir baru masuk setelah pembayaran dipilih.

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
        A2[Upload bukti transfer]:::action
        A3[Upload ulang jika ditolak]:::action
        A4[Lihat receipt]:::action
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1[Validasi file JPG/PNG/PDF <= 5 MB]:::action
        B2[Set payment waiting_verification]:::action
        B3[Set payment paid]:::action
        B4[Generate receipt]:::action
        B5[Set order ready_to_dispatch]:::action
        B6[Set payment rejected dan simpan alasan]:::action
    end

    subgraph ADMIN_KASIR["ADMIN / KASIR"]
        direction TB
        C1[Review bukti transfer]:::action
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
Diagram ini cocok untuk menjelaskan approve/reject. Jika bukti salah, customer tidak harus membuat order baru; cukup upload ulang bukti.

### 4.3 Activity - Pembayaran Tunai

```mermaid
flowchart LR
    classDef action fill:#7dd3fc,color:#0f172a,stroke:#0369a1,rx:12
    classDef startend fill:#111827,color:#ffffff,stroke:#111827,rx:20

    subgraph PELANGGAN["PELANGGAN"]
        direction TB
        A0((Mulai cash)):::startend
        A1[Datang / konfirmasi ke kasir]:::action
        A2[Terima receipt]:::action
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1[Cek total tagihan]:::action
        B2[Set payment paid]:::action
        B3[Generate receipt]:::action
        B4[Set order ready_to_dispatch]:::action
        B5[Catat audit log cash_recorded]:::action
    end

    subgraph KASIR["KASIR"]
        direction TB
        C1[Terima pembayaran tunai]:::action
        C2[Input pembayaran ke sistem]:::action
        C3[Cetak / arahkan receipt]:::action
    end

    subgraph ADMIN_SUPIR["ADMIN / SUPIR"]
        direction TB
        D1[Menunggu order ready_to_dispatch]:::action
    end

    A0 --> A1 --> C1 --> C2 --> B1 --> B2 --> B3 --> B4 --> B5 --> C3 --> A2
    B4 -.-> D1
```

**Keterangan presentasi:**
Flow cash lebih sederhana karena kasir langsung memvalidasi pembayaran. Namun sistem tetap mengubah status dan membuat audit log.

### 4.4 Activity - Dispatch, Trip, Return, dan Overtime

```mermaid
flowchart LR
    classDef action fill:#7dd3fc,color:#0f172a,stroke:#0369a1,rx:12
    classDef decision fill:#fde68a,color:#111827,stroke:#b45309,rx:8
    classDef startend fill:#111827,color:#ffffff,stroke:#111827,rx:20

    subgraph PELANGGAN["PELANGGAN"]
        direction TB
        A1[Menunggu kendaraan / layanan]:::action
        A2[Gunakan kendaraan / layanan]:::action
        A3[Bayar overtime jika terlambat]:::action
        A4((Selesai)):::startend
    end

    subgraph SISTEM["SISTEM"]
        direction TB
        B1{Payment paid dan ready_to_dispatch?}:::decision
        B2[Set order ongoing]:::action
        B3[Set vehicle in_use dan driver on_duty]:::action
        B4[Hitung overtime]:::action
        B5{Terlambat?}:::decision
        B6[Create payment overtime]:::action
        B7[Set order completed]:::action
        B8[Release vehicle dan driver]:::action
        B9[Increment loyal counter]:::action
    end

    subgraph ADMIN["ADMIN"]
        direction TB
        C0((Mulai dispatch)):::startend
        C1[Klik dispatch order]:::action
        C2[Hubungi supir manual]:::action
        C3[Catat actual return]:::action
    end

    subgraph SUPIR["SUPIR"]
        direction TB
        D1[Terima info order]:::action
        D2[Ambil kendaraan]:::action
        D3[Jalankan trip]:::action
        D4[Kembalikan kendaraan / lapor admin]:::action
    end

    C0 --> C1 --> B1
    B1 -->|Tidak| C1
    B1 -->|Ya| B2 --> B3 --> C2 --> D1 --> D2 --> A1 --> A2 --> D3 --> D4 --> C3
    C3 --> B4 --> B5
    B5 -->|Ya| B6 --> A3 --> B7
    B5 -->|Tidak| B7
    B7 --> B8 --> B9 --> A4
```

**Keterangan presentasi:**
Diagram ini menunjukkan proses lintas role paling lengkap. Admin dispatch, sistem mengunci validasi pembayaran, supir menjalankan trip, pelanggan menerima layanan, lalu admin mencatat return.

---

## 5. Catatan Presenter

Gunakan catatan ini agar penjelasan diagram tidak terlalu teknis:

- Untuk **use case**, jelaskan aktor dan tujuan, bukan detail kode.
- Untuk **class diagram**, fokus ke relasi utama: `Customer -> RentalOrder -> Payment -> Receipt`.
- Untuk **sequence diagram**, pilih satu skenario saja per slide.
- Untuk **activity diagram**, ikuti kolom dari kiri ke kanan seperti proses bisnis lintas bagian.
- Saat ada gap seperti notifikasi supir atau auto upgrade, sampaikan sebagai batasan versi dan roadmap, bukan error aplikasi.

---

## 6. Ringkasan Perubahan dari Versi Sebelumnya

- Use case besar dipecah menjadi 4 diagram pendek.
- Sequence end-to-end dipecah menjadi 6 sequence kecil.
- Activity diagram dibuat menjadi swimlane berbasis kolom role.
- Teks keterangan diperjelas untuk kebutuhan presentasi mahasiswa.
- Karakter encoding rusak dari versi lama dibersihkan.
