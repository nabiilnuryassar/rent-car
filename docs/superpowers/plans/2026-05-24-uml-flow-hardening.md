# UML Flow Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tutup celah race condition, fraud surface, PII leak, dan state-leak yang ditemukan saat audit kode lawan UML AS-BUILT (`docs/UML_FINAL/`).

**Architecture:** Pendekatan defensive-first — kunci data integrity dulu (lock + validation), baru tutup auth/PII gap, baru fitur baru (refund, time-gating). Setiap task TDD: test merah dulu, lalu implementasi minimal, lalu hijau, lalu commit. Tidak ada refactor besar; ubah sebatas yang perlu untuk fix.

**Tech Stack:** Laravel 13.7 · Pest 4 · Inertia v3 · Wayfinder · Spatie Permission · React 19 · TW4

**Reference Audit:** Hasil scan flow vs `docs/UML_FINAL/{02_use_case,03_sequence,04_activity}.puml`. 10 issues prioritized P0 (data/duit) → P3 (docs).

---

## Execution Calibration (2026-05-25)

Bagian ini **menimpa detail yang tidak lagi akurat** pada task di bawah. Ikuti aturan kalibrasi ini saat eksekusi.

### Routing & Binding
- Gunakan route customer rental order aktif: `POST /orders`, **bukan** `/customer/rental-orders`.
- Route customer detail/cancel menggunakan binding `order_number`: `/orders/{order:order_number}`.
- Route admin order lifecycle menggunakan binding `rentalOrder:order_number`: `/admin/orders/{rentalOrder:order_number}/dispatch`.
- Tambahan route refund admin harus ditempatkan di `routes/web.php` dalam group `admin` yang sudah ada.

### Test Strategy
- Fokus ke tes deterministik yang membuktikan **state safety** (double-booking blocked, status guard, validation, redaction), bukan pseudo-concurrency yang tidak stabil di SQLite.
- Untuk endpoint validation, gunakan assertion spesifik framework (`assertForbidden`, `assertSessionHasErrors`, `assertRedirect`) sesuai konvensi test existing.
- Reuse setup role dengan pola existing test (`Role::findOrCreate(...)`) agar test tidak flaky.

### Model & Schema Alignment
- Saat menambah kolom refund, update juga `app/Models/Payment.php`:
  - `#[Fillable(...)]` untuk `refunded_at`, `refunded_by`, `refund_reason`
  - `casts()` untuk `refunded_at` sebagai datetime
  - relasi `refunder()` ke `User`
- `PaymentStatus::Refunded` sudah ada, tidak perlu ubah enum.

### Controller/Service Guardrail
- Hardening booking wajib memasukkan lock di area yang sama dengan assignment driver agar check+write tetap atomik.
- Upload proof hanya boleh untuk status payment `unpaid|rejected` dan order yang belum `cancelled|completed`.
- Reject payment harus membersihkan file proof lama agar tidak ada stale file leak.

### Frontend/Resource Contract
- Jika payload order customer dipindah ke API Resource, pertahankan shape data yang dipakai page existing agar UI tidak regress.
- Bila ada perubahan UI/UX, terapkan prinsip dari skill `ui-ux-pro-max` (konsistensi visual, kontras, state interaktif).

### Scope Eksekusi untuk sesi ini
- Prioritas implementasi: P0/P1 lengkap + P2 yang low-risk (self-overlap, dispatch window, refund flow) + sinkronisasi UML docs.
- Draft-cancel dijadikan verifikasi test coverage (tanpa ubah behavior jika sudah benar).

---

## File Structure

### Modify
- `app/Http/Controllers/Customer/OrderController.php` — bungkus `store()` dalam transaction + `lockForUpdate()`
- `app/Http/Controllers/PaymentController.php` — validate cash amount, status guard upload
- `app/Http/Controllers/Admin/PaymentVerificationController.php` — file cleanup on reject
- `app/Http/Controllers/Admin/OrderLifecycleController.php` — dispatch time-gating
- `app/Http/Requests/StoreCashPaymentRequest.php` — rule `amount` ≥ payment.amount
- `app/Http/Requests/UploadTransferProofRequest.php` — authorize cek status
- `app/Http/Requests/Customer/StoreRentalOrderRequest.php` — self-overlap rule
- `app/Services/Orders/OrderStatusService.php` — assertion `start_at` window
- `app/Services/Orders/RentalOrderLifecycleService.php` — refund flow
- `app/Services/Drivers/DriverAvailabilityService.php` — `lockForUpdate()` di query busy drivers
- `app/Models/Vehicle.php` — `availableForPeriodLocked()` scope
- `app/Enums/PaymentStatus.php` — sudah ada `Refunded` ✓ (tidak perlu ubah)
- `app/Enums/OrderStatus.php` — tambah ke `cancellableStatuses` filter di refund-cancel
- `docs/UML_FINAL/03_sequence_diagram_as_built.puml` — hapus catatan "GAP no driver notif"
- `docs/UML_FINAL/04_activity_diagram_as_built.puml` — update partition driver
- `docs/UML_FINAL/02_use_case_diagram_as_built.puml` — tambah UC-27 Refund

