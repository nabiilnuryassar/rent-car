# UML Sistem Informasi Rental Kendaraan

Dokumen ini merepresentasikan requirement final sistem rental kendaraan dalam format yang mudah dibaca developer dan AI agent.

## Cakupan Diagram

1. **Use Case Diagram** — aktor memakai bentuk UML actor/stick figure.
2. **Activity Diagram** — alur proses end-to-end dari pemesanan sampai transaksi selesai.
3. **Sequence Diagram** — disusun dengan section/group: `CUSTOMER | INTERNAL SYSTEM | ADMIN / KASIR | DRIVER | EXTERNAL`.
4. **Class Diagram** — rancangan entity/domain utama untuk backend dan database.

## Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| Pelanggan | Pengguna umum yang melakukan registrasi, melihat katalog, menyewa kendaraan, pesan antar-jemput, dan melakukan pembayaran. |
| Pelanggan Lama | Spesialisasi dari pelanggan yang memiliki hak memilih supir dan dapat memperoleh prioritas layanan. |
| Admin | Mengelola kendaraan, tarif, supir, verifikasi pembayaran, dan operasional transaksi. |
| Kasir | Mencatat pembayaran tunai, membantu verifikasi pembayaran, dan menerbitkan kwitansi. |
| Supir | Menerima jadwal, membawa kendaraan, dan melaksanakan layanan rental/antar-jemput. |
| Bank/Transfer | Aktor eksternal untuk alur transfer bank dan validasi dana masuk. |

---

## 1. Use Case Diagram

```plantuml
@startuml
left to right direction
title Use Case Diagram - Sistem Informasi Rental Kendaraan
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Pelanggan" as Customer
actor "Pelanggan Lama" as LoyalCustomer
actor "Admin" as Admin
actor "Kasir" as Cashier
actor "Supir" as Driver
actor "Bank/Transfer" as Bank

rectangle "Sistem Informasi Rental Kendaraan" {
  usecase "Registrasi / Login" as UC01
  usecase "Lihat Katalog\n& Cek Ketersediaan" as UC02
  usecase "Buat Pemesanan\nSewa Kendaraan" as UC03
  usecase "Pilih Durasi, Armada,\nWilayah & Lokasi" as UC04
  usecase "Hitung Tarif\nOtomatis" as UC05
  usecase "Pilih Supir" as UC06
  usecase "Free Upgrade\nKendaraan" as UC07
  usecase "Pesan Layanan\nAntar-Jemput" as UC08
  usecase "Upload Bukti\nTransfer" as UC09
  usecase "Input Pembayaran\nTunai" as UC10
  usecase "Verifikasi\nPembayaran" as UC11
  usecase "Generate / Cetak\nKwitansi" as UC12
  usecase "Kelola Data\nKendaraan" as UC13
  usecase "Kelola Tarif\n& Aturan Pricing" as UC14
  usecase "Kelola Data\nSupir" as UC15
  usecase "Konfirmasi\nPengiriman / Ambil" as UC16
  usecase "Catat Pengembalian\nKendaraan" as UC17
  usecase "Hitung Denda\nOvertime" as UC18
}

Customer --> UC01
Customer --> UC02
Customer --> UC03
Customer --> UC08
Customer --> UC09
Customer --> UC12

LoyalCustomer --|> Customer
LoyalCustomer --> UC06

Admin --> UC11
Admin --> UC13
Admin --> UC14
Admin --> UC15
Admin --> UC16
Admin --> UC17

Cashier --> UC10
Cashier --> UC11
Cashier --> UC12

Driver --> UC16
Driver --> UC17

Bank --> UC11

UC03 .> UC04 : <<include>>
UC03 .> UC05 : <<include>>
UC03 .> UC06 : <<extend>>\n[pelanggan lama]
UC03 .> UC07 : <<extend>>\n[stok kosong]
UC08 .> UC05 : <<include>>
UC09 .> UC11 : <<include>>
UC10 .> UC12 : <<include>>
UC11 .> UC12 : <<include>>
UC17 .> UC18 : <<include>>
@enduml
```

