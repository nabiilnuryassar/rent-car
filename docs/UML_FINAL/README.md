# UML_FINAL — As-Built UML Documentation

> **Version:** 1.0  
> **Last Updated:** 2026-05-09  
> **Status:** Reflects actual implementation per Brain scan

---

## Overview

Folder ini berisi UML diagrams yang **sudah disesuaikan dengan implementasi aktual** (bukan design awal). Berbeda dengan `docs/UML_Rental_Kendaraan_PlantUML/` yang merupakan design target, folder ini mendokumentasikan **apa yang sudah dibangun**.

## Files

| File                                | Description                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `01_class_diagram_as_built.puml`    | Class diagram sesuai model Laravel aktual (dengan Spatie roles, polymorphic payment, audit log) |
| `02_use_case_diagram_as_built.puml` | Use case yang sudah terimplementasi (UC-01 s/d UC-26)                                           |
| `03_sequence_diagram_as_built.puml` | Sequence flow end-to-end booking → payment → dispatch → return                                  |
| `04_activity_diagram_as_built.puml` | Activity diagram flow operasional lengkap                                                       |

## Perbedaan Utama dengan UML Design Awal

### 1. Composition over Inheritance

- **Design:** `User` abstract → `Customer/Admin/Cashier/Driver` subclass
- **Reality:** `User` concrete + Spatie roles + separate `Customer`/`Driver` models via FK

### 2. No Abstract Order

- **Design:** `Order` abstract → `RentalOrder/ShuttleOrder`
- **Reality:** Independent models with polymorphic `Payment`

### 3. Service Layer for Business Logic

- **Design:** Methods on models (`PricingRule::calculate()`, `Order::markPaid()`)
- **Reality:** Services (`RentalPricingService`, `OrderStatusService`, dll)

### 4. Extended Enums

- **OrderStatus** gained 3 values: `draft`, `ready_to_dispatch`, `waiting_overtime_payment`
- **PaymentStatus** gained `refunded`
- **VehicleStatus** gained `inactive`

### 5. Extra: Audit Log

- `AuditLog` model + `AuditLogger` service untuk track operasi kritis
- Tidak ada di UML design awal

### 6. Extra Use Cases

- UC-20: Complete Order (eksplisit)
- UC-21: Dashboard
- UC-22: Reports
- UC-23: Audit Log view
- UC-24: Receipt view (customer + staff)
- UC-25: Order history
- UC-26: Role-based dashboard redirect

## Cara Generate PNG/SVG

```bash
# Install PlantUML (via npm atau download JAR)
npm install -g node-plantuml

# Generate semua diagram
cd docs/UML_FINAL
for f in *.puml; do
  puml generate "$f" -o "${f%.puml}.png"
done
```

Atau pakai VS Code extension: `PlantUML` by jebbs.

## Known Gaps (Will Be Addressed in v1.1)

Lihat `docs/superpowers/analysis/consolidated-gap-analysis.md` untuk detail:

- ❌ Driver notification (sequence diagram menandai ini sebagai GAP)
- ⚠️ Auto-trigger upgrade saat vehicle kosong (saat ini manual)
- ❌ Date-range availability check (potensi double-booking)
- ❌ Order cancellation flow