### Create
- `app/Http/Resources/OrderResource.php` — sanitize driver PII untuk customer view
- `app/Http/Resources/PaymentResource.php` — strip `verified_by` dari customer payload
- `app/Http/Resources/DriverPublicResource.php` — driver name + plate-relevant fields only
- `app/Http/Requests/Admin/RefundPaymentRequest.php` — validate refund reason + amount
- `app/Services/Payments/PaymentRefundService.php` — refund transaction logic
- `app/Http/Controllers/Admin/PaymentRefundController.php` — POST /admin/payments/{id}/refund
- `database/migrations/2026_05_24_xxxxxx_add_refund_columns_to_payments_table.php` — `refunded_at`, `refund_reason`, `refunded_by`
- `tests/Feature/Concurrency/VehicleDoubleBookingTest.php` — race test
- `tests/Feature/Concurrency/DriverDoubleAssignmentTest.php` — race test
- `tests/Feature/Payments/CashPaymentValidationTest.php` — anti-fraud
- `tests/Feature/Payments/UploadProofStateGuardTest.php` — status check
- `tests/Feature/Payments/PaymentRefundTest.php` — refund flow E2E
- `tests/Feature/Customer/OrderResourceLeakTest.php` — PII redaction
- `tests/Feature/Admin/DispatchTimeGateTest.php` — time-gating
- `tests/Feature/Customer/CustomerSelfOverlapTest.php` — self-overlap

---

## Task 1: P0-1 Vehicle Double-Booking Race Fix

**Files:**
- Create: `tests/Feature/Concurrency/VehicleDoubleBookingTest.php`
- Modify: `app/Models/Vehicle.php`
- Modify: `app/Http/Controllers/Customer/OrderController.php` (method `store`, lines 85-194)

- [ ] **Step 1.1: Write failing test for concurrent vehicle booking**

```php
<?php

use App\Models\Customer;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Support\Facades\DB;

it('prevents two customers from booking the same vehicle for overlapping period', function () {
    $category = VehicleCategory::factory()->create();
    $vehicle = Vehicle::factory()->for($category, 'category')->create(['status' => 'available']);
    Driver::factory()->count(2)->create(['status' => 'available']);

    [$customerA, $customerB] = Customer::factory()->count(2)->create();

    $startAt = now()->addDays(2)->toIso8601String();

    $payload = fn () => [
        'vehicle_id' => $vehicle->id,
        'rental_unit' => 'day',
        'duration' => 2,
        'start_at' => $startAt,
        'pickup_option' => 'pickup_at_office',
        'is_out_of_town' => false,
    ];

    DB::beginTransaction();
    $first = $this->actingAs($customerA->user)->post('/orders', $payload());
    DB::commit();

    $second = $this->actingAs($customerB->user)->post('/orders', $payload());

    $first->assertRedirect();
    $second->assertSessionHasErrors('vehicle_id');
});
```

- [ ] **Step 1.2: Run test to verify it fails**

Run: `php artisan test --filter=VehicleDoubleBookingTest`
Expected: FAIL — both bookings succeed (race window).

- [ ] **Step 1.3: Add locked scope on Vehicle model**

Modify `app/Models/Vehicle.php`, add method after `isAvailableForPeriod`:

```php
public function isAvailableForPeriodLocked(\Carbon\CarbonInterface $start, \Carbon\CarbonInterface $end): bool
{
    return static::query()
        ->whereKey($this->getKey())
        ->lockForUpdate()
        ->availableForPeriod($start, $end)
        ->exists();
}
```

- [ ] **Step 1.4: Wrap entire store() in transaction with lock**

Modify `app/Http/Controllers/Customer/OrderController.php`. Replace the body of `store()` from line 87 (after `$customer = ...`) — entire flow including pricing, availability check, driver assignment, and order creation must run inside a single `DB::transaction` that begins with `Vehicle::query()->whereKey($vehicleId)->lockForUpdate()->first()`:

```php
public function store(StoreRentalOrderRequest $request): RedirectResponse
{
    $customer = auth()->user()->customer;
    $rentalUnit = RentalUnit::from($request->validated('rental_unit'));
    $duration = (int) $request->validated('duration');
    $isOutOfTown = (bool) $request->validated('is_out_of_town', false);
    $startAt = Carbon::parse($request->validated('start_at'));
    $endAt = match ($rentalUnit) {
        RentalUnit::Hour => $startAt->copy()->addHours($duration),
        RentalUnit::Day => $startAt->copy()->addDays($duration),
        RentalUnit::Week => $startAt->copy()->addWeeks($duration),
        RentalUnit::Month => $startAt->copy()->addMonths($duration),
    };

    [$order, $upgraded] = DB::transaction(function () use ($request, $customer, $rentalUnit, $duration, $isOutOfTown, $startAt, $endAt) {
        $vehicle = Vehicle::query()
            ->whereKey($request->validated('vehicle_id'))
            ->lockForUpdate()
            ->firstOrFail();

        $quote = $this->pricingService->calculateQuote($vehicle->category, $rentalUnit, $duration, $isOutOfTown);

        if (! $vehicle->isAvailableForPeriodLocked($startAt, $endAt)) {
            $upgrade = $this->upgradeService->findUpgradeForPeriod($vehicle->category, $startAt, $endAt);
            if (! $upgrade) {
                throw ValidationException::withMessages([
                    'vehicle_id' => 'Kendaraan ini sudah dipesan dan tidak ada kendaraan kelas lebih tinggi yang tersedia.',
                ]);
            }
            $driver = $this->driverAssignment->assign($customer, $request->validated('driver_id'), $startAt, $endAt);
            $order = RentalOrder::create([
                'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                'customer_id' => $customer->id,
                'vehicle_id' => $upgrade->id,
                'driver_id' => $driver->id,
                'status' => OrderStatus::Draft,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'total_amount' => $quote['total'],
                'rental_unit' => $rentalUnit->value,
                'duration' => $duration,
                'is_out_of_town' => $isOutOfTown,
                'pickup_option' => $request->validated('pickup_option'),
                'delivery_address' => $request->validated('delivery_address'),
            ]);
            UpgradeOffer::create([
                'rental_order_id' => $order->id,
                'original_vehicle_category_id' => $vehicle->category_id ?? $vehicle->vehicle_category_id,
                'upgraded_vehicle_id' => $upgrade->id,
                'status' => OfferStatus::Pending,
            ]);
            return [$order, true];
        }

        $driver = $this->driverAssignment->assign($customer, $request->validated('driver_id'), $startAt, $endAt);

        $order = RentalOrder::create([
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'customer_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'status' => OrderStatus::PendingPayment,
            'start_at' => $startAt,
            'end_at' => $endAt,
            'total_amount' => $quote['total'],
            'rental_unit' => $rentalUnit->value,
            'duration' => $duration,
            'is_out_of_town' => $isOutOfTown,
            'pickup_option' => $request->validated('pickup_option'),
            'delivery_address' => $request->validated('delivery_address'),
        ]);

        $order->payments()->create([
            'method' => 'bank_transfer',
            'status' => PaymentStatus::Unpaid->value,
            'amount' => $quote['total'],
        ]);

        return [$order, false];
    });

    $order->driver?->user?->notify(new DriverAssignedToOrder($order));

    return redirect()->route('customer.orders.show', $order)
        ->with($upgraded ? 'info' : 'success', $upgraded
            ? 'Kendaraan yang Anda pilih tidak tersedia. Kami menawarkan upgrade gratis ke kelas yang lebih tinggi dengan harga yang sama.'
            : 'Pesanan berhasil dibuat.');
}
```