---

## 2. Activity Diagram

```plantuml
@startuml
title Activity Diagram - Proses Rental Kendaraan
skinparam shadowing false

start
partition "CUSTOMER" {
  :Registrasi / Login;
  :Pilih jenis layanan;
}

if (Jenis layanan?) then (Sewa kendaraan)
  partition "CUSTOMER" {
    :Pilih jenis kendaraan;
    :Isi durasi sewa\n(jam/hari/minggu/bulan);
    :Pilih ambil di tempat\natau dikirim;
    :Pilih wilayah\nDalam Kota / Luar Kota;
  }
  partition "INTERNAL SYSTEM" {
    :Validasi minimum sewa\nper jam = 3 jam;
    :Cek status pelanggan;
    :Cek ketersediaan kendaraan;
  }
  if (Pelanggan lama?) then (Ya)
    partition "CUSTOMER" {
      :Pilih supir tersedia;
    }
    partition "INTERNAL SYSTEM" {
      :Reservasi supir;
    }
  else (Tidak)
    partition "INTERNAL SYSTEM" {
      :Assign supir otomatis;
    }
  endif
  if (Kendaraan tersedia?) then (Ya)
    partition "INTERNAL SYSTEM" {
      :Reservasi kendaraan pilihan;
    }
  else (Tidak)
    partition "INTERNAL SYSTEM" {
      :Cari kendaraan kelas lebih tinggi;
      :Tawarkan free upgrade\ndengan harga awal;
    }
    partition "CUSTOMER" {
      :Setujui / tolak upgrade;
    }
  endif
else (Antar/Jemput)
  partition "CUSTOMER" {
    :Isi lokasi jemput;
    :Isi lokasi tujuan;
    :Isi jadwal antar/jemput;
  }
  partition "INTERNAL SYSTEM" {
    :Cari tarif berdasarkan\ntabel jarak & waktu;
  }
endif

partition "INTERNAL SYSTEM" {
  :Hitung total biaya;
  note right
    Tarif dinamis berdasarkan durasi
    + 20% jika luar kota
    + tarif layanan antar/jemput jika relevan
  end note
}

partition "CUSTOMER" {
  :Pilih metode pembayaran;
}

if (Metode pembayaran?) then (Tunai)
  partition "ADMIN / KASIR" {
    :Terima pembayaran tunai;
    :Input pembayaran tunai;
  }
  partition "INTERNAL SYSTEM" {
    :Set status pembayaran = PAID;
    :Generate kwitansi;
  }
else (Transfer)
  partition "CUSTOMER" {
    :Transfer bank;
    :Upload bukti transfer;
  }
  partition "ADMIN / KASIR" {
    :Verifikasi bukti / dana masuk;
  }
  if (Valid?) then (Ya)
    partition "INTERNAL SYSTEM" {
      :Set status pembayaran = PAID;
      :Generate kwitansi;
    }
  else (Tidak)
    partition "INTERNAL SYSTEM" {
      :Status = WAITING_VERIFICATION;
    }
    partition "CUSTOMER" {
      :Perbaiki / upload ulang bukti;
    }
  endif
endif

partition "INTERNAL SYSTEM" {
  :Unlock order untuk dijalankan;
  :Buat jadwal supir dan kendaraan;
}
partition "SUPIR" {
  :Ambil / antar kendaraan;
  :Laksanakan layanan sewa;
}
partition "ADMIN / KASIR" {
  :Catat waktu pengembalian;
}
partition "INTERNAL SYSTEM" {
  :Hitung overtime jika terlambat;
  :Tutup transaksi;
}
stop
@enduml
```

---

## 3. Sequence Diagram

Sequence diagram dibuat dengan section/box supaya mudah dipindahkan ke Lucid sebagai kolom/lane:

