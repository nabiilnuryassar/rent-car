<?php

namespace Database\Seeders;

use App\Enums\CustomerType;
use App\Enums\DriverStatus;
use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PickupOption;
use App\Enums\RentalUnit;
use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\OvertimePenalty;
use App\Models\Payment;
use App\Models\PricingRule;
use App\Models\Receipt;
use App\Models\RentalOrder;
use App\Models\Setting;
use App\Models\ShuttleOrder;
use App\Models\ShuttleTariff;
use App\Models\UpgradeOffer;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        collect(UserRole::cases())->each(
            fn (UserRole $role): Role => Role::findOrCreate($role->value),
        );

        $admin = $this->createUser('Admin Urban8', 'admin@urban8.com', UserRole::Admin);
        $cashier = $this->createUser('Kasir Urban8', 'kasir@urban8.com', UserRole::Cashier);
        $customerUser = $this->createUser('Pelanggan Demo', 'customer@urban8.com', UserRole::Customer);
        $loyalCustomerUser = $this->createUser('Pelanggan Setia', 'loyal@urban8.com', UserRole::Customer);
        $driverOneUser = $this->createUser('Budi Santoso', 'driver@urban8.com', UserRole::Driver);
        $driverTwoUser = $this->createUser('Raka Pratama', 'driver2@urban8.com', UserRole::Driver);
        $driverThreeUser = $this->createUser('Sinta Maharani', 'driver3@urban8.com', UserRole::Driver);

        $customer = Customer::create([
            'user_id' => $customerUser->id,
            'phone' => '0812-3456-7890',
            'address' => 'Jl. Merdeka No. 8, Jakarta Pusat',
            'customer_type' => CustomerType::New,
            'total_completed_orders' => 0,
        ]);

        $loyalCustomer = Customer::create([
            'user_id' => $loyalCustomerUser->id,
            'phone' => '0812-8888-0008',
            'address' => 'Jl. Prof. Dr. Satrio No. 18, Jakarta Selatan',
            'customer_type' => CustomerType::Loyal,
            'total_completed_orders' => 6,
        ]);

        $driverOne = Driver::create([
            'user_id' => $driverOneUser->id,
            'license_number' => 'SIM-A-000001',
            'phone' => '0812-1111-0001',
            'professional_title' => 'Pengemudi Eksekutif',
            'experience_years' => 8,
            'status' => DriverStatus::OnDuty,
        ]);

        $driverTwo = Driver::create([
            'user_id' => $driverTwoUser->id,
            'license_number' => 'SIM-A-000002',
            'phone' => '0812-1111-0002',
            'professional_title' => 'Pengemudi Antar-Jemput',
            'experience_years' => 5,
            'status' => DriverStatus::Available,
        ]);

        $driverThree = Driver::create([
            'user_id' => $driverThreeUser->id,
            'license_number' => 'SIM-A-000003',
            'phone' => '0812-1111-0003',
            'professional_title' => 'Pengemudi Luar Kota',
            'experience_years' => 10,
            'status' => DriverStatus::Reserved,
        ]);

        // Seed 15+ extra drivers with varying statuses
        $extraDriverNames = [
            'Ahmad Sulaiman', 'Dedi Kurniawan', 'Eko Prasetyo', 'Fajar Nugraha',
            'Gilang Ramadhan', 'Hadi Santoso', 'Irfan Maulana', 'Joko Widodo',
            'Krisna Bayu', 'Leo Hartanto', 'Made Wiryawan', 'Nanda Prasetya',
            'Oki Setiawan', 'Putra Wibowo', 'Rizky Ananda', 'Surya Dharma',
            'Taufik Hidayat', 'Umar Bakri',
        ];

        $driverStatuses = [
            DriverStatus::Available,
            DriverStatus::Available,
            DriverStatus::Available,
            DriverStatus::OnDuty,
            DriverStatus::OffDuty,
            DriverStatus::Reserved,
        ];

        $titles = [
            'Pengemudi Kota', 'Pengemudi Luar Kota', 'Pengemudi Eksekutif',
            'Pengemudi Antar-Jemput', 'Pengemudi Ekspres',
        ];

        foreach ($extraDriverNames as $idx => $driverName) {
            $slug = 'driver'.($idx + 4);
            $user = $this->createUser($driverName, $slug.'@urban8.com', UserRole::Driver);
            Driver::create([
                'user_id' => $user->id,
                'license_number' => 'SIM-A-'.str_pad((string) ($idx + 4), 6, '0', STR_PAD_LEFT),
                'phone' => '0812-1111-'.str_pad((string) ($idx + 4), 4, '0', STR_PAD_LEFT),
                'professional_title' => $titles[$idx % count($titles)],
                'experience_years' => (($idx * 3) % 15) + 1,
                'status' => $driverStatuses[$idx % count($driverStatuses)],
            ]);
        }

        $categories = [
            'sedan' => VehicleCategory::create([
                'name' => 'Sedan',
                'class_level' => 1,
                'description' => 'Kendaraan penumpang ringkas untuk perjalanan bisnis dan pribadi.',
                'is_active' => true,
            ]),
            'mpv' => VehicleCategory::create([
                'name' => 'MPV',
                'class_level' => 2,
                'description' => 'Kendaraan keluarga untuk perjalanan dalam kota dan luar kota.',
                'is_active' => true,
            ]),
            'pickup' => VehicleCategory::create([
                'name' => 'Bak Terbuka',
                'class_level' => 3,
                'description' => 'Kendaraan operasional untuk kebutuhan angkut barang terbuka.',
                'is_active' => true,
            ]),
            'box' => VehicleCategory::create([
                'name' => 'Mobil Box',
                'class_level' => 4,
                'description' => 'Kendaraan logistik tertutup untuk pengiriman barang.',
                'is_active' => true,
            ]),
            'minibus' => VehicleCategory::create([
                'name' => 'Minibus',
                'class_level' => 5,
                'description' => 'Kendaraan penumpang berkapasitas besar untuk rombongan.',
                'is_active' => true,
            ]),
            'suv' => VehicleCategory::create([
                'name' => 'SUV',
                'class_level' => 3,
                'description' => 'Kendaraan tangguh untuk berbagai medan.',
                'is_active' => true,
            ]),
            'hatchback' => VehicleCategory::create([
                'name' => 'Hatchback',
                'class_level' => 1,
                'description' => 'Kendaraan mungil lincah untuk perkotaan.',
                'is_active' => true,
            ]),
        ];

        $vehicles = [
            'sedan_city' => $this->createVehicle($categories['sedan'], 'B 1008 UBN', 'Honda', 'City', 2024, VehicleStatus::Available, 'Kantor URBAN 8 Jakarta'),
            'mpv_avanza' => $this->createVehicle($categories['mpv'], 'B 2008 UBN', 'Toyota', 'Avanza', 2024, VehicleStatus::Available, 'Kantor URBAN 8 Jakarta'),
            'mpv_xpander' => $this->createVehicle($categories['mpv'], 'B 2208 UBN', 'Mitsubishi', 'Xpander', 2023, VehicleStatus::InUse, 'Dalam perjalanan'),
            'pickup_granmax' => $this->createVehicle($categories['pickup'], 'B 3008 UBN', 'Daihatsu', 'Gran Max', 2022, VehicleStatus::Available, 'Pool Logistik URBAN 8'),
            'box_l300' => $this->createVehicle($categories['box'], 'B 4008 UBN', 'Mitsubishi', 'L300 Box', 2021, VehicleStatus::Maintenance, 'Bengkel Rekanan'),
            'minibus_hiace' => $this->createVehicle($categories['minibus'], 'B 5008 UBN', 'Toyota', 'Hiace Premio', 2024, VehicleStatus::Available, 'Kantor URBAN 8 Jakarta'),
            'sedan_vios' => $this->createVehicle($categories['sedan'], 'B 1108 UBN', 'Toyota', 'Vios', 2020, VehicleStatus::Inactive, 'Arsip Armada'),
        ];

        // Seed an extra 40+ vehicles
        $brandsAndModels = [
            'sedan' => [
                ['Toyota', 'Camry'], ['Honda', 'Civic'], ['Toyota', 'Corolla'], ['Mazda', 'Mazda3'], ['Mercedes-Benz', 'Sedan C-Class']
            ],
            'mpv' => [
                ['Toyota', 'Innova Zenix'], ['Suzuki', 'Ertiga'], ['Daihatsu', 'Xenia'], ['Honda', 'Mobilio'], ['Hyundai', 'Stargazer'], ['Nissan', 'Stargazer'], ['Wuling', 'Confero']
            ],
            'suv' => [
                ['Toyota', 'Fortuner'], ['Mitsubishi', 'Pajero Sport'], ['Honda', 'HR-V'], ['Honda', 'CR-V'], ['Hyundai', 'Creta'], ['Toyota', 'Rush'], ['Daihatsu', 'Terios'], ['Honda', 'BR-V']
            ],
            'hatchback' => [
                ['Honda', 'Brio'], ['Toyota', 'Yaris'], ['Honda', 'Jazz'], ['Suzuki', 'Baleno'], ['Toyota', 'Agya']
            ],
            'pickup' => [
                ['Toyota', 'Hilux'], ['Suzuki', 'Carry Pickup'], ['Mitsubishi', 'Triton']
            ],
            'box' => [
                ['Hino', 'Engkel Box'], ['Isuzu', 'Traga Box']
            ],
            'minibus' => [
                ['Toyota', 'Hiace Commuter'], ['Isuzu', 'Elf']
            ]
        ];

        $counter = 1;
        foreach ($brandsAndModels as $catKey => $models) {
            foreach ($models as $idx => [$brand, $model]) {
                for ($i = 0; $i < 2; $i++) { // 2 of each to get to >40
                    $numStr = str_pad((string)($counter * 10), 4, '0', STR_PAD_LEFT);
                    $plate = "B {$numStr} UBN";
                    $statusPool = [VehicleStatus::Available, VehicleStatus::Available, VehicleStatus::Available, VehicleStatus::InUse, VehicleStatus::Maintenance, VehicleStatus::Reserved];
                    $status = $statusPool[$counter % count($statusPool)];
                    
                    $vehicle = $this->createVehicle(
                        $categories[$catKey], 
                        $plate, 
                        $brand, 
                        $model, 
                        2018 + ($counter % 7), 
                        $status, 
                        'Kantor URBAN 8 Jakarta'
                    );
                    $vehicles["{$catKey}_{$idx}_{$i}"] = $vehicle;
                    $counter++;
                }
            }
        }

        $this->seedPricing($categories);

        $tariffs = [
            'airport' => ShuttleTariff::create([
                'area_from' => 'Bandara Soekarno-Hatta',
                'area_to' => 'Jakarta Pusat',
                'estimated_distance_km' => 30.00,
                'estimated_duration_minutes' => 60,
                'tariff' => 350000,
            ]),
            'station' => ShuttleTariff::create([
                'area_from' => 'Stasiun Gambir',
                'area_to' => 'Bogor',
                'estimated_distance_km' => 56.00,
                'estimated_duration_minutes' => 95,
                'tariff' => 600000,
            ]),
        ];

        $now = Carbon::now()->startOfDay()->addHours(9);

        $completedOrder = $this->createRentalOrder(
            'ORD-DEMO-0001',
            $loyalCustomer,
            $vehicles['sedan_city'],
            $driverTwo,
            OrderStatus::Completed,
            $now->copy()->subDays(10),
            $now->copy()->subDays(8),
            900000,
            RentalUnit::Day,
            2,
            PickupOption::PickupAtOffice,
            actualReturnAt: $now->copy()->subDays(8)->addHour(),
        );

        $this->createPayment($completedOrder, PaymentMethod::Cash, PaymentStatus::Paid, 900000, $cashier, 'KWT-DEMO-0001', $now->copy()->subDays(8)->addHours(2));

        $pendingOrder = $this->createRentalOrder(
            'ORD-DEMO-0002',
            $customer,
            $vehicles['mpv_avanza'],
            $driverTwo,
            OrderStatus::PendingPayment,
            $now->copy()->addDays(2),
            $now->copy()->addDays(3),
            650000,
            RentalUnit::Day,
            1,
            PickupOption::DeliverToCustomer,
            deliveryAddress: 'Jl. Pemuda No. 21, Jakarta Timur',
        );

        $this->createPayment($pendingOrder, PaymentMethod::BankTransfer, PaymentStatus::Unpaid, 650000);

        $waitingOrder = $this->createRentalOrder(
            'ORD-DEMO-0003',
            $customer,
            $vehicles['pickup_granmax'],
            $driverThree,
            OrderStatus::WaitingVerification,
            $now->copy()->addDays(4),
            $now->copy()->addDays(4)->addHours(8),
            420000,
            RentalUnit::Hour,
            8,
            PickupOption::PickupAtOffice,
        );

        $this->createPayment($waitingOrder, PaymentMethod::BankTransfer, PaymentStatus::WaitingVerification, 420000, transferProofUrl: 'demo/proofs/ord-demo-0003.png');

        $readyOrder = $this->createRentalOrder(
            'ORD-DEMO-0004',
            $loyalCustomer,
            $vehicles['minibus_hiace'],
            $driverThree,
            OrderStatus::ReadyToDispatch,
            $now->copy()->addDay(),
            $now->copy()->addDays(2),
            1300000,
            RentalUnit::Day,
            1,
            PickupOption::PickupAtOffice,
            isOutOfTown: true,
        );

        $this->createPayment($readyOrder, PaymentMethod::BankTransfer, PaymentStatus::Paid, 1300000, $admin, 'KWT-DEMO-0002', $now->copy()->subHour());

        $ongoingOrder = $this->createRentalOrder(
            'ORD-DEMO-0005',
            $loyalCustomer,
            $vehicles['mpv_xpander'],
            $driverOne,
            OrderStatus::Ongoing,
            $now->copy()->subHours(2),
            $now->copy()->addHours(6),
            560000,
            RentalUnit::Hour,
            8,
            PickupOption::DeliverToCustomer,
            deliveryAddress: 'Jl. Asia Afrika No. 5, Jakarta Selatan',
        );

        $this->createPayment($ongoingOrder, PaymentMethod::Cash, PaymentStatus::Paid, 560000, $cashier, 'KWT-DEMO-0003', $now->copy()->subHours(3));

        $overtimeOrder = $this->createRentalOrder(
            'ORD-DEMO-0006',
            $customer,
            $vehicles['sedan_city'],
            $driverTwo,
            OrderStatus::WaitingOvertimePayment,
            $now->copy()->subDays(2),
            $now->copy()->subDay(),
            780000,
            RentalUnit::Day,
            1,
            PickupOption::PickupAtOffice,
            actualReturnAt: $now->copy()->subDay()->addHours(3),
        );

        $this->createPayment($overtimeOrder, PaymentMethod::BankTransfer, PaymentStatus::Paid, 650000, $admin, 'KWT-DEMO-0004', $now->copy()->subDays(2)->addHour());
        $this->createPayment($overtimeOrder, PaymentMethod::BankTransfer, PaymentStatus::Unpaid, 130000);

        $draftUpgradeOrder = $this->createRentalOrder(
            'ORD-DEMO-0007',
            $customer,
            $vehicles['mpv_avanza'],
            $driverTwo,
            OrderStatus::Draft,
            $now->copy()->addDays(6),
            $now->copy()->addDays(7),
            650000,
            RentalUnit::Day,
            1,
            PickupOption::PickupAtOffice,
        );

        UpgradeOffer::create([
            'rental_order_id' => $draftUpgradeOrder->id,
            'original_vehicle_category_id' => $categories['mpv']->id,
            'upgraded_vehicle_id' => $vehicles['minibus_hiace']->id,
            'status' => OfferStatus::Pending,
        ]);

        $airportOrder = ShuttleOrder::create([
            'order_number' => 'SHT-DEMO-0001',
            'customer_id' => $customer->id,
            'shuttle_tariff_id' => $tariffs['airport']->id,
            'pickup_address' => 'Terminal 3 Kedatangan Domestik',
            'destination_address' => 'Jl. MH Thamrin No. 10, Jakarta Pusat',
            'estimated_distance_km' => 30.00,
            'estimated_duration_minutes' => 60,
            'scheduled_at' => $now->copy()->addDays(3),
            'status' => OrderStatus::PendingPayment,
            'total_amount' => 350000,
        ]);

        $this->createPayment($airportOrder, PaymentMethod::BankTransfer, PaymentStatus::Unpaid, 350000);

        $stationOrder = ShuttleOrder::create([
            'order_number' => 'SHT-DEMO-0002',
            'customer_id' => $loyalCustomer->id,
            'shuttle_tariff_id' => $tariffs['station']->id,
            'pickup_address' => 'Pintu Utara Stasiun Gambir',
            'destination_address' => 'Jl. Pajajaran No. 45, Bogor',
            'estimated_distance_km' => 56.00,
            'estimated_duration_minutes' => 95,
            'scheduled_at' => $now->copy()->addDays(5),
            'status' => OrderStatus::WaitingVerification,
            'total_amount' => 600000,
        ]);

        $this->createPayment($stationOrder, PaymentMethod::BankTransfer, PaymentStatus::WaitingVerification, 600000, transferProofUrl: 'demo/proofs/sht-demo-0002.png');

        // Seed additional customers and 30+ rental orders with varying statuses
        $extraCustomers = [];
        $customerNames = [
            'Andi Permana', 'Bayu Saputra', 'Cahya Utami', 'Dini Lestari',
            'Erlangga Putra', 'Farah Nabila', 'Gita Kusuma', 'Hendra Wijaya',
            'Indah Pertiwi', 'Jovan Kurnia', 'Kirana Dewi', 'Lukman Hakim',
        ];

        foreach ($customerNames as $idx => $custName) {
            $user = $this->createUser($custName, 'customer'.($idx + 3).'@urban8.com', UserRole::Customer);
            $extraCustomers[] = Customer::create([
                'user_id' => $user->id,
                'phone' => '0813-2000-'.str_pad((string) ($idx + 1), 4, '0', STR_PAD_LEFT),
                'address' => 'Jl. Merdeka No. '.($idx + 10).', Jakarta',
                'customer_type' => $idx % 4 === 0 ? CustomerType::Loyal : CustomerType::New,
                'total_completed_orders' => $idx % 4 === 0 ? 3 + $idx : 0,
            ]);
        }

        $allCustomers = array_merge([$customer, $loyalCustomer], $extraCustomers);

        // Gather drivers & available vehicles for random assignment
        $allDrivers = Driver::all()->all();
        $bookableVehicles = Vehicle::whereIn('status', [
            VehicleStatus::Available->value,
            VehicleStatus::InUse->value,
            VehicleStatus::Reserved->value,
        ])->get()->all();

        $orderStatusDistribution = [
            OrderStatus::PendingPayment, OrderStatus::PendingPayment, OrderStatus::PendingPayment,
            OrderStatus::WaitingVerification, OrderStatus::WaitingVerification,
            OrderStatus::Paid, OrderStatus::Paid,
            OrderStatus::ReadyToDispatch, OrderStatus::ReadyToDispatch,
            OrderStatus::Ongoing, OrderStatus::Ongoing, OrderStatus::Ongoing,
            OrderStatus::Completed, OrderStatus::Completed, OrderStatus::Completed,
            OrderStatus::Completed, OrderStatus::Completed, OrderStatus::Completed,
            OrderStatus::Cancelled, OrderStatus::Cancelled,
        ];

        $pickupOptions = [PickupOption::PickupAtOffice, PickupOption::DeliverToCustomer];
        $rentalUnitOptions = [RentalUnit::Day, RentalUnit::Day, RentalUnit::Day, RentalUnit::Hour];

        for ($i = 1; $i <= 35; $i++) {
            $orderNumber = 'ORD-BULK-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT);
            $status = $orderStatusDistribution[array_rand($orderStatusDistribution)];
            $pickedCustomer = $allCustomers[array_rand($allCustomers)];
            $pickedVehicle = $bookableVehicles[array_rand($bookableVehicles)];
            $pickedDriver = $allDrivers[array_rand($allDrivers)];
            $rentalUnit = $rentalUnitOptions[array_rand($rentalUnitOptions)];
            $pickupOption = $pickupOptions[array_rand($pickupOptions)];

            // Stagger timing based on status
            $offsetFromNow = match (true) {
                $status === OrderStatus::Completed => -(5 + ($i * 2) % 55),
                $status === OrderStatus::Cancelled => -(1 + ($i * 3) % 29),
                $status === OrderStatus::Ongoing => 0,
                $status === OrderStatus::WaitingOvertimePayment => -(1 + $i % 6),
                $status === OrderStatus::Paid, $status === OrderStatus::ReadyToDispatch => 1 + $i % 4,
                default => 2 + $i % 12,
            };

            $startAt = $now->copy()->addDays($offsetFromNow)->addHours(7 + ($i % 11));
            $duration = $rentalUnit === RentalUnit::Hour ? 4 + ($i % 9) : 1 + ($i % 5);
            $endAt = $rentalUnit === RentalUnit::Hour
                ? $startAt->copy()->addHours($duration)
                : $startAt->copy()->addDays($duration);

            $dayRates = [350000, 450000, 520000, 650000, 750000, 950000, 1200000];
            $dayRate = $dayRates[$i % count($dayRates)];
            $totalAmount = $rentalUnit === RentalUnit::Hour
                ? (int) round($dayRate / 8) * $duration
                : $dayRate * $duration;

            $actualReturnAt = $status === OrderStatus::Completed
                ? $endAt->copy()->addMinutes(($i % 3 === 0 ? -30 : 45))
                : null;

            $deliveryAddress = $pickupOption === PickupOption::DeliverToCustomer ? 'Jl. Kenanga No. '.$i.', Jakarta' : null;

            $bulkOrder = $this->createRentalOrder(
                $orderNumber,
                $pickedCustomer,
                $pickedVehicle,
                $pickedDriver,
                $status,
                $startAt,
                $endAt,
                $totalAmount,
                $rentalUnit,
                $duration,
                $pickupOption,
                $deliveryAddress,
                $i % 5 === 0,
                $actualReturnAt,
            );

            // Create matching payments based on order status
            $paymentMethods = [PaymentMethod::Cash, PaymentMethod::BankTransfer];

            match (true) {
                $status === OrderStatus::PendingPayment => $this->createPayment(
                    $bulkOrder,
                    $paymentMethods[$i % 2],
                    PaymentStatus::Unpaid,
                    $totalAmount,
                ),
                $status === OrderStatus::WaitingVerification => $this->createPayment(
                    $bulkOrder,
                    PaymentMethod::BankTransfer,
                    PaymentStatus::WaitingVerification,
                    $totalAmount,
                    transferProofUrl: 'demo/proofs/'.strtolower($orderNumber).'.png',
                ),
                $status === OrderStatus::Cancelled => $this->createPayment(
                    $bulkOrder,
                    PaymentMethod::BankTransfer,
                    PaymentStatus::Refunded,
                    $totalAmount,
                    $admin,
                    paidAt: $startAt->copy()->subDays(1),
                ),
                in_array($status, [
                    OrderStatus::Paid,
                    OrderStatus::ReadyToDispatch,
                    OrderStatus::Ongoing,
                    OrderStatus::Completed,
                ], true) => $this->createPayment(
                    $bulkOrder,
                    $paymentMethods[$i % 2],
                    PaymentStatus::Paid,
                    $totalAmount,
                    $i % 2 === 0 ? $cashier : $admin,
                    'KWT-BULK-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                    $startAt->copy()->subHours(1 + ($i % 47)),
                ),
                default => null,
            };
        }

        Setting::query()->upsert([
            ['key' => 'company_name', 'value' => 'URBAN 8 Rent Car'],
            ['key' => 'company_phone', 'value' => '+62 21 5555 0808'],
            ['key' => 'company_address', 'value' => 'Jl. Sudirman Kav. 8, Jakarta Pusat'],
        ], ['key'], ['value']);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'demo.seeded',
            'subject_type' => RentalOrder::class,
            'subject_id' => $readyOrder->id,
            'metadata' => [
                'description' => 'Data demo aplikasi URBAN 8 berhasil dibuat.',
                'accounts' => ['admin@rentcar.test', 'kasir@rentcar.test', 'customer@rentcar.test', 'driver@rentcar.test'],
            ],
        ]);
    }

    private function createUser(string $name, string $email, UserRole $role): User
    {
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password'),
        ]);

        $user->assignRole($role->value);

        return $user;
    }

    private function createVehicle(
        VehicleCategory $category,
        string $plateNumber,
        string $brand,
        string $model,
        int $year,
        VehicleStatus $status,
        string $currentLocation,
    ): Vehicle {
        return Vehicle::create([
            'vehicle_category_id' => $category->id,
            'plate_number' => $plateNumber,
            'brand' => $brand,
            'model' => $model,
            'year' => $year,
            'status' => $status,
            'current_location' => $currentLocation,
            'images' => null,
        ]);
    }

    /**
     * @param  array<string, VehicleCategory>  $categories
     */
    private function seedPricing(array $categories): void
    {
        $baseRates = [
            'sedan' => 450000,
            'mpv' => 650000,
            'pickup' => 520000,
            'box' => 750000,
            'minibus' => 1200000,
            'suv' => 950000,
            'hatchback' => 350000,
        ];

        foreach ($categories as $key => $category) {
            $dailyRate = $baseRates[$key];

            foreach ([
                RentalUnit::Hour->value => [3, 12, (int) round($dailyRate / 8), 0],
                RentalUnit::Day->value => [1, 6, $dailyRate, 0],
                RentalUnit::Week->value => [1, 3, $dailyRate * 6, 0.10],
                RentalUnit::Month->value => [1, 12, $dailyRate * 22, 0.20],
            ] as $unit => [$minDuration, $maxDuration, $baseRate, $discountRate]) {
                PricingRule::create([
                    'vehicle_category_id' => $category->id,
                    'rental_unit' => $unit,
                    'min_duration' => $minDuration,
                    'max_duration' => $maxDuration,
                    'base_rate' => $baseRate,
                    'discount_rate' => $discountRate,
                    'out_of_town_surcharge_rate' => 0.20,
                ]);
            }

            OvertimePenalty::create([
                'vehicle_category_id' => $category->id,
                'hourly_rate' => (int) round($dailyRate / 5),
            ]);
        }
    }

    private function createRentalOrder(
        string $orderNumber,
        Customer $customer,
        Vehicle $vehicle,
        Driver $driver,
        OrderStatus $status,
        Carbon $startAt,
        Carbon $endAt,
        int $totalAmount,
        RentalUnit $rentalUnit,
        int $duration,
        PickupOption $pickupOption,
        ?string $deliveryAddress = null,
        bool $isOutOfTown = false,
        ?Carbon $actualReturnAt = null,
    ): RentalOrder {
        return RentalOrder::create([
            'order_number' => $orderNumber,
            'customer_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
            'driver_id' => $driver->id,
            'status' => $status,
            'start_at' => $startAt,
            'end_at' => $endAt,
            'actual_return_at' => $actualReturnAt,
            'total_amount' => $totalAmount,
            'rental_unit' => $rentalUnit,
            'duration' => $duration,
            'is_out_of_town' => $isOutOfTown,
            'pickup_option' => $pickupOption,
            'delivery_address' => $deliveryAddress,
        ]);
    }

    private function createPayment(
        RentalOrder|ShuttleOrder $order,
        PaymentMethod $method,
        PaymentStatus $status,
        int $amount,
        ?User $verifier = null,
        ?string $receiptNumber = null,
        ?Carbon $paidAt = null,
        ?string $transferProofUrl = null,
    ): Payment {
        $payment = Payment::create([
            'orderable_id' => $order->id,
            'orderable_type' => $order::class,
            'method' => $method,
            'status' => $status,
            'amount' => $amount,
            'paid_at' => $paidAt,
            'transfer_proof_url' => $transferProofUrl,
            'verified_at' => $verifier ? ($paidAt ?? Carbon::now()) : null,
            'verified_by' => $verifier?->id,
        ]);

        if ($receiptNumber !== null) {
            Receipt::create([
                'payment_id' => $payment->id,
                'receipt_number' => $receiptNumber,
                'issued_at' => $paidAt ?? Carbon::now(),
                'pdf_url' => null,
            ]);
        }

        return $payment;
    }
}