- [ ] **Step 1.5: Run test to verify pass**

Run: `php artisan test --filter=VehicleDoubleBookingTest`
Expected: PASS.

- [ ] **Step 1.6: Run regression tests**

Run: `php artisan test --filter='CustomerOrderFlow|VehicleAvailability|AutoUpgradeOffer'`
Expected: ALL PASS.

- [ ] **Step 1.7: Commit**

```bash
git add app/Models/Vehicle.php app/Http/Controllers/Customer/OrderController.php tests/Feature/Concurrency/VehicleDoubleBookingTest.php
git commit -m "fix(orders): lock vehicle for update during booking to prevent race"
```

---

## Task 2: P0-1b Driver Double-Assignment Race Fix

**Files:**
- Create: `tests/Feature/Concurrency/DriverDoubleAssignmentTest.php`
- Modify: `app/Services/Drivers/DriverAvailabilityService.php`

- [ ] **Step 2.1: Write failing test**

```php
<?php

use App\Models\Customer;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\VehicleCategory;

it('does not assign same driver to two concurrent bookings', function () {
    $category = VehicleCategory::factory()->create();
    [$v1, $v2] = Vehicle::factory()->for($category, 'category')->count(2)->create(['status' => 'available']);
    $driver = Driver::factory()->create(['status' => 'available']);

    [$cA, $cB] = Customer::factory()->count(2)->create();
    $startAt = now()->addDays(2)->toIso8601String();

    $base = fn ($vid) => [
        'vehicle_id' => $vid,
        'rental_unit' => 'day',
        'duration' => 2,
        'start_at' => $startAt,
        'pickup_option' => 'pickup_at_office',
        'is_out_of_town' => false,
    ];

    $first = $this->actingAs($cA->user)->post('/orders', $base($v1->id));
    $second = $this->actingAs($cB->user)->post('/orders', $base($v2->id));

    $first->assertRedirect();
    $second->assertSessionHasErrors();  // no other driver available
});
```

- [ ] **Step 2.2: Run test to verify FAIL**

Run: `php artisan test --filter=DriverDoubleAssignmentTest`
Expected: FAIL.

- [ ] **Step 2.3: Lock the busy-driver subquery**

Modify `app/Services/Drivers/DriverAvailabilityService.php`. Wrap the `Driver::query()` final select with `lockForUpdate()`:

```php
public function getAvailableDrivers(Carbon $startAt, Carbon $endAt): Collection
{
    $busyDriverIds = RentalOrder::query()
        ->whereNotIn('status', ['cancelled', 'completed'])
        ->where(function ($query) use ($startAt, $endAt): void {
            $query->whereBetween('start_at', [$startAt, $endAt])
                ->orWhereBetween('end_at', [$startAt, $endAt])
                ->orWhere(function ($q) use ($startAt, $endAt): void {
                    $q->where('start_at', '<=', $startAt)->where('end_at', '>=', $endAt);
                });
        })
        ->pluck('driver_id');

    return Driver::query()
        ->with('user')
        ->where('status', 'available')
        ->whereNotIn('id', $busyDriverIds)
        ->lockForUpdate()
        ->get();
}
```

Note: `getAvailableDrivers` only locks correctly if called inside a transaction. Task 1 already wraps `store()` in `DB::transaction`, so this lock takes effect there.

- [ ] **Step 2.4: Run test to verify pass**

Run: `php artisan test --filter=DriverDoubleAssignmentTest`
Expected: PASS.

- [ ] **Step 2.5: Commit**

```bash
git add app/Services/Drivers/DriverAvailabilityService.php tests/Feature/Concurrency/DriverDoubleAssignmentTest.php
git commit -m "fix(drivers): lockForUpdate on driver availability query"
```

---

## Task 3: P0-2 Cash Payment Amount Validation