`CUSTOMER | INTERNAL SYSTEM | ADMIN / KASIR | DRIVER | EXTERNAL`

```plantuml
@startuml
title Sequence Diagram - Rental Kendaraan dengan Payment Verification
autonumber

box "CUSTOMER" #LightBlue
actor Customer as "Pelanggan"
end box

box "INTERNAL SYSTEM" #LightGray
participant WebApp as "Web/App"
participant RentalSvc as "Rental Service"
participant Inventory as "Inventory Service"
participant Pricing as "Pricing Engine"
participant DriverSvc as "Driver Service"
participant PaymentSvc as "Payment Service"
participant ReceiptSvc as "Receipt Service"
end box

box "ADMIN / KASIR" #LightYellow
actor Admin as "Admin/Kasir"
end box

box "DRIVER" #LightGreen
actor Driver as "Supir"
end box

box "EXTERNAL" #White
participant Bank as "Bank"
end box

Customer -> WebApp: Registrasi/Login
Customer -> WebApp: Lihat katalog kendaraan
WebApp -> Inventory: getAvailableVehicles(tanggal, durasi, jenis)
Inventory --> WebApp: Daftar kendaraan + status
WebApp --> Customer: Tampilkan katalog & status

Customer -> WebApp: Submit pemesanan sewa
WebApp -> RentalSvc: createRentalOrder(payload)
RentalSvc -> Pricing: calculateRentalPrice(jenis, durasi, wilayah)
Pricing --> RentalSvc: basePrice + surcharge/outOfTown + discount
RentalSvc -> Inventory: reserveVehicle(vehicleId, jadwal)

alt Kendaraan tersedia
  Inventory --> RentalSvc: reservationConfirmed
else Stok kendaraan kosong
  Inventory --> RentalSvc: unavailable
  RentalSvc -> Inventory: findHigherClassVehicle(jenis, jadwal)
  Inventory --> RentalSvc: upgradedVehicleCandidate
  RentalSvc --> WebApp: offerFreeUpgrade(hargaAwal)
  WebApp --> Customer: Tampilkan tawaran upgrade
  Customer -> WebApp: Setujui upgrade
  WebApp -> RentalSvc: confirmUpgrade(upgradedVehicleId)
end

opt Customer adalah pelanggan lama
  RentalSvc -> DriverSvc: getAvailableDrivers(jadwal)
  DriverSvc --> RentalSvc: daftarSupir
  RentalSvc --> WebApp: tampilkan opsi supir
  Customer -> WebApp: pilihSupir(driverId)
  WebApp -> DriverSvc: reserveDriver(driverId, jadwal)
end

Customer -> WebApp: Pilih metode pembayaran
alt Pembayaran tunai
  Customer -> Admin: Bayar tunai
  Admin -> PaymentSvc: recordCashPayment(orderId, amount)
  PaymentSvc -> ReceiptSvc: generateReceipt(orderId)
  ReceiptSvc --> Customer: Kwitansi digital/cetak
else Pembayaran transfer bank
  Customer -> Bank: Transfer ke rekening perusahaan
  Customer -> WebApp: Upload bukti transfer
  WebApp -> PaymentSvc: submitTransferProof(orderId, file)
  Admin -> PaymentSvc: verifyTransfer(orderId)
  PaymentSvc -> Bank: checkSettlement(optional)
  Bank --> PaymentSvc: dana masuk / valid
  PaymentSvc -> ReceiptSvc: generateReceipt(orderId)
  ReceiptSvc --> Customer: Kwitansi digital/cetak
end

PaymentSvc -> RentalSvc: markAsPaid(orderId)
RentalSvc -> DriverSvc: assignSchedule(orderId, vehicle, driver)
DriverSvc --> Driver: Notifikasi jadwal tugas
Driver -> Customer: Kirim kendaraan / layani sewa
Admin -> RentalSvc: Input waktu pengembalian
RentalSvc -> Pricing: calculateOvertimeIfLate(orderId)
Pricing --> RentalSvc: overtimeCharge
RentalSvc --> WebApp: status COMPLETED + biaya akhir
WebApp --> Customer: Ringkasan transaksi selesai
@enduml
```

