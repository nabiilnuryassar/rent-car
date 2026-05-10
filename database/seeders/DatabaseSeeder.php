<?php

namespace Database\Seeders;

use App\Enums\DriverStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\RentalUnit;
use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\OvertimePenalty;
use App\Models\Payment;
use App\Models\PricingRule;
use App\Models\RentalOrder;
use App\Models\ShuttleTariff;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;
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

        $admin = User::factory()->create([
            'name' => 'Admin Rental',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole(UserRole::Admin->value);

        $cashier = User::factory()->create([
            'name' => 'Kasir Rental',
            'email' => 'kasir@example.com',
            'password' => Hash::make('password'),
        ]);
        $cashier->assignRole(UserRole::Cashier->value);

        $customerUser = User::factory()->create([
            'name' => 'Customer Rental',
            'email' => 'customer@example.com',
            'password' => Hash::make('password'),
        ]);
        $customerUser->assignRole(UserRole::Customer->value);

        Customer::factory()->for($customerUser)->create([
            'phone' => '081234567890',
            'address' => 'Jl. Rental Utama No. 1',
        ]);

        $driverUser = User::factory()->create([
            'name' => 'Driver Rental',
            'email' => 'driver@example.com',
            'password' => Hash::make('password'),
        ]);
        $driverUser->assignRole(UserRole::Driver->value);

        Driver::factory()->for($driverUser)->create([
            'license_number' => 'SIM-A-000001',
            'phone' => '081234567891',
            'status' => DriverStatus::Available,
        ]);

        $mpv = VehicleCategory::factory()->create([
            'name' => 'MPV',
            'class_level' => 2,
            'description' => 'Kendaraan keluarga untuk rental dalam dan luar kota.',
        ]);

        // More Categories
        $sedan = VehicleCategory::factory()->create([
            'name' => 'Sedan',
            'class_level' => 1,
            'description' => 'Mobil compact untuk perjalanan bisnis atau pribadi.',
        ]);

        $mobilBox = VehicleCategory::factory()->create([
            'name' => 'Mobil Box',
            'class_level' => 3,
            'description' => 'Kendaraan angkut barang tertutup.',
        ]);

        $minibus = VehicleCategory::factory()->create([
            'name' => 'Minibus',
            'class_level' => 4,
            'description' => 'Kendaraan penumpang kapasitas besar (Hiace/Elf).',
        ]);

        // Vehicles
        Vehicle::factory()->for($mpv, 'category')->create([
            'plate_number' => 'B 1234 RNT',
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2024,
            'status' => VehicleStatus::Available,
        ]);

        Vehicle::factory()->for($sedan, 'category')->create([
            'plate_number' => 'B 5678 RNT',
            'brand' => 'Honda',
            'model' => 'City',
            'year' => 2023,
            'status' => VehicleStatus::Available,
        ]);

        // Pricing Rules
        foreach ([$sedan, $mpv, $mobilBox, $minibus] as $index => $cat) {
            $basePrice = 100000 * ($index + 1);

            // Hourly
            PricingRule::create([
                'vehicle_category_id' => $cat->id,
                'rental_unit' => RentalUnit::Hour,
                'min_duration' => 3,
                'max_duration' => 12,
                'base_rate' => $basePrice / 10,
            ]);

            // Daily
            PricingRule::create([
                'vehicle_category_id' => $cat->id,
                'rental_unit' => RentalUnit::Day,
                'min_duration' => 1,
                'max_duration' => 6,
                'base_rate' => $basePrice,
            ]);

            // Overtime
            OvertimePenalty::create([
                'vehicle_category_id' => $cat->id,
                'hourly_rate' => $basePrice / 5,
            ]);
        }

        // Shuttle Tariffs
        ShuttleTariff::create([
            'area_from' => 'Bandara Soekarno-Hatta',
            'area_to' => 'Pusat Kota Jakarta',
            'estimated_distance_km' => 30.00,
            'estimated_duration_minutes' => 60,
            'tariff' => 350000,
        ]);

        ShuttleTariff::create([
            'area_from' => 'Stasiun Gambir',
            'area_to' => 'Bogor',
            'estimated_distance_km' => 50.00,
            'estimated_duration_minutes' => 90,
            'tariff' => 600000,
        ]);

        // Sample Rental Order
        $order = RentalOrder::factory()->create([
            'customer_id' => $customerUser->customer->id,
            'status' => OrderStatus::PendingPayment,
            'total_amount' => 500000,
        ]);

        Payment::factory()->create([
            'orderable_id' => $order->id,
            'orderable_type' => RentalOrder::class,
            'amount' => 500000,
            'status' => PaymentStatus::Unpaid,
        ]);
    }
}