**Files:**
- Create: `tests/Feature/Payments/CashPaymentValidationTest.php`
- Modify: `app/Http/Requests/StoreCashPaymentRequest.php`

- [ ] **Step 3.1: Write failing test**

```php
<?php

use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;

it('rejects cash payment with amount below payment.amount', function () {
    $admin = User::factory()->create()->assignRole('admin');
    $order = RentalOrder::factory()->create(['total_amount' => 500_000]);
    $payment = Payment::factory()->for($order, 'orderable')->create([
        'amount' => 500_000,
        'status' => 'unpaid',
    ]);

    $this->actingAs($admin)
        ->post("/payments/{$payment->id}/cash", ['amount' => 1])
        ->assertSessionHasErrors('amount');

    expect($payment->fresh()->status->value)->toBe('unpaid');
});

it('accepts cash payment with exact amount', function () {
    $admin = User::factory()->create()->assignRole('admin');
    $order = RentalOrder::factory()->create(['total_amount' => 500_000]);
    $payment = Payment::factory()->for($order, 'orderable')->create([
        'amount' => 500_000,
        'status' => 'unpaid',
    ]);

    $this->actingAs($admin)
        ->post("/payments/{$payment->id}/cash", ['amount' => 500_000])
        ->assertRedirect();

    expect($payment->fresh()->status->value)->toBe('paid');
});
```

- [ ] **Step 3.2: Run test to verify FAIL**

Run: `php artisan test --filter=CashPaymentValidationTest`
Expected: FAIL — first test (kasir bisa input 1 rupiah, masuk).

- [ ] **Step 3.3: Add `gte:payment.amount` rule**

Modify `app/Http/Requests/StoreCashPaymentRequest.php`:

```php
<?php

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class StoreCashPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'kasir']);
    }

    public function rules(): array
    {
        $payment = $this->route('payment');
        $minimum = $payment instanceof Payment ? (int) $payment->amount : 1;

        return [
            'amount' => ['required', 'integer', "min:{$minimum}"],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.min' => 'Jumlah pembayaran tunai tidak boleh kurang dari nominal tagihan.',
        ];
    }
}
```

- [ ] **Step 3.4: Run test to verify pass**

Run: `php artisan test --filter=CashPaymentValidationTest`
Expected: PASS.

- [ ] **Step 3.5: Commit**

```bash
git add app/Http/Requests/StoreCashPaymentRequest.php tests/Feature/Payments/CashPaymentValidationTest.php
git commit -m "fix(payments): validate cash amount >= invoice amount"
```

---

## Task 4: P0-3 Upload Proof State Guard + File Cleanup

**Files:**
- Create: `tests/Feature/Payments/UploadProofStateGuardTest.php`
- Modify: `app/Http/Requests/UploadTransferProofRequest.php`
- Modify: `app/Http/Controllers/PaymentController.php` (method `uploadProof`, lines 65-84)
- Modify: `app/Http/Controllers/Admin/PaymentVerificationController.php` (method `reject`, lines 89-113)

- [ ] **Step 4.1: Write failing tests**

```php
<?php

use App\Models\Payment;
use App\Models\RentalOrder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

it('blocks upload proof when payment status is paid', function () {
    $order = RentalOrder::factory()->create();
    $payment = Payment::factory()->for($order, 'orderable')->create(['status' => 'paid']);

    $this->actingAs($order->customer->user)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => UploadedFile::fake()->image('p.jpg'),
        ])
        ->assertStatus(409);
});

it('blocks upload proof when order is cancelled', function () {
    $order = RentalOrder::factory()->create(['status' => 'cancelled']);
    $payment = Payment::factory()->for($order, 'orderable')->create(['status' => 'unpaid']);

    $this->actingAs($order->customer->user)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => UploadedFile::fake()->image('p.jpg'),
        ])
        ->assertStatus(409);
});

it('removes the previous proof file when admin rejects and customer re-uploads', function () {
    $order = RentalOrder::factory()->create();
    $payment = Payment::factory()->for($order, 'orderable')->create([
        'status' => 'rejected',
        'transfer_proof_url' => 'transfer-proofs/old.jpg',
    ]);
    Storage::disk('public')->put('transfer-proofs/old.jpg', 'old');

    $this->actingAs($order->customer->user)
        ->post("/customer/payments/{$payment->id}/upload-proof", [
            'proof' => UploadedFile::fake()->image('new.jpg'),
        ])
        ->assertRedirect();

    Storage::disk('public')->assertMissing('transfer-proofs/old.jpg');
});
```

- [ ] **Step 4.2: Run tests to verify FAIL**

Run: `php artisan test --filter=UploadProofStateGuardTest`
Expected: FAIL.

- [ ] **Step 4.3: Add status guard in form request**

Modify `app/Http/Requests/UploadTransferProofRequest.php`:

```php
<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class UploadTransferProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user() || ! $this->user()->hasRole('customer')) {
            return false;
        }

        $payment = $this->route('payment');
        if (! $payment instanceof Payment) {
            return false;
        }

        $allowedPayment = [PaymentStatus::Unpaid, PaymentStatus::Rejected];
        $blockedOrder = [OrderStatus::Cancelled, OrderStatus::Completed];

        if (! in_array($payment->status, $allowedPayment, true)) {
            abort(409, 'Pembayaran ini sudah diproses dan tidak dapat di-upload ulang.');
        }
        if (in_array($payment->orderable->status, $blockedOrder, true)) {
            abort(409, 'Pesanan terkait sudah ditutup. Upload bukti tidak diperbolehkan.');
        }

        return $payment->orderable->customer_id === $this->user()->customer?->id;
    }

    public function rules(): array
    {
        return [
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
```