---

## 4. Class Diagram

```plantuml
@startuml
title Class Diagram - Sistem Informasi Rental Kendaraan
skinparam classAttributeIconSize 0
skinparam linetype ortho

abstract class User {
  +id: UUID
  +name: String
  +email: String
  +phone: String
  +passwordHash: String
  +role: UserRole
  +createdAt: DateTime
  +login(): Session
  +updateProfile(): void
}

class Customer {
  +customerCode: String
  +identityNumber: String
  +address: String
  +customerType: CustomerType
  +rentalCount: Integer
  +isLoyalCustomer(): Boolean
}

class Admin {
  +employeeCode: String
  +manageVehicle(): void
  +managePricingRule(): void
  +verifyPayment(): void
}

class Cashier {
  +employeeCode: String
  +recordCashPayment(): Payment
  +printReceipt(): Receipt
}

class Driver {
  +driverCode: String
  +licenseNumber: String
  +status: DriverStatus
  +rating: Decimal
  +acceptSchedule(): void
}

class VehicleCategory {
  +id: UUID
  +name: String
  +classLevel: Integer
  +description: String
}

class Vehicle {
  +id: UUID
  +plateNumber: String
  +brand: String
  +model: String
  +year: Integer
  +status: VehicleStatus
  +currentLocation: String
  +isAvailable(start, end): Boolean
}

class PricingRule {
  +id: UUID
  +rentalUnit: RentalUnit
  +minDuration: Integer
  +maxDuration: Integer
  +baseRate: Money
  +discountRate: Decimal
  +outOfTownSurchargeRate: Decimal = 0.20
  +calculate(): Money
}

class OvertimePenalty {
  +id: UUID
  +hourlyRate: Money
  +calculateLateFee(hours): Money
}

abstract class Order {
  +id: UUID
  +orderNumber: String
  +status: OrderStatus
  +startDateTime: DateTime
  +endDateTime: DateTime
  +totalAmount: Money
  +createdAt: DateTime
  +markPaid(): void
  +cancel(): void
  +complete(): void
}

class RentalOrder {
  +rentalUnit: RentalUnit
  +duration: Integer
  +isOutOfTown: Boolean
  +pickupOption: PickupOption
  +deliveryAddress: String
  +actualReturnTime: DateTime
  +calculateTotal(): Money
  +calculateOvertime(): Money
}

class ShuttleOrder {
  +pickupAddress: String
  +destinationAddress: String
  +estimatedDistanceKm: Decimal
  +estimatedDurationMinutes: Integer
  +calculateByDistanceAndTime(): Money
}

class UpgradeOffer {
  +id: UUID
  +originalVehicleId: UUID
  +upgradedVehicleId: UUID
  +originalPrice: Money
  +status: OfferStatus
  +accept(): void
  +reject(): void
}

class Payment {
  +id: UUID
  +method: PaymentMethod
  +status: PaymentStatus
  +amount: Money
  +paidAt: DateTime
  +transferProofUrl: String
  +verifiedAt: DateTime
  +verify(): void
}

class Receipt {
  +id: UUID
  +receiptNumber: String
  +issuedAt: DateTime
  +pdfUrl: String
  +generatePdf(): File
  +print(): void
}

class ShuttleTariff {
  +id: UUID
  +areaFrom: String
  +areaTo: String
  +estimatedDistanceKm: Decimal
  +estimatedDurationMinutes: Integer
  +tariff: Money
}

enum OrderStatus {
  PENDING
  WAITING_VERIFICATION
  PAID
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
}

enum PaymentStatus {
  UNPAID
  WAITING_VERIFICATION
  PAID
  REJECTED
}

enum VehicleStatus {
  AVAILABLE
  RESERVED
  IN_USE
  MAINTENANCE
}

enum RentalUnit {
  HOUR
  DAY
  WEEK
  MONTH
}

enum PickupOption {
  PICKUP_AT_OFFICE
  DELIVER_TO_CUSTOMER
}

User <|-- Customer
User <|-- Admin
User <|-- Cashier
User <|-- Driver
Order <|-- RentalOrder
Order <|-- ShuttleOrder

Customer "1" -- "0..*" Order : creates
VehicleCategory "1" -- "0..*" Vehicle : classifies
VehicleCategory "1" -- "0..*" PricingRule : has
VehicleCategory "1" -- "1" OvertimePenalty : defines
RentalOrder "1" -- "1" Vehicle : uses
RentalOrder "1" -- "1" Driver : assigned
RentalOrder "0..1" -- "1" UpgradeOffer : may have
Order "1" -- "0..*" Payment : paid by
Payment "1" -- "0..1" Receipt : produces
ShuttleOrder "1" -- "1" ShuttleTariff : uses
Cashier "1" -- "0..*" Payment : records
Admin "1" -- "0..*" Payment : verifies
Driver "1" -- "0..*" RentalOrder : serves
@enduml
```

