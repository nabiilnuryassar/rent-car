<?php

namespace Database\Seeders;

use App\Enums\CustomerType;
use App\Enums\DriverStatus;
use App\Enums\RentalUnit;
use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\OvertimePenalty;
use App\Models\PricingRule;
use App\Models\Setting;
use App\Models\ShuttleTariff;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * Production-ready master data seeder.
 *
 * Seeds only the operational data the application needs to run: roles, staff
 * and demo login accounts, the driver roster, the vehicle catalog, pricing
 * rules, overtime penalties, shuttle tariffs and company settings.
 *
 * No transactional data is seeded (no rental/shuttle orders, payments,
 * receipts, upgrade offers or audit logs). Driver and vehicle statuses are
 * limited to lifecycle-neutral values, because Reserved / OnDuty / InUse are
 * driven by the order lifecycle at runtime.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRoles();
        $this->seedStaffAccounts();
        $this->seedDemoCustomers();
        $this->seedDrivers();

        $categories = $this->seedVehicleCategories();
        $this->seedVehicles($categories);
        $this->seedPricing($categories);
        $this->seedShuttleTariffs();
        $this->seedSettings();
    }

    private function seedRoles(): void
    {
        collect(UserRole::cases())->each(
            fn (UserRole $role): Role => Role::findOrCreate($role->value),
        );
    }

    private function seedStaffAccounts(): void
    {
        $this->createUser('Administrator URBAN 8', 'admin@urban8.com', UserRole::Admin);
        $this->createUser('Kasir URBAN 8', 'kasir@urban8.com', UserRole::Cashier);
    }

    /**
     * Demo customer logins. Clean state: new customers with no order history.
     */
    private function seedDemoCustomers(): void
    {
        $demoCustomers = [
            ['Pelanggan Demo', 'customer@urban8.com', '0812-3456-7890', 'Jl. Merdeka No. 8, Jakarta Pusat'],
            ['Pelanggan Korporat', 'korporat@urban8.com', '0812-8888-0008', 'Jl. Prof. Dr. Satrio No. 18, Jakarta Selatan'],
        ];

        foreach ($demoCustomers as [$name, $email, $phone, $address]) {
            $user = $this->createUser($name, $email, UserRole::Customer);

            Customer::create([
                'user_id' => $user->id,
                'phone' => $phone,
                'address' => $address,
                'customer_type' => CustomerType::New,
                'total_completed_orders' => 0,
            ]);
        }
    }

    /**
     * Driver roster. Statuses are limited to Available / OffDuty / Inactive;
     * Reserved and OnDuty are assigned by the order lifecycle at runtime.
     */
    private function seedDrivers(): void
    {
        $drivers = [
            ['Budi Santoso', 'Pengemudi Eksekutif', 12, DriverStatus::Available],
            ['Raka Pratama', 'Pengemudi Antar-Jemput', 8, DriverStatus::Available],
            ['Sinta Maharani', 'Pengemudi Luar Kota', 10, DriverStatus::Available],
            ['Ahmad Sulaiman', 'Pengemudi Kota', 6, DriverStatus::Available],
            ['Dedi Kurniawan', 'Pengemudi Ekspres', 5, DriverStatus::Available],
            ['Eko Prasetyo', 'Pengemudi Kota', 7, DriverStatus::Available],
            ['Fajar Nugraha', 'Pengemudi Luar Kota', 9, DriverStatus::Available],
            ['Gilang Ramadhan', 'Pengemudi Antar-Jemput', 4, DriverStatus::Available],
            ['Hadi Santoso', 'Pengemudi Eksekutif', 11, DriverStatus::Available],
            ['Irfan Maulana', 'Pengemudi Kota', 3, DriverStatus::OffDuty],
            ['Joko Susilo', 'Pengemudi Ekspres', 6, DriverStatus::OffDuty],
            ['Krisna Bayu', 'Pengemudi Luar Kota', 8, DriverStatus::Inactive],
        ];

        foreach ($drivers as $idx => [$name, $title, $experience, $status]) {
            $sequence = $idx + 1;
            $user = $this->createUser($name, 'driver'.$sequence.'@urban8.com', UserRole::Driver);

            Driver::create([
                'user_id' => $user->id,
                'license_number' => 'SIM-A-'.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT),
                'phone' => '0812-1111-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT),
                'professional_title' => $title,
                'experience_years' => $experience,
                'status' => $status,
            ]);
        }
    }

    /**
     * @return array<string, VehicleCategory>
     */
    private function seedVehicleCategories(): array
    {
        return [
            'hatchback' => VehicleCategory::create([
                'name' => 'Hatchback',
                'class_level' => 1,
                'description' => 'Kendaraan mungil lincah untuk mobilitas perkotaan.',
                'is_active' => true,
            ]),
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
            'suv' => VehicleCategory::create([
                'name' => 'SUV',
                'class_level' => 3,
                'description' => 'Kendaraan tangguh untuk berbagai medan dan perjalanan jauh.',
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
        ];
    }

    /**
     * Vehicle catalog. Statuses are limited to Available / Maintenance /
     * Inactive; InUse and Reserved are driven by the order lifecycle.
     *
     * @param  array<string, VehicleCategory>  $categories
     */
    private function seedVehicles(array $categories): void
    {
        $fleet = [
            'hatchback' => [
                ['Honda', 'Brio', 2024, VehicleStatus::Available],
                ['Toyota', 'Agya', 2023, VehicleStatus::Available],
                ['Toyota', 'Yaris', 2023, VehicleStatus::Available],
                ['Suzuki', 'Baleno', 2022, VehicleStatus::Maintenance],
            ],
            'sedan' => [
                ['Honda', 'City', 2024, VehicleStatus::Available],
                ['Toyota', 'Vios', 2023, VehicleStatus::Available],
                ['Toyota', 'Corolla Altis', 2023, VehicleStatus::Available],
                ['Honda', 'Civic', 2022, VehicleStatus::Available],
                ['Toyota', 'Camry', 2021, VehicleStatus::Inactive],
            ],
            'mpv' => [
                ['Toyota', 'Avanza', 2024, VehicleStatus::Available],
                ['Toyota', 'Avanza', 2024, VehicleStatus::Available],
                ['Mitsubishi', 'Xpander', 2024, VehicleStatus::Available],
                ['Toyota', 'Innova Zenix', 2023, VehicleStatus::Available],
                ['Suzuki', 'Ertiga', 2023, VehicleStatus::Available],
                ['Daihatsu', 'Xenia', 2022, VehicleStatus::Maintenance],
            ],
            'suv' => [
                ['Toyota', 'Fortuner', 2024, VehicleStatus::Available],
                ['Mitsubishi', 'Pajero Sport', 2023, VehicleStatus::Available],
                ['Honda', 'CR-V', 2023, VehicleStatus::Available],
                ['Honda', 'HR-V', 2022, VehicleStatus::Available],
                ['Toyota', 'Rush', 2022, VehicleStatus::Available],
            ],
            'pickup' => [
                ['Daihatsu', 'Gran Max Pickup', 2023, VehicleStatus::Available],
                ['Suzuki', 'Carry Pickup', 2022, VehicleStatus::Available],
                ['Mitsubishi', 'Triton', 2022, VehicleStatus::Maintenance],
            ],
            'box' => [
                ['Mitsubishi', 'L300 Box', 2023, VehicleStatus::Available],
                ['Isuzu', 'Traga Box', 2022, VehicleStatus::Available],
                ['Hino', 'Dutro Box', 2021, VehicleStatus::Maintenance],
            ],
            'minibus' => [
                ['Toyota', 'Hiace Premio', 2024, VehicleStatus::Available],
                ['Toyota', 'Hiace Commuter', 2023, VehicleStatus::Available],
                ['Isuzu', 'Elf Microbus', 2022, VehicleStatus::Available],
            ],
        ];

        $plate = 1000;

        foreach ($fleet as $categoryKey => $units) {
            foreach ($units as [$brand, $model, $year, $status]) {
                $plate += 10;
                $location = $status === VehicleStatus::Maintenance
                    ? 'Bengkel Rekanan URBAN 8'
                    : ($status === VehicleStatus::Inactive ? 'Arsip Armada' : 'Kantor URBAN 8 Jakarta');

                $this->createVehicle(
                    $categories[$categoryKey],
                    'B '.$plate.' UBN',
                    $brand,
                    $model,
                    $year,
                    $status,
                    $location,
                );
            }
        }
    }

    /**
     * @param  array<string, VehicleCategory>  $categories
     */
    private function seedPricing(array $categories): void
    {
        $baseRates = [
            'hatchback' => 350000,
            'sedan' => 450000,
            'mpv' => 650000,
            'suv' => 950000,
            'pickup' => 520000,
            'box' => 750000,
            'minibus' => 1200000,
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

    private function seedShuttleTariffs(): void
    {
        $tariffs = [
            ['Bandara Soekarno-Hatta', 'Jakarta Pusat', 30.00, 60, 350000],
            ['Bandara Soekarno-Hatta', 'Jakarta Selatan', 35.00, 75, 400000],
            ['Stasiun Gambir', 'Bogor', 56.00, 95, 600000],
            ['Stasiun Gambir', 'Bekasi', 28.00, 70, 320000],
            ['Bandara Halim Perdanakusuma', 'Depok', 32.00, 80, 380000],
        ];

        foreach ($tariffs as [$from, $to, $distance, $duration, $tariff]) {
            ShuttleTariff::create([
                'area_from' => $from,
                'area_to' => $to,
                'estimated_distance_km' => $distance,
                'estimated_duration_minutes' => $duration,
                'tariff' => $tariff,
            ]);
        }
    }

    private function seedSettings(): void
    {
        Setting::query()->upsert([
            ['key' => 'company_name', 'value' => 'URBAN 8 Rent Car'],
            ['key' => 'company_phone', 'value' => '+62 21 5555 0808'],
            ['key' => 'company_address', 'value' => 'Jl. Sudirman Kav. 8, Jakarta Pusat'],
        ], ['key'], ['value']);
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
}