- [ ] **Step 4.4: Cleanup old file di controller**

Modify `app/Http/Controllers/PaymentController.php` method `uploadProof`:

```php
public function uploadProof(UploadTransferProofRequest $request, Payment $payment): RedirectResponse
{
    $oldPath = $payment->transfer_proof_url;
    $path = $request->file('proof')->store('transfer-proofs', 'public');

    $payment->update([
        'method' => PaymentMethod::BankTransfer->value,
        'status' => PaymentStatus::WaitingVerification->value,
        'transfer_proof_url' => $path,
        'paid_at' => now(),
    ]);

    if ($oldPath && \Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
    }

    return redirect()->back()->with('success', 'Bukti transfer berhasil diunggah. Menunggu verifikasi.');
}
```

- [ ] **Step 4.5: Run tests to verify pass**

Run: `php artisan test --filter=UploadProofStateGuardTest`
Expected: PASS.

- [ ] **Step 4.6: Commit**

```bash
git add app/Http/Requests/UploadTransferProofRequest.php app/Http/Controllers/PaymentController.php tests/Feature/Payments/UploadProofStateGuardTest.php
git commit -m "fix(payments): guard upload proof by payment+order state, cleanup old file"
```

---

## Task 5: P1-5 Customer Order Show — Driver PII Redaction

**Files:**
- Create: `app/Http/Resources/DriverPublicResource.php`
- Create: `app/Http/Resources/PaymentResource.php`
- Create: `app/Http/Resources/OrderResource.php`
- Create: `tests/Feature/Customer/OrderResourceLeakTest.php`
- Modify: `app/Http/Controllers/Customer/OrderController.php` (method `show`, lines 196-204)

- [ ] **Step 5.1: Write failing test**

```php
<?php

use App\Models\RentalOrder;

it('does not expose driver email/phone or verifier id to customer', function () {
    $order = RentalOrder::factory()->create();

    $response = $this->actingAs($order->customer->user)
        ->get("/customer/orders/{$order->id}");

    $response->assertInertia(fn ($page) => $page
        ->where('props.order.driver.user.email', null)
        ->where('props.order.driver.user.phone', null)
        ->missing('props.order.payments.0.verified_by')
    );
});
```

- [ ] **Step 5.2: Run test FAIL**

Run: `php artisan test --filter=OrderResourceLeakTest`
Expected: FAIL — props masih ada.

- [ ] **Step 5.3: Create resource classes**

Create `app/Http/Resources/DriverPublicResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DriverPublicResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user' => ['name' => $this->user?->name],
            'status' => $this->status,
        ];
    }
}
```

Create `app/Http/Resources/PaymentResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method,
            'status' => $this->status,
            'amount' => $this->amount,
            'paid_at' => $this->paid_at,
            'transfer_proof_url' => $this->transfer_proof_url,
            'receipt' => $this->whenLoaded('receipt'),
        ];
    }
}
```

Create `app/Http/Resources/OrderResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'start_at' => $this->start_at,
            'end_at' => $this->end_at,
            'actual_return_at' => $this->actual_return_at,
            'total_amount' => $this->total_amount,
            'rental_unit' => $this->rental_unit,
            'duration' => $this->duration,
            'is_out_of_town' => $this->is_out_of_town,
            'pickup_option' => $this->pickup_option,
            'delivery_address' => $this->delivery_address,
            'vehicle' => $this->whenLoaded('vehicle'),
            'driver' => DriverPublicResource::make($this->whenLoaded('driver')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
```

- [ ] **Step 5.4: Wire resource into controller**

Modify `app/Http/Controllers/Customer/OrderController.php` `show()`:

```php
public function show(RentalOrder $order): Response
{
    $customer = auth()->user()->customer;
    abort_if($order->customer_id !== $customer->id, 403);

    return Inertia::render('customer/orders/show', [
        'order' => OrderResource::make(
            $order->load(['vehicle.category', 'driver.user', 'payments.receipt'])
        ),
    ]);
}
```

Add `use App\Http\Resources\OrderResource;` near the top.

- [ ] **Step 5.5: Run test PASS**

Run: `php artisan test --filter=OrderResourceLeakTest`
Expected: PASS.

- [ ] **Step 5.6: Smoke-check the React page still renders**

Run: `php artisan inertia:start-ssr` (if SSR enabled) or just hit `/customer/orders/{id}` in dev — fields used by `customer/orders/show.tsx` should still be present (`order.driver.user.name`, `order.payments[].status`, etc.). If a field is missing add it back into the resource.

- [ ] **Step 5.7: Commit**

```bash
git add app/Http/Resources/ app/Http/Controllers/Customer/OrderController.php tests/Feature/Customer/OrderResourceLeakTest.php
git commit -m "fix(customer): redact driver PII and verifier id via API resources"
```

---

## Task 6: P2-7 Customer Self-Overlap Booking

**Files:**
- Create: `tests/Feature/Customer/CustomerSelfOverlapTest.php`
- Modify: `app/Http/Requests/Customer/StoreRentalOrderRequest.php`

- [ ] **Step 6.1: Write failing test**