---

## Catatan Implementasi untuk Developer

### Status Order

| Status | Makna |
|---|---|
| `PENDING` | Order dibuat tetapi belum dibayar. |
| `WAITING_VERIFICATION` | Bukti transfer sudah diunggah tetapi belum diverifikasi. |
| `PAID` | Pembayaran valid dan order boleh dijalankan. |
| `IN_PROGRESS` | Kendaraan/supir sedang menjalankan layanan. |
| `COMPLETED` | Transaksi selesai. |
| `CANCELLED` | Transaksi dibatalkan. |

### Business Rules Utama

| Rule | Implementasi Sistem |
|---|---|
| Sewa selalu termasuk supir | `RentalOrder` wajib memiliki relasi ke `Driver`. |
| Sewa tanpa BBM | Tidak ada field biaya BBM pada order final. |
| Minimal sewa per jam 3 jam | Validasi pada `RentalService` sebelum order dibuat. |
| Durasi makin lama makin murah | `PricingRule.discountRate` dan `PricingEngine.calculate()`. |
| Luar kota tambah 20% | `PricingRule.outOfTownSurchargeRate = 0.20`. |
| Overtime per jam | `OvertimePenalty.calculateLateFee(hours)`. |
| Pelanggan lama dapat memilih supir | `Customer.isLoyalCustomer()` membuka fitur `chooseDriver`. |
| Kendaraan kosong dapat free upgrade | `UpgradeOffer` dibuat jika stok awal tidak tersedia. |
| Kendaraan tidak boleh dikirim sebelum lunas | `RentalOrder.status` harus `PAID` sebelum dispatch. |
| Transfer sah setelah bukti/dana diverifikasi | `Payment.status` berubah dari `WAITING_VERIFICATION` ke `PAID`. |
| Kwitansi diterbitkan setelah lunas | `ReceiptService.generateReceipt(orderId)`. |

### Modul Sistem yang Disarankan

| Modul | Tanggung Jawab |
|---|---|
| User Management | Registrasi, login, role, histori pelanggan. |
| Vehicle Management | Data kendaraan, kategori, status ketersediaan. |
| Driver Management | Data supir, status supir, assignment jadwal. |
| Rental Transaction | Order rental, durasi, lokasi, wilayah, dispatch, pengembalian. |
| Shuttle Service | Antar-jemput berdasarkan tabel jarak dan waktu. |
| Pricing Engine | Tarif dinamis, surcharge luar kota, overtime. |
| Payment System | Tunai, transfer, verifikasi pembayaran. |
| Reporting & Document | Kwitansi digital/cetak dan laporan transaksi. |

