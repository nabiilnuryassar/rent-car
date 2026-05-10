# 🧩 UML Mermaid — Rent Car Platform (Full Documentation)

> **Version:** 1.1 (As-built + Study Case aligned)
> **Last Updated:** 2026-05-09
> **Format:** Mermaid.js (renderable di GitHub/GitLab/VS Code/Notion)
> **Source:** `docs/STUDY_CASE.md` + actual implementation

---

## 📑 Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram](#2-class-diagram)
3. [Entity Relationship Diagram (ERD)](#3-entity-relationship-diagram-erd)
4. [State Diagram — Order Lifecycle](#4-state-diagram--order-lifecycle)
5. [State Diagram — Payment Status](#5-state-diagram--payment-status)
6. [Activity Diagram — Booking Flow End-to-End](#6-activity-diagram--booking-flow-end-to-end)
7. [Activity Diagram — Payment Flow](#7-activity-diagram--payment-flow)
8. [Activity Diagram — Dispatch & Return](#8-activity-diagram--dispatch--return)
9. [Sequence Diagram — Customer Booking](#9-sequence-diagram--customer-booking)
10. [Sequence Diagram — Transfer Verification](#10-sequence-diagram--transfer-verification)
11. [Sequence Diagram — Free Upgrade Flow](#11-sequence-diagram--free-upgrade-flow)
12. [Component Architecture](#12-component-architecture)
13. [Deployment Diagram](#13-deployment-diagram)

---

## 1. Use Case Diagram

Mapping aktor ke use case sesuai Study Case §3 + §4.

```mermaid
flowchart LR
    classDef actor fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px,rx:20
    classDef usecase fill:#fde68a,color:#000,stroke:#b45309,rx:40
    classDef system fill:#f0f9ff,stroke:#0284c7,stroke-dasharray: 5 5

    Customer([Pelanggan]):::actor
    Loyal([Pelanggan Lama]):::actor
    Admin([Admin]):::actor
    Kasir([Kasir]):::actor
    Driver([Supir]):::actor

    subgraph System["Rent Car Platform"]
        direction TB
        UC01((Registrasi / Login)):::usecase
        UC02((Browse Catalog)):::usecase
        UC03((Buat Order Rental)):::usecase
        UC04((Pilih Unit, Durasi,\nWilayah, Lokasi)):::usecase
        UC05((Hitung Tarif Otomatis)):::usecase
        UC06((Pilih Supir Sendiri)):::usecase
        UC07((Accept/Reject Upgrade Offer)):::usecase
        UC08((Order Antar-Jemput)):::usecase
        UC09((Upload Bukti Transfer)):::usecase
        UC10((Input Pembayaran Tunai)):::usecase
        UC11((Verifikasi Transfer)):::usecase
        UC12((Generate Kwitansi)):::usecase
        UC13((Kelola Vehicle & Category)):::usecase
        UC14((Kelola Pricing & Overtime)):::usecase
        UC15((Kelola Data Supir)):::usecase
        UC16((Dispatch Order)):::usecase
        UC17((Record Return & Overtime)):::usecase
        UC18((Complete Order)):::usecase
        UC19((Kelola Shuttle Tariff)):::usecase
        UC20((Cancel Order)):::usecase
        UC21((Dashboard Operasional)):::usecase
        UC22((Laporan Transaksi & Revenue)):::usecase
        UC23((Notifikasi Assigned/Dispatched)):::usecase
    end

    Customer --> UC01
    Customer --> UC02
    Customer --> UC03
    Customer --> UC08
    Customer --> UC09
    Customer --> UC07
    Customer --> UC20

    Loyal -.->|<<extend>>| Customer
    Loyal --> UC06

    Admin --> UC11
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22

    Kasir --> UC10
    Kasir --> UC11

    Driver --> UC23

    UC03 -.->|<<include>>| UC04
    UC03 -.->|<<include>>| UC05
    UC03 -.->|<<extend stock empty>>| UC07
    UC03 -.->|<<extend loyal>>| UC06
    UC08 -.->|<<include>>| UC05
    UC09 -.->|<<include>>| UC11
    UC10 -.->|<<include>>| UC12
    UC11 -.->|<<include>>| UC12
    UC17 -.->|<<include>>| UC18
    UC16 -.->|<<trigger>>| UC23
```

---

## 2. Class Diagram

Struktur domain (composition + Spatie roles pattern).

```mermaid
classDiagram
    direction LR

    class User {
        +id: BigInt
        +name: String
        +email: String
        +password: String
        +hasRole(role) Boolean
        +notify(notification) void
    }

    class Customer {
        +id: BigInt
        +user_id: FK
        +phone: String
        +address: String
        +customer_type: CustomerType
        +total_completed_orders: Integer
        +isLoyalCustomer() Boolean
        +rentalOrders() HasMany
        +shuttleOrders() HasMany
    }

    class Driver {
        +id: BigInt
        +user_id: FK
        +license_number: String
        +phone: String
        +status: DriverStatus
        +rentalOrders() HasMany
    }

    class VehicleCategory {
        +id: BigInt
        +name: String
        +class_level: Integer
        +description: String
        +is_active: Boolean
        +vehicles() HasMany
        +pricingRules() HasMany
        +overtimePenalty() HasOne
    }

    class Vehicle {
        +id: BigInt
        +vehicle_category_id: FK
        +plate_number: String
        +brand: String
        +model: String
        +year: Integer
        +status: VehicleStatus
        +current_location: String
        +rentalOrders() HasMany
        +availableForPeriod(start, end)$ Scope
        +isAvailableForPeriod(start, end) Boolean
    }

    class PricingRule {
        +id: BigInt
        +vehicle_category_id: FK
        +rental_unit: RentalUnit
        +min_duration: Integer
        +max_duration: Integer
        +base_rate: Decimal
        +discount_rate: Decimal
        +out_of_town_surcharge_rate: Decimal
    }

    class OvertimePenalty {
        +id: BigInt
        +vehicle_category_id: FK
        +hourly_rate: Decimal
    }

    class ShuttleTariff {
        +id: BigInt
        +area_from: String
        +area_to: String
        +estimated_distance_km: Decimal
        +estimated_duration_minutes: Integer
        +tariff: Decimal
    }

    class RentalOrder {
        +id: BigInt
        +order_number: String
        +customer_id: FK
        +vehicle_id: FK
        +driver_id: FK
        +status: OrderStatus
        +rental_unit: RentalUnit
        +duration: Integer
        +start_at: DateTime
        +end_at: DateTime
        +actual_return_at: DateTime
        +is_out_of_town: Boolean
        +pickup_option: PickupOption
        +delivery_address: String
        +total_amount: Decimal
        +payments() MorphMany
        +upgradeOffer() HasOne
    }

    class ShuttleOrder {
        +id: BigInt
        +order_number: String
        +customer_id: FK
        +shuttle_tariff_id: FK
        +status: OrderStatus
        +pickup_address: String
        +destination_address: String
        +scheduled_at: DateTime
        +total_amount: Decimal
        +payments() MorphMany
    }

    class UpgradeOffer {
        +id: BigInt
        +rental_order_id: FK
        +original_vehicle_category_id: FK
        +upgraded_vehicle_id: FK
        +status: OfferStatus
    }

    class Payment {
        +id: BigInt
        +orderable_type: String
        +orderable_id: BigInt
        +method: PaymentMethod
        +status: PaymentStatus
        +amount: Decimal
        +paid_at: DateTime
        +transfer_proof_url: String
        +verified_at: DateTime
        +verified_by: FK
        +receipt() HasOne
        +orderable() MorphTo
    }

    class Receipt {
        +id: BigInt
        +payment_id: FK
        +receipt_number: String
        +issued_at: DateTime
        +pdf_url: String
    }

    class AuditLog {
        +id: BigInt
        +user_id: FK
        +action: String
        +subject_type: String
        +subject_id: BigInt
        +metadata: JSON
    }

    User "1" --> "0..1" Customer : profile
    User "1" --> "0..1" Driver : profile
    User "1" --> "0..*" AuditLog : performs

    Customer "1" --> "0..*" RentalOrder : creates
    Customer "1" --> "0..*" ShuttleOrder : creates
    Driver "1" --> "0..*" RentalOrder : serves

    VehicleCategory "1" --> "0..*" Vehicle
    VehicleCategory "1" --> "0..*" PricingRule
    VehicleCategory "1" --> "1" OvertimePenalty

    RentalOrder "1" --> "1" Vehicle
    RentalOrder "1" --> "1" Driver
    RentalOrder "0..1" --> "0..1" UpgradeOffer

    ShuttleOrder "1" --> "1" ShuttleTariff

    RentalOrder "1" --> "0..*" Payment : morphMany
    ShuttleOrder "1" --> "0..*" Payment : morphMany

    Payment "1" --> "0..1" Receipt
    Payment "0..*" --> "1" User : verified_by
```

---

## 3. Entity Relationship Diagram (ERD)

Skema database dengan cardinality lengkap.

```mermaid
erDiagram
    USERS ||--o| CUSTOMERS : has_profile
    USERS ||--o| DRIVERS : has_profile
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ MODEL_HAS_ROLES : assigned

    CUSTOMERS ||--o{ RENTAL_ORDERS : books
    CUSTOMERS ||--o{ SHUTTLE_ORDERS : books

    VEHICLE_CATEGORIES ||--o{ VEHICLES : classifies
    VEHICLE_CATEGORIES ||--o{ PRICING_RULES : prices
    VEHICLE_CATEGORIES ||--|| OVERTIME_PENALTIES : late_fee

    VEHICLES ||--o{ RENTAL_ORDERS : used_in

    DRIVERS ||--o{ RENTAL_ORDERS : assigned_to

    RENTAL_ORDERS ||--o| UPGRADE_OFFERS : may_have
    RENTAL_ORDERS ||--o{ PAYMENTS : paid_by
    SHUTTLE_ORDERS ||--o{ PAYMENTS : paid_by
    SHUTTLE_TARIFFS ||--o{ SHUTTLE_ORDERS : tariff_for

    PAYMENTS ||--o| RECEIPTS : issues
    PAYMENTS }o--|| USERS : verified_by

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        timestamp email_verified_at
        timestamps
    }

    CUSTOMERS {
        bigint id PK
        bigint user_id FK
        string phone
        string address
        enum customer_type "new|loyal|corporate"
        int total_completed_orders
    }

    DRIVERS {
        bigint id PK
        bigint user_id FK
        string license_number
        string phone
        enum status "available|reserved|on_duty|off_duty|inactive"
    }

    VEHICLE_CATEGORIES {
        bigint id PK
        string name
        int class_level
        text description
        bool is_active
    }

    VEHICLES {
        bigint id PK
        bigint vehicle_category_id FK
        string plate_number UK
        string brand
        string model
        int year
        enum status "available|reserved|in_use|maintenance|inactive"
        string current_location
    }

    PRICING_RULES {
        bigint id PK
        bigint vehicle_category_id FK
        enum rental_unit "hour|day|week|month"
        int min_duration
        int max_duration
        decimal base_rate
        decimal discount_rate
        decimal out_of_town_surcharge_rate "default 0.20"
    }

    OVERTIME_PENALTIES {
        bigint id PK
        bigint vehicle_category_id FK
        decimal hourly_rate
    }

    SHUTTLE_TARIFFS {
        bigint id PK
        string area_from
        string area_to
        decimal estimated_distance_km
        int estimated_duration_minutes
        decimal tariff
    }

    RENTAL_ORDERS {
        bigint id PK
        string order_number UK
        bigint customer_id FK
        bigint vehicle_id FK
        bigint driver_id FK
        enum status "draft|pending_payment|waiting_verification|paid|ready_to_dispatch|ongoing|waiting_overtime_payment|completed|cancelled"
        enum rental_unit
        int duration
        datetime start_at
        datetime end_at
        datetime actual_return_at
        bool is_out_of_town
        enum pickup_option
        string delivery_address
        decimal total_amount
    }

    SHUTTLE_ORDERS {
        bigint id PK
        string order_number UK
        bigint customer_id FK
        bigint shuttle_tariff_id FK
        enum status
        string pickup_address
        string destination_address
        datetime scheduled_at
        decimal total_amount
    }

    UPGRADE_OFFERS {
        bigint id PK
        bigint rental_order_id FK
        bigint original_vehicle_category_id FK
        bigint upgraded_vehicle_id FK
        enum status "pending|accepted|rejected"
    }

    PAYMENTS {
        bigint id PK
        string orderable_type "polymorphic"
        bigint orderable_id
        enum method "cash|bank_transfer"
        enum status "unpaid|waiting_verification|paid|rejected|refunded"
        decimal amount
        datetime paid_at
        string transfer_proof_url
        datetime verified_at
        bigint verified_by FK
    }

    RECEIPTS {
        bigint id PK
        bigint payment_id FK
        string receipt_number UK
        datetime issued_at
        string pdf_url
    }

    AUDIT_LOGS {
        bigint id PK
        bigint user_id FK
        string action
        string subject_type
        bigint subject_id
        json metadata
        datetime created_at
    }

    MODEL_HAS_ROLES {
        string model_type
        bigint model_id
        bigint role_id FK
    }
```

---

## 4. State Diagram — Order Lifecycle

State machine untuk RentalOrder status transitions.

```mermaid
stateDiagram-v2
    [*] --> Draft : upgrade offer pending
    [*] --> PendingPayment : normal flow

    Draft --> PendingPayment : accept upgrade
    Draft --> Cancelled : reject upgrade

    PendingPayment --> WaitingVerification : upload proof (transfer)
    PendingPayment --> Paid : cash input by kasir
    PendingPayment --> Cancelled : customer/admin cancel

    WaitingVerification --> Paid : admin approve
    WaitingVerification --> PendingPayment : admin reject (re-upload)
    WaitingVerification --> Cancelled : customer/admin cancel

    Paid --> ReadyToDispatch : receipt generated
    Paid --> Cancelled : admin cancel (refund)

    ReadyToDispatch --> Ongoing : admin dispatch\n(payment lock OK)
    ReadyToDispatch --> Cancelled : admin cancel

    Ongoing --> WaitingOvertimePayment : record return LATE
    Ongoing --> Completed : record return ON-TIME
    Ongoing --> Cancelled : admin force cancel

    WaitingOvertimePayment --> Paid : overtime paid
    WaitingOvertimePayment --> Cancelled : admin cancel

    Completed --> [*]
    Cancelled --> [*]

    note right of ReadyToDispatch
        Guard: OrderStatusService
        ::assertCanDispatch()
        Requires Payment.status = Paid
    end note

    note right of Ongoing
        Side effects on dispatch:
        Vehicle.status = in_use
        Driver.status = on_duty
        + OrderDispatched notification
    end note

    note left of Completed
        Side effects on complete:
        Vehicle.status = available
        Driver.status = available
        Customer.total_completed_orders++
    end note
```

---

## 5. State Diagram — Payment Status

```mermaid
stateDiagram-v2
    [*] --> Unpaid

    Unpaid --> Paid : recordCash (kasir)
    Unpaid --> WaitingVerification : uploadProof (customer)
    Unpaid --> Cancelled : order cancelled

    WaitingVerification --> Paid : admin approve
    WaitingVerification --> Rejected : admin reject

    Rejected --> WaitingVerification : customer re-upload

    Paid --> Refunded : admin refund (manual)

    Paid --> [*]
    Refunded --> [*]
    Cancelled --> [*]

    note right of Paid
        Triggers:
        - Receipt.create()
        - Order.status = ready_to_dispatch
        - AuditLog (approved/cash_recorded)
    end note
```

---

## 6. Activity Diagram — Booking Flow End-to-End

Covers Study Case §4 "Pemesanan" flow.

```mermaid
flowchart TD
    Start([Customer Start]) --> Login{Logged in?}
    Login -->|No| DoLogin[Register / Login via Fortify]
    DoLogin --> Catalog
    Login -->|Yes| Catalog[Browse Catalog /catalog]

    Catalog --> SelectService{Jenis Layanan?}

    SelectService -->|Rental| RentalForm[Isi Form Rental]
    SelectService -->|Shuttle| ShuttleForm[Isi Form Shuttle]

    RentalForm --> Inputs[/"Input:<br/>- vehicle_id<br/>- rental_unit<br/>- duration<br/>- start_at<br/>- pickup_option<br/>- is_out_of_town<br/>- delivery_address?<br/>- driver_id? (loyal only)"/]
    Inputs --> ValidMin3{Hour & duration<3?}
    ValidMin3 -->|Yes| RejectMin3[[Error:<br/>Min 3 jam]]
    ValidMin3 -->|No| CalcQuote[RentalPricingService<br/>::calculateQuote]

    CalcQuote --> AvailCheck{Vehicle<br/>availableForPeriod?}
    AvailCheck -->|No| FindUpgrade[VehicleUpgradeService<br/>::findUpgradeForPeriod]
    FindUpgrade --> UpgradeFound{Upgrade found?}
    UpgradeFound -->|No| RejectBooked[[Error:<br/>Booked & no upgrade]]
    UpgradeFound -->|Yes| DraftOrder[Create Order<br/>status=Draft<br/>+ UpgradeOffer Pending]
    DraftOrder --> ShowOffer[Show upgrade offer<br/>to customer]
    ShowOffer --> CustomerDecision{Customer<br/>decision?}
    CustomerDecision -->|Reject| CancelDraft[Order → Cancelled]
    CustomerDecision -->|Accept| AcceptUpgrade[Order → PendingPayment<br/>+ Payment created<br/>+ Driver notified]

    AvailCheck -->|Yes| AssignDriver{Loyal<br/>customer?}
    AssignDriver -->|Yes| PickDriver[Customer picks driver<br/>from available list]
    AssignDriver -->|No| AutoDriver[DriverAssignmentService<br/>auto-pick]
    PickDriver --> CreateOrder
    AutoDriver --> CreateOrder[Create RentalOrder<br/>status=PendingPayment]
    CreateOrder --> CreatePayment[Create Payment<br/>status=Unpaid]
    CreatePayment --> NotifyDriver[Notify Driver:<br/>DriverAssignedToOrder]
    NotifyDriver --> Payment

    AcceptUpgrade --> Payment

    ShuttleForm --> ShuttleInputs[/"Input:<br/>- pickup_address<br/>- destination_address<br/>- scheduled_at"/]
    ShuttleInputs --> MatchTariff[Match ShuttleTariff<br/>by area_from/area_to]
    MatchTariff --> ShuttlePrice[ShuttlePricingService<br/>::calculateQuote]
    ShuttlePrice --> CreateShuttle[Create ShuttleOrder<br/>status=PendingPayment<br/>+ Payment Unpaid]
    CreateShuttle --> Payment

    Payment[Go to Payment Flow] --> PaymentFlow>See §7 Payment Flow]
    PaymentFlow --> Dispatch>See §8 Dispatch & Return]
    Dispatch --> End([Order Completed])

    RejectMin3 --> End
    RejectBooked --> End
    CancelDraft --> End
```

---

## 7. Activity Diagram — Payment Flow

Covers Study Case §2 "Smart Invoicing" requirements.

```mermaid
flowchart TD
    Start([Payment Created<br/>status=Unpaid]) --> Method{Method?}

    Method -->|Cash| CashFlow[Customer pays cash<br/>at kasir/admin]
    Method -->|Transfer| TransferFlow[Customer transfers<br/>to bank account]

    CashFlow --> RecordCash[POST /payments/{id}/cash<br/>by kasir/admin]
    RecordCash --> CashAuth{Role =<br/>kasir/admin?}
    CashAuth -->|No| Reject403[[403 Forbidden]]
    CashAuth -->|Yes| CashDB[/"Update Payment:<br/>status=Paid<br/>method=cash<br/>paid_at=now()"/]
    CashDB --> GenReceiptCash[ReceiptService<br/>::generateForPayment]
    GenReceiptCash --> OrderReadyCash[Order.status<br/>=ReadyToDispatch]
    OrderReadyCash --> AuditCash[AuditLog:<br/>cash_recorded]
    AuditCash --> Done([Ready for Dispatch])

    TransferFlow --> UploadProof[Customer uploads<br/>JPG/PNG/PDF ≤ 5MB]
    UploadProof --> ValidateFile{File valid?}
    ValidateFile -->|No| RejectFile[[Validation error]]
    ValidateFile -->|Yes| ProofDB[/"Update Payment:<br/>status=WaitingVerification<br/>transfer_proof_url=..."/]
    ProofDB --> AdminReview[Admin reviews<br/>at /admin/payments/verification]

    AdminReview --> AdminDecision{Approve or<br/>Reject?}

    AdminDecision -->|Approve| ApproveDB[/"Update Payment:<br/>status=Paid<br/>verified_by=user<br/>verified_at=now()"/]
    ApproveDB --> GenReceiptT[ReceiptService<br/>::generateForPayment]
    GenReceiptT --> OrderReadyT[Order.status<br/>=ReadyToDispatch]
    OrderReadyT --> AuditApprove[AuditLog:<br/>payment_approved]
    AuditApprove --> Done

    AdminDecision -->|Reject| RejectDB[/"Update Payment:<br/>status=Rejected<br/>rejected_reason=..."/]
    RejectDB --> AuditReject[AuditLog:<br/>payment_rejected]
    AuditReject --> ReUpload[Customer can<br/>re-upload proof]
    ReUpload --> UploadProof

    Reject403 --> EndErr([End])
    RejectFile --> EndErr
```

---

## 8. Activity Diagram — Dispatch & Return

Covers Study Case §4 "Pengiriman" and "Pengembalian".

```mermaid
flowchart TD
    Start([Admin clicks<br/>Dispatch button]) --> GuardCheck[OrderStatusService<br/>::assertCanDispatch]

    GuardCheck --> GuardPass{Paid AND<br/>ReadyToDispatch?}
    GuardPass -->|No| GuardFail[[ValidationException:<br/>Cannot dispatch]]
    GuardPass -->|Yes| DispatchTx[DB::transaction]

    DispatchTx --> UpdateOrder[Order.status<br/>=Ongoing]
    UpdateOrder --> UpdateVehicle[Vehicle.status<br/>=in_use]
    UpdateVehicle --> UpdateDriver[Driver.status<br/>=on_duty]
    UpdateDriver --> NotifyDispatch[Notify Driver:<br/>OrderDispatched]
    NotifyDispatch --> AuditDispatch[AuditLog:<br/>order_dispatched]
    AuditDispatch --> TripRunning[Driver menjalankan trip]

    TripRunning --> RecordReturn[Admin POST<br/>record return<br/>with actual_return_at]
    RecordReturn --> StoreReturn[Order.actual_return_at<br/>= input]
    StoreReturn --> CalcOvertime[RentalPricingService<br/>::calculateOvertime]

    CalcOvertime --> IsLate{actual ><br/>end_at?}

    IsLate -->|Yes| OvertimeCalc[/"hours = ceil((actual-end)/60)<br/>charge = hours × hourly_rate"/]
    OvertimeCalc --> OvertimeOrder[Order.status<br/>=WaitingOvertimePayment<br/>+ create Payment unpaid]
    OvertimeOrder --> OvertimePay[Customer bayar overtime<br/>→ kembali ke Payment Flow]
    OvertimePay --> CompleteFlow

    IsLate -->|No| CompleteFlow[completeOrder]

    CompleteFlow --> CompleteTx[DB::transaction]
    CompleteTx --> FinishOrder[Order.status<br/>=Completed]
    FinishOrder --> FreeVehicle[Vehicle.status<br/>=available]
    FreeVehicle --> FreeDriver[Driver.status<br/>=available]
    FreeDriver --> IncCustomer[Customer<br/>.total_completed_orders++]
    IncCustomer --> AuditComplete[AuditLog:<br/>order_completed]
    AuditComplete --> Done([Transaction Closed])

    GuardFail --> EndErr([Error])
```

---

## 9. Sequence Diagram — Customer Booking

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as Inertia React SPA
    participant Ctrl as RentalOrderController
    participant Pricing as RentalPricingService
    participant Upgrade as VehicleUpgradeService
    participant DriverSvc as DriverAssignmentService
    participant DB as Database
    participant Notify as Notification

    Customer->>UI: Buka /customer/rental-orders/create
    UI->>Ctrl: GET create()
    Ctrl->>DB: fetch active categories + vehicles
    DB-->>Ctrl: data
    Ctrl-->>UI: Inertia render form
    UI-->>Customer: Form tampil

    Customer->>UI: Submit booking form
    UI->>Ctrl: POST /customer/rental-orders

    Ctrl->>Ctrl: Validate (min 3h for hourly)
    Ctrl->>Pricing: calculateQuote(category, unit, duration, isOOT)
    Pricing->>DB: PricingRule.where(...)
    DB-->>Pricing: rule
    Pricing-->>Ctrl: quote {subtotal, surcharge, total}

    Ctrl->>Ctrl: Compute endAt from startAt + duration
    Ctrl->>DB: vehicle.isAvailableForPeriod(startAt, endAt)

    alt Vehicle available
        DB-->>Ctrl: true
        alt Loyal customer
            Ctrl->>DriverSvc: getAvailableDrivers(schedule)
            DriverSvc-->>Ctrl: driver list
            Note over Customer,UI: Customer picks driver
            Ctrl->>DriverSvc: reserveDriver(driver_id)
        else New customer
            Ctrl->>DriverSvc: autoAssign(customer, schedule)
        end
        DriverSvc-->>Ctrl: driver
        Ctrl->>DB: INSERT RentalOrder (PendingPayment)
        Ctrl->>DB: INSERT Payment (Unpaid)
        Ctrl->>Notify: DriverAssignedToOrder
        Notify->>DB: INSERT notification
        Ctrl-->>UI: redirect to order show
        UI-->>Customer: Order created, pay now
    else Vehicle unavailable
        DB-->>Ctrl: false
        Ctrl->>Upgrade: findUpgradeForPeriod(category, startAt, endAt)
        Upgrade->>DB: Vehicle.availableForPeriod()\n.whereHas(higher class)
        DB-->>Upgrade: upgraded vehicle or null
        Upgrade-->>Ctrl: upgrade vehicle

        alt Upgrade found
            Ctrl->>DB: INSERT RentalOrder (Draft)
            Ctrl->>DB: INSERT UpgradeOffer (Pending)
            Ctrl-->>UI: redirect with upgrade offer info
            UI-->>Customer: "Kendaraan kosong, kami tawarkan upgrade gratis"

            alt Accept upgrade
                Customer->>UI: POST upgrade-offers/{id}/accept
                UI->>Ctrl: UpgradeOfferController::accept
                Ctrl->>DB: Offer.status=Accepted\nOrder.status=PendingPayment
                Ctrl->>DB: INSERT Payment (Unpaid)
                Ctrl->>Notify: DriverAssignedToOrder
            else Reject upgrade
                Customer->>UI: POST upgrade-offers/{id}/reject
                UI->>Ctrl: reject
                Ctrl->>DB: Offer.status=Rejected\nOrder.status=Cancelled
            end
        else No upgrade
            Ctrl-->>UI: 422 validation error
            UI-->>Customer: "Kendaraan booked, tidak ada alternatif"
        end
    end
```

---

## 10. Sequence Diagram — Transfer Verification

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as SPA
    participant PayCtrl as PaymentController
    actor Admin
    participant AdminUI as Admin Panel
    participant VerifyCtrl as PaymentVerificationController
    participant ReceiptSvc as ReceiptService
    participant Audit as AuditLogger
    participant Notify as Notification
    participant DB as Database

    Note over Customer,DB: Transfer Flow - Upload Proof

    Customer->>UI: Upload bukti transfer (JPG/PNG/PDF ≤ 5MB)
    UI->>PayCtrl: POST /customer/payments/{id}/upload-proof
    PayCtrl->>PayCtrl: Validate file (mime, size)
    PayCtrl->>DB: Store file to storage/
    PayCtrl->>DB: UPDATE Payment\nstatus=WaitingVerification\ntransfer_proof_url=...
    PayCtrl-->>UI: success
    UI-->>Customer: "Menunggu verifikasi admin"

    Note over Admin,DB: Admin Reviews Proof

    Admin->>AdminUI: Buka /admin/payments/verification
    AdminUI->>VerifyCtrl: GET index
    VerifyCtrl->>DB: Payment.where(status=WaitingVerification)
    DB-->>VerifyCtrl: pending list
    VerifyCtrl-->>AdminUI: render list with proof thumbnails

    Admin->>AdminUI: Klik order → lihat bukti

    alt Approve
        Admin->>AdminUI: POST approve
        AdminUI->>VerifyCtrl: approve(payment)
        VerifyCtrl->>DB: UPDATE Payment\nstatus=Paid\nverified_by=admin.id\nverified_at=now()
        VerifyCtrl->>ReceiptSvc: generateForPayment(payment)
        ReceiptSvc->>DB: INSERT Receipt (receipt_number unique)
        VerifyCtrl->>DB: UPDATE Order\nstatus=ReadyToDispatch
        VerifyCtrl->>Audit: log(payment_approved, metadata)
        VerifyCtrl-->>AdminUI: redirect
        AdminUI-->>Admin: "Verifikasi sukses"
    else Reject
        Admin->>AdminUI: POST reject with reason
        AdminUI->>VerifyCtrl: reject(payment, reason)
        VerifyCtrl->>DB: UPDATE Payment\nstatus=Rejected\nrejected_reason=...
        VerifyCtrl->>Audit: log(payment_rejected, reason)
        VerifyCtrl-->>AdminUI: redirect
        AdminUI-->>Admin: "Payment ditolak"
        Note over Customer: Customer dapat upload ulang
    end
```

---

## 11. Sequence Diagram — Free Upgrade Flow

Covers Study Case §3 "Auto-Upgrade".

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as SPA
    participant Ctrl as RentalOrderController
    participant Upgrade as VehicleUpgradeService
    participant OfferCtrl as UpgradeOfferController
    participant DB as Database
    participant Notify as Notification

    Customer->>UI: Book MPV Class-1 (sedan)
    UI->>Ctrl: POST store
    Ctrl->>DB: vehicle.isAvailableForPeriod()
    DB-->>Ctrl: false (booked)

    Ctrl->>Upgrade: findUpgradeForPeriod(Class-1, start, end)
    Upgrade->>DB: SELECT FROM vehicles v\nJOIN categories c\nWHERE c.class_level > 1\nAND v.availableForPeriod(...)\nORDER BY c.class_level ASC
    DB-->>Upgrade: Vehicle (Class-3, Minibus)
    Upgrade-->>Ctrl: upgrade candidate

    Ctrl->>DB: DB::transaction<br/>INSERT RentalOrder\nstatus=Draft\nvehicle_id=upgraded
    Ctrl->>DB: INSERT UpgradeOffer\nstatus=Pending\noriginal_cat=Class-1\nupgraded_vehicle=Minibus
    Ctrl-->>UI: redirect with info flash
    UI-->>Customer: "Unit MPV kosong.<br/>Kami tawarkan upgrade ke Minibus<br/>dengan harga MPV (Rp X)"

    alt Customer accepts
        Customer->>UI: POST /customer/upgrade-offers/{id}/accept
        UI->>OfferCtrl: accept
        OfferCtrl->>DB: DB::transaction
        OfferCtrl->>DB: UPDATE UpgradeOffer status=Accepted
        OfferCtrl->>DB: UPDATE RentalOrder status=PendingPayment
        OfferCtrl->>DB: INSERT Payment (Unpaid)
        OfferCtrl->>Notify: DriverAssignedToOrder
        OfferCtrl-->>UI: redirect to order show
        UI-->>Customer: "Upgrade diterima, silakan bayar"
    else Customer rejects
        Customer->>UI: POST /customer/upgrade-offers/{id}/reject
        UI->>OfferCtrl: reject
        OfferCtrl->>DB: UPDATE UpgradeOffer status=Rejected
        OfferCtrl->>DB: UPDATE RentalOrder status=Cancelled
        OfferCtrl-->>UI: redirect to orders list
        UI-->>Customer: "Pesanan dibatalkan"
    end
```

---

## 12. Component Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client (Browser)"]
        Browser[React 19 SPA]
        Inertia[Inertia.js v3]
    end

    subgraph Server["🚀 Laravel 13 Application"]
        direction TB

        subgraph Http["HTTP Layer"]
            Router[Router + Middleware]
            FortifyAuth[Fortify Auth]
            SpatieMw[Spatie Role Middleware]

            subgraph Controllers["Controllers"]
                CatalogCtrl[CatalogController]
                AdminCtrls[Admin/* Controllers]
                CustomerCtrls[Customer/* Controllers]
                PayCtrl[PaymentController]
                ReceiptCtrl[ReceiptController]
                OrderLifeCtrl[OrderLifecycleController]
                DashboardCtrl[DashboardController]
            end

            FormReqs[Form Requests<br/>Validation]
        end

        subgraph Services["Service Layer"]
            Pricing[Pricing Services<br/>Rental + Shuttle]
            DriverSvc[Driver Services<br/>Assignment + Availability]
            UpgradeSvc[VehicleUpgradeService]
            OrderSvc[Order Services<br/>Status + Lifecycle]
            ReceiptSvc[Receipt Services]
            AuditSvc[AuditLogger]
        end

        subgraph Data["Data Layer"]
            Models[Eloquent Models]
            Enums[PHP Enums]
            Factories[Factories + Seeders]
        end

        subgraph Support["Support"]
            Notifications[Notifications<br/>DB channel]
            Wayfinder[Wayfinder<br/>TS routes]
            Brain[Laravel Brain<br/>AI context]
        end
    end

    subgraph DB["💾 Database"]
        Postgres[(PostgreSQL / SQLite)]
    end

    subgraph Storage["📁 Storage"]
        LocalFS[Local Disk<br/>transfer proofs]
    end

    Browser <-->|HTTPS| Inertia
    Inertia <-->|JSON| Router
    Router --> FortifyAuth
    Router --> SpatieMw
    SpatieMw --> Controllers
    Controllers --> FormReqs
    Controllers --> Services
    Services --> Models
    Services --> Notifications
    Models --> Postgres
    Controllers --> LocalFS
    Notifications --> Postgres

    Support -.->|dev tools| Server
```

---

## 13. Deployment Diagram

```mermaid
flowchart LR
    subgraph Users["👥 Users"]
        CustomerBrowser[Customer<br/>Browser]
        AdminBrowser[Admin/Kasir<br/>Browser]
        DriverMobile[Driver<br/>Mobile Browser]
    end

    subgraph CDN["🌐 CDN / Edge"]
        CloudFlare[CloudFlare / CDN]
    end

    subgraph App["🚀 Application Tier"]
        LB[Load Balancer]

        subgraph Web["Web Servers"]
            PHP1[PHP-FPM<br/>Laravel 13]
            PHP2[PHP-FPM<br/>Laravel 13]
            Nginx[Nginx Reverse Proxy]
        end

        Queue[Queue Worker<br/>for Notifications]
        Scheduler[Laravel Scheduler<br/>cron tasks]
    end

    subgraph Data["💾 Data Tier"]
        MainDB[(PostgreSQL<br/>Primary)]
        Cache[(Redis<br/>Cache + Session)]
        S3[S3-compatible<br/>Storage]
    end

    subgraph Observability["📊 Observability"]
        Logs[Log Aggregator]
        Metrics[Metrics / APM]
    end

    CustomerBrowser --> CloudFlare
    AdminBrowser --> CloudFlare
    DriverMobile --> CloudFlare
    CloudFlare --> LB
    LB --> Nginx
    Nginx --> PHP1
    Nginx --> PHP2
    PHP1 --> MainDB
    PHP2 --> MainDB
    PHP1 --> Cache
    PHP2 --> Cache
    PHP1 --> S3
    PHP2 --> S3
    Queue --> MainDB
    Queue --> Cache
    Scheduler --> MainDB
    PHP1 -.logs.-> Logs
    PHP2 -.logs.-> Logs
    PHP1 -.metrics.-> Metrics
    PHP2 -.metrics.-> Metrics
```

---

## 📌 Rendering Instructions

### GitHub / GitLab

Diagrams otomatis ter-render di Markdown viewer.

### VS Code

Install extension: **"Markdown Preview Mermaid Support"** by bierner.

### Export to PNG/SVG

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/UML_MERMAID.md -o docs/UML_MERMAID.pdf
```

Atau online: https://mermaid.live/

---

## 📚 Referensi Silang

| Dokumen             | Path                                                     | Relasi             |
| ------------------- | -------------------------------------------------------- | ------------------ |
| Study Case awal     | `docs/STUDY_CASE.md`                                     | Source requirement |
| MVP Final           | `docs/MVP_FINAL.md`                                      | Scope delivered    |
| Guide Book          | `docs/GUIDE_BOOK.md`                                     | User manual        |
| UML Design (target) | `docs/UML_Rental_Kendaraan_PlantUML/`                    | Original PlantUML  |
| UML As-Built        | `docs/UML_FINAL/`                                        | PlantUML actual    |
| Gap Analysis        | `docs/superpowers/analysis/consolidated-gap-analysis.md` | Gap report         |
| Execution Plan      | `docs/superpowers/plans/uml-alignment-plan.md`           | Delivered tasks    |

---

**Maintained by:** Development Team
**Generated:** 2026-05-09
**Last test run:** 57/57 passing · 168 assertions