```php
<?php

use App\Models\Customer;
use App\Models\RentalOrder;
use App\Models\Vehicle;

it('rejects booking that overlaps customer existing active order', function () {
    $customer = Customer::factory()->create();
    [$v1, $v2] = Vehicle::factory()->count(2)->create(['status' => 'available']);
    RentalOrder::factory()->create([
        'customer_id' => $customer->id,
        'vehicle_id' => $v1->id,
        'status' => 'pending_payment',
        'start_at' => now()->addDays(2),
        'end_at' => now()->addDays(4),
    ]);

    $this->actingAs($customer->user)
        ->post('/orders', [
            'vehicle_id' => $v2->id,
            'rental_unit' => 'day',
            'duration' => 2,
            'start_at' => now()->addDays(3)->toIso8601String(),
            'pickup_option' => 'pickup_at_office',
            'is_out_of_town' => false,
        ])
        ->assertSessionHasErrors('start_at');
});
```

- [ ] **Step 6.2: Run test FAIL**

Run: `php artisan test --filter=CustomerSelfOverlapTest`

- [ ] **Step 6.3: Add `after()` rule**

Modify `app/Http/Requests/Customer/StoreRentalOrderRequest.php`. Append to existing `after()` callback:

```php
public function after(): array
{
    return [
        function ($validator): void {
            $rentalUnit = $this->input('rental_unit');
            $duration = (int) $this->input('duration');

            if ($rentalUnit === RentalUnit::Hour->value && $duration < 3) {
                $validator->errors()->add('duration', 'Sewa per jam minimal 3 jam.');
            }

            $customerId = $this->user()->customer?->id;
            if (! $customerId) return;

            $startAt = \Carbon\Carbon::parse($this->input('start_at'));
            $endAt = match (RentalUnit::from($rentalUnit)) {
                RentalUnit::Hour => $startAt->copy()->addHours($duration),
                RentalUnit::Day => $startAt->copy()->addDays($duration),
                RentalUnit::Week => $startAt->copy()->addWeeks($duration),
                RentalUnit::Month => $startAt->copy()->addMonths($duration),
            };

            $hasOverlap = \App\Models\RentalOrder::query()
                ->where('customer_id', $customerId)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->where('start_at', '<', $endAt)
                ->where('end_at', '>', $startAt)
                ->exists();

            if ($hasOverlap) {
                $validator->errors()->add('start_at', 'Anda memiliki pesanan aktif yang berbenturan dengan jadwal ini.');
            }
        },
    ];
}
```

- [ ] **Step 6.4: Run test PASS**

Run: `php artisan test --filter=CustomerSelfOverlapTest`

- [ ] **Step 6.5: Commit**

```bash
git add app/Http/Requests/Customer/StoreRentalOrderRequest.php tests/Feature/Customer/CustomerSelfOverlapTest.php
git commit -m "feat(orders): block customer self-overlap bookings"
```

---

## Task 7: Dispatch Time-Gating

**Files:**
- Create: `tests/Feature/Admin/DispatchTimeGateTest.php`
- Modify: `app/Services/Orders/OrderStatusService.php`
- Modify: `config/rental.php` (create if not exists)

- [ ] **Step 7.1: Write failing test**

```php
<?php

use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;

it('rejects dispatch if start_at is more than 24 hours away', function () {
    config(['rental.dispatch_window_hours' => 24]);

    $admin = User::factory()->create()->assignRole('admin');
    $order = RentalOrder::factory()->create([
        'status' => 'ready_to_dispatch',
        'start_at' => now()->addDays(3),
    ]);
    Payment::factory()->for($order, 'orderable')->create(['status' => 'paid']);

    $this->actingAs($admin)
        ->post("/admin/orders/{$order->order_number}/dispatch")
        ->assertSessionHasErrors('start_at');

    expect($order->fresh()->status->value)->toBe('ready_to_dispatch');
});

it('allows dispatch within window', function () {
    config(['rental.dispatch_window_hours' => 24]);

    $admin = User::factory()->create()->assignRole('admin');
    $order = RentalOrder::factory()->create([
        'status' => 'ready_to_dispatch',
        'start_at' => now()->addHours(6),
    ]);
    Payment::factory()->for($order, 'orderable')->create(['status' => 'paid']);

    $this->actingAs($admin)
        ->post("/admin/orders/{$order->order_number}/dispatch")
        ->assertRedirect();

    expect($order->fresh()->status->value)->toBe('ongoing');
});
```

- [ ] **Step 7.2: Run test FAIL**

Run: `php artisan test --filter=DispatchTimeGateTest`

- [ ] **Step 7.3: Create `config/rental.php`**

```php
<?php

return [
    'dispatch_window_hours' => env('RENTAL_DISPATCH_WINDOW_HOURS', 24),
];
```

- [ ] **Step 7.4: Add assertion**

Modify `app/Services/Orders/OrderStatusService.php`:

```php
public function assertCanDispatch(RentalOrder $order): void
{
    $paidPayment = $order->payments()
        ->where('status', PaymentStatus::Paid->value)
        ->exists();

    if (! $paidPayment) {
        throw ValidationException::withMessages([
            'payment' => 'Pesanan ini belum memiliki pembayaran yang terverifikasi. Kendaraan belum dapat dikirim.',
        ]);
    }

    if ($order->status !== OrderStatus::ReadyToDispatch) {
        throw ValidationException::withMessages([
            'status' => "Pesanan tidak berada pada status yang dapat dikirim. Status saat ini: {$order->status->value}.",
        ]);
    }

    $windowHours = (int) config('rental.dispatch_window_hours', 24);
    if ($order->start_at && $order->start_at->diffInHours(now(), false) < -$windowHours) {
        throw ValidationException::withMessages([
            'start_at' => "Pesanan baru dapat dikirim {$windowHours} jam sebelum jadwal mulai (start_at: {$order->start_at}).",
        ]);
    }
}
```

