# 🧩 UML Mermaid — Rent Car Platform

> **Version:** 1.2 (LATEST)
> **Last Updated:** 2026-05-12
> **Format:** Mermaid.js

---

## 1. Use Case Diagram

```mermaid
flowchart LR
    classDef actor fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px,rx:20
    classDef usecase fill:#fde68a,color:#000,stroke:#b45309,rx:40

    Customer([Customer Biasa]):::actor
    Loyal([Customer Loyal]):::actor
    Admin([Admin]):::actor
    Kasir([Kasir]):::actor
    Driver([Supir]):::actor

    subgraph System["Rent Car Platform"]
        direction TB
        UC1((Cari Kendaraan)):::usecase
        UC2((Buat Order Rental)):::usecase
        UC3((Pilih Supir Sendiri)):::usecase
        UC4((Upload Bukti Bayar)):::usecase
        UC5((Verifikasi Pembayaran)):::usecase
        UC6((Input Bayar Tunai)):::usecase
        UC7((Kelola Master Data)):::usecase
        UC8((Dispatch Order)):::usecase
        UC9((Selesaikan Order)):::usecase
        UC10((Terima Order Dispatch)):::usecase
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC4

    Loyal -.->|<<extend>>| Customer
    Loyal --> UC3

    Admin --> UC5
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9

    Kasir --> UC5
    Kasir --> UC6

    Driver --> UC10

    UC2 -.->|<<extend loyal>>| UC3
```

**Deskripsi:**
Diagram Use Case ini memetakan interaksi 5 aktor utama (Customer Biasa, Customer Loyal, Admin, Kasir, dan Supir) dengan sistem. Customer Loyal memiliki hak istimewa (use case tambahan) untuk dapat memilih supir sendiri saat membuat order rental. Admin dan Kasir berbagi tugas dalam memverifikasi pembayaran.

---

## 2. Class Diagram

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

**Deskripsi:**
Diagram Class menunjukkan struktur entitas inti (Core Entities) sistem berdasarkan implementasi model di Laravel. `RentalOrder` merupakan pusat transaksi yang mengikat `Customer`, `Vehicle`, dan `Driver`. `RentalOrder` juga dapat memiliki transaksi `Payment` (polymorphic) yang setiap pembayaran suksesnya berelasi 1-to-1 dengan `Receipt`.

---

## 3. Sequence Diagram (Flow Order Rental Kendaraan)

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as Frontend (React/Inertia)
    participant Auth as Auth (Fortify)
    participant DB as Database
    participant OrderCtrl as RentalOrderController
    actor Kasir

    Customer->>UI: Cari kendaraan di Katalog
    UI->>DB: Fetch Vehicle Categories & Vehicles
    DB-->>UI: Return data
    UI-->>Customer: Tampilkan daftar kendaraan

    Customer->>UI: Klik "Pesan / Rent Now"
    UI->>Auth: Check Authentication
    alt Belum Login
        Auth-->>UI: Redirect ke Login
        UI-->>Customer: Tampilkan form Login
        Customer->>Auth: Lakukan Login
        Auth-->>UI: Login sukses
    end

    UI-->>Customer: Tampilkan form Order
    Customer->>UI: Submit (Tanggal, Durasi, dsb.)
    UI->>OrderCtrl: POST /rental-orders
    OrderCtrl->>DB: Cek ketersediaan (isAvailableForPeriod)
    DB-->>OrderCtrl: Kendaraan tersedia
    OrderCtrl->>DB: INSERT RentalOrder (status: PendingPayment)
    OrderCtrl->>DB: INSERT Payment (status: Unpaid)
    OrderCtrl-->>UI: Redirect ke Halaman Pembayaran
    UI-->>Customer: Order Created, minta pembayaran

    alt Bayar Transfer
        Customer->>UI: Upload bukti transfer
        UI->>DB: Update Payment (status: WaitingVerification)
        Kasir->>DB: Review & Approve
        DB-->>Kasir: Payment = Paid, Order = ReadyToDispatch
    else Bayar Tunai
        Customer->>Kasir: Serahkan uang tunai
        Kasir->>DB: Input penerimaan tunai (status: Paid)
        DB-->>Kasir: Order = ReadyToDispatch
    end

    Note over Customer,Kasir: ... (Order berjalan hingga selesai) ...
    Kasir->>DB: Tandai Order Completed
    DB-->>Customer: Order Selesai
```

**Deskripsi:**
Sequence Diagram ini menggambarkan alur dari sisi interaksi sistem. Customer mulai dari pencarian kendaraan, lalu sistem memastikan status autentikasi sebelum memproses pesanan. Saat order terbentuk (Create Order), customer diminta membayar. Proses diakhiri dengan verifikasi oleh Kasir (baik online transfer maupun offline tunai) hingga order dilabeli selesai.

---

## 4. Activity Diagram (Alur Pemesanan & Pembayaran)

```mermaid
flowchart TD
    Start([Start]) --> PilihKendaraan[Pilih Kendaraan di Katalog]
    PilihKendaraan --> IsiForm[Isi Tanggal, Durasi, Layanan]
    IsiForm --> Checkout[Checkout Order]
    Checkout --> OrderDibuat[Sistem Membuat Order & Tagihan]

    OrderDibuat --> PilihanBayar{Pilih Metode Bayar?}

    PilihanBayar -->|Transfer| UploadBukti[Upload Bukti Transfer]
    UploadBukti --> TungguVerif[Tunggu Verifikasi Admin/Kasir]
    TungguVerif --> CekValid{Bukti Valid?}
    CekValid -->|Tidak| UploadBukti
    CekValid -->|Ya| BayarSukses[Pembayaran Berhasil / Order Disetujui]

    PilihanBayar -->|Tunai| BayarDiTempat[Bayar Tunai ke Kasir]
    BayarDiTempat --> InputKasir[Kasir Input ke Sistem]
    InputKasir --> BayarSukses

    BayarSukses --> Dispatch[Kendaraan Disiapkan / Dispatch]
    Dispatch --> Selesai([Selesai])
```

**Deskripsi:**
Activity Diagram di atas merangkum seluruh tahapan alur pengguna (user journey). Alur berjalan dari aktivitas mencari unit yang cocok, melakukan checkout, menyeleksi cabang metode pembayaran dan pelunasannya, berujung pada dispatch kendaraan kepada pelanggan hingga keseluruhan proses sewa selesai.