- [ ] **Step 7.5: Run test PASS**

Run: `php artisan test --filter=DispatchTimeGateTest`

- [ ] **Step 7.6: Commit**

```bash
git add app/Services/Orders/OrderStatusService.php config/rental.php tests/Feature/Admin/DispatchTimeGateTest.php
git commit -m "feat(orders): enforce dispatch window hours before start_at"
```

---

## Task 8: P2-8 Refund Flow (cancel after Paid)

**Files:**
- Create: `database/migrations/2026_05_24_000000_add_refund_columns_to_payments_table.php`
- Create: `app/Services/Payments/PaymentRefundService.php`
- Create: `app/Http/Requests/Admin/RefundPaymentRequest.php`
- Create: `app/Http/Controllers/Admin/PaymentRefundController.php`
- Create: `tests/Feature/Payments/PaymentRefundTest.php`
- Modify: `routes/web.php` (add refund route in existing admin group)
- Modify: `app/Services/Orders/RentalOrderLifecycleService.php` (cancel auto-trigger refund)

- [ ] **Step 8.1: Migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->timestamp('refunded_at')->nullable()->after('verified_at');
            $table->foreignId('refunded_by')->nullable()->after('refunded_at')->constrained('users')->nullOnDelete();
            $table->string('refund_reason', 500)->nullable()->after('refunded_by');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['refunded_by']);
            $table->dropColumn(['refunded_at', 'refunded_by', 'refund_reason']);
        });
    }
};
```

Run: `php artisan migrate`

- [ ] **Step 8.2: Write failing test**

```php
<?php

use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;

it('refunds a paid payment when admin cancels post-paid order', function () {
    $admin = User::factory()->create()->assignRole('admin');
    $order = RentalOrder::factory()->create(['status' => 'ready_to_dispatch']);
    $payment = Payment::factory()->for($order, 'orderable')->create(['status' => 'paid']);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/refund", ['reason' => 'customer batal'])
        ->assertRedirect();

    expect($payment->fresh()->status->value)->toBe('refunded')
        ->and($payment->fresh()->refunded_by)->toBe($admin->id)
        ->and($payment->fresh()->refund_reason)->toBe('customer batal')
        ->and($order->fresh()->status->value)->toBe('cancelled');
});

it('cannot refund unpaid payment', function () {
    $admin = User::factory()->create()->assignRole('admin');
    $order = RentalOrder::factory()->create();
    $payment = Payment::factory()->for($order, 'orderable')->create(['status' => 'unpaid']);

    $this->actingAs($admin)
        ->post("/admin/payments/{$payment->id}/refund", ['reason' => 'tes'])
        ->assertStatus(409);
});
```

Run: `php artisan test --filter=PaymentRefundTest` → FAIL.

- [ ] **Step 8.3: Form Request**

Create `app/Http/Requests/Admin/RefundPaymentRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }
}
```

- [ ] **Step 8.4: Refund service**

Create `app/Services/Payments/PaymentRefundService.php`:

```php
<?php

namespace App\Services\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\RentalOrder;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Orders\RentalOrderLifecycleService;
use Illuminate\Support\Facades\DB;

class PaymentRefundService
{
    public function __construct(private readonly RentalOrderLifecycleService $lifecycle) {}

    public function refund(Payment $payment, string $reason, User $actor): Payment
    {
        if ($payment->status !== PaymentStatus::Paid) {
            abort(409, 'Hanya pembayaran berstatus paid yang dapat di-refund.');
        }

        return DB::transaction(function () use ($payment, $reason, $actor): Payment {
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            $payment->update([
                'status' => PaymentStatus::Refunded->value,
                'refunded_at' => now(),
                'refunded_by' => $actor->id,
                'refund_reason' => $reason,
            ]);

            $orderable = $payment->orderable;
            if ($orderable instanceof RentalOrder
                && ! in_array($orderable->status, [OrderStatus::Completed, OrderStatus::Cancelled], true)) {
                $this->lifecycle->cancelOrder($orderable, "refund: {$reason}", $actor);
            }

            AuditLogger::log($actor, 'payment.refunded', $payment, [
                'amount' => $payment->amount,
                'reason' => $reason,
            ]);

            return $payment->refresh();
        });
    }
}
```

- [ ] **Step 8.5: Controller + route**

Create `app/Http/Controllers/Admin/PaymentRefundController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RefundPaymentRequest;
use App\Models\Payment;
use App\Services\Payments\PaymentRefundService;
use Illuminate\Http\RedirectResponse;

class PaymentRefundController extends Controller
{
    public function __construct(private readonly PaymentRefundService $refundService) {}

    public function __invoke(RefundPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->refundService->refund($payment, $request->validated('reason'), $request->user());

        return redirect()->route('admin.payments.verification.index')
            ->with('success', 'Pembayaran berhasil di-refund dan pesanan dibatalkan.');
    }
}
```

Add route in `routes/web.php`:

```php
Route::post('/admin/payments/{payment}/refund', \App\Http\Controllers\Admin\PaymentRefundController::class)
    ->name('admin.payments.refund')
    ->middleware(['auth', 'role:admin']);
```

- [ ] **Step 8.6: Run test PASS**

Run: `php artisan test --filter=PaymentRefundTest`

- [ ] **Step 8.7: Commit**

```bash
git add database/migrations/2026_05_24_000000_add_refund_columns_to_payments_table.php app/Services/Payments app/Http/Controllers/Admin/PaymentRefundController.php app/Http/Requests/Admin/RefundPaymentRequest.php routes/web.php tests/Feature/Payments/PaymentRefundTest.php
git commit -m "feat(payments): add refund flow with order auto-cancel"
```

---

## Task 9: P3-9 Update UML Docs

**Files:**
- Modify: `docs/UML_FINAL/03_sequence_diagram_as_built.puml`
- Modify: `docs/UML_FINAL/04_activity_diagram_as_built.puml`

- [ ] **Step 9.1: Update sequence — driver notif udah ada**

Modify `docs/UML_FINAL/03_sequence_diagram_as_built.puml` line 100-103. Replace:

```
note over Admin
  GAP: No notification to driver
  (v1.1 roadmap)
end note
```

With:

```
LifeCtrl -> Driver: notify(OrderDispatched)
note over Driver
  Implemented via Notification
  channel (database + mail).
end note
```

- [ ] **Step 9.2: Update activity diagram driver partition**

Modify `docs/UML_FINAL/04_activity_diagram_as_built.puml` line 130. Replace:

```
partition "DRIVER (GAP — tidak ada notifikasi v1.0)" {
```

With:

```
partition "DRIVER" {
  :Receive OrderDispatched notification;
```

- [ ] **Step 9.3: Add refund use case**

Modify `docs/UML_FINAL/02_use_case_diagram_as_built.puml`. Add after UC-25:

```
  usecase "UC-27\nRefund Payment\n(admin only)" as UC27
```

And:

```
Admin --> UC27
```

- [ ] **Step 9.4: Validate PlantUML still parses**

Run (assuming plantuml jar/CLI available — skip if not):

```bash
plantuml -checkonly docs/UML_FINAL/*.puml
```

If plantuml not installed, just confirm syntax visually — no syntax errors.

- [ ] **Step 9.5: Commit**

```bash
git add docs/UML_FINAL/
git commit -m "docs(uml): sync as-built diagrams (driver notif done, add refund UC)"
```

---

## Task 10: P2-6 Draft State Cleanup

**Files:**
- Modify: `app/Http/Controllers/Customer/OrderController.php` (cancel cancellableStatuses)
- Create: `tests/Feature/Customer/DraftCancelTest.php`

Note: kemungkinan ini gak butuh kode, hanya verifikasi via test bahwa flow Draft sudah konsisten.

- [ ] **Step 10.1: Test draft cancel flow**

```php
<?php

use App\Enums\OfferStatus;
use App\Models\RentalOrder;
use App\Models\UpgradeOffer;

it('customer can cancel a draft order from auto-upgrade flow', function () {
    $order = RentalOrder::factory()->create(['status' => 'draft']);
    UpgradeOffer::factory()->create(['rental_order_id' => $order->id, 'status' => OfferStatus::Pending]);

    $this->actingAs($order->customer->user)
        ->post("/customer/orders/{$order->id}/cancel", ['reason' => 'tidak jadi'])
        ->assertRedirect();

    expect($order->fresh()->status->value)->toBe('cancelled');
});
```

- [ ] **Step 10.2: Run test**

Run: `php artisan test --filter=DraftCancelTest`
Expected: PASS (already in `cancellableStatuses`).

If FAIL → check route + middleware. Likely route name mismatch; align with `customer.orders.cancel` in `web.php`.

- [ ] **Step 10.3: Commit**

```bash
git add tests/Feature/Customer/DraftCancelTest.php
git commit -m "test(orders): cover draft order cancellation by customer"
```

---

## Final Verification

- [ ] **Step F.1: Run full test suite**

```bash
php artisan test
```

Expected: ALL PASS.

- [ ] **Step F.2: Run static analysis**

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse  # if configured
```

Expected: clean.

- [ ] **Step F.3: Manual smoke**

- Customer flow: register → catalog → book → upload proof → admin verify → admin dispatch
- Admin refund flow: pick a paid order → /admin/payments/{id}/refund → verify status

- [ ] **Step F.4: Update CHANGELOG**

Append to `docs/CHANGELOG.md`:

```markdown
## 2026-05-24 — UML Flow Hardening

- fix(orders): lock vehicle/driver on booking to prevent double-booking
- fix(payments): validate cash amount, guard upload-proof state, cleanup old proof files
- fix(customer): redact driver PII via API resources
- feat(orders): block customer self-overlap bookings
- feat(orders): enforce dispatch window hours before start_at
- feat(payments): add refund flow with order auto-cancel
- docs(uml): sync as-built diagrams
```

- [ ] **Step F.5: Push branch + create MR**

```bash
git push -u origin feat/uml-flow-hardening
glab mr create --title "Hardening: UML flow gap fixes" --description "Closes audit findings P0-P3 from UML_FINAL scan."
```

---

## Spec Coverage Check

| Audit Issue | Task |
|-------------|------|
| P0-1 Vehicle race | Task 1 |
| P0-1b Driver race | Task 2 |
| P0-2 Cash amount | Task 3 |
| P0-3 Upload state + cleanup | Task 4 |
| P1-4 Upload status check | Task 4 (covered) |
| P1-5 Driver PII | Task 5 |
| P2-6 Draft state | Task 10 |
| P2-7 Self-overlap | Task 6 |
| P2-8 Refund | Task 8 |
| Existing dispatch time-gate | Task 7 |
| P3-9 UML docs | Task 9 |

All 11 issues covered. No placeholders. Type names consistent across tasks.
