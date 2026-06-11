# Rent Car — URBAN 8

Sistem penyewaan kendaraan berbasis web untuk mengelola katalog armada, pemesanan, pengemudi, pembayaran, kuitansi, laporan, dan layanan antar-jemput.

## Tech Stack

- **Backend:** PHP 8.3+, Laravel 13, Fortify, Inertia Laravel, Spatie Permission
- **Frontend:** React 19, TypeScript, Inertia React, Vite, Tailwind CSS 4
- **Database:** PostgreSQL
- **Cache/Queue:** Redis
- **Testing:** Pest PHP
- **Deployment:** Docker, Nginx, PHP-FPM, Supervisor

## Fitur Utama

- Autentikasi dan role akses: admin, kasir, customer, driver
- Katalog kendaraan berdasarkan kategori
- Pemesanan rental kendaraan
- Pemilihan dan penugasan driver
- Verifikasi pembayaran transfer dan pencatatan pembayaran cash
- Kuitansi otomatis
- Lifecycle order: siap dikirim, dikirim, berlangsung, pengembalian, selesai, batal
- Perhitungan overtime dan pembayaran denda keterlambatan
- Layanan shuttle / antar-jemput
- Dashboard admin/kasir/customer/driver
- Laporan operasional dan pembayaran
- Pengaturan profil customer dan driver

## Akun Demo Seeder

Semua akun demo memakai password:

```txt
password
```

| Role | Email |
| --- | --- |
| Admin | `admin@urban8.com` |
| Kasir | `kasir@urban8.com` |
| Customer | `customer@urban8.com` |
| Customer loyal | `loyal@urban8.com` |
| Driver | `driver@urban8.com` |
| Driver 2 | `driver2@urban8.com` |
| Driver 3 | `driver3@urban8.com` |

## Setup Lokal

### Prasyarat

- PHP 8.3+
- Composer
- Node.js 22+
- PostgreSQL
- Redis

### Instalasi

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi database di `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=rentcar
DB_USERNAME=rentcar
DB_PASSWORD=secret
```

Jalankan migrasi dan seeder:

```bash
php artisan migrate --seed
```

Build frontend:

```bash
npm run build
```

Jalankan aplikasi development:

```bash
composer run dev
```

Atau jalankan backend dan frontend terpisah:

```bash
php artisan serve
npm run dev
```

## Setup Cepat via Composer Script

Project menyediakan script setup:

```bash
composer run setup
```

Script ini akan menjalankan instalasi dependency, membuat `.env`, generate key, migrasi database, install dependency frontend, dan build asset.

## Docker

Build image production:

```bash
docker build -t rent-car:latest .
```

Jalankan compose production sesuai file yang tersedia:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Health check:

```txt
/healthz
```

## Quality Check

PHP format check:

```bash
composer run lint:check
```

TypeScript check:

```bash
npm run types:check
```

Frontend lint:

```bash
npm run lint:check
```

Test:

```bash
php artisan test
```

Full CI check:

```bash
composer run ci:check
```

## Struktur Folder Penting

```txt
app/                Logic Laravel: models, controllers, services, actions
config/             Konfigurasi aplikasi
database/           Migrations, factories, seeders
resources/js/       Frontend React/Inertia
routes/             Route aplikasi
tests/              Test Pest
docker/             Konfigurasi Docker, Nginx, PHP, Supervisor
docs/               Dokumentasi proyek, UML, guide book, changelog
```

## Catatan Deployment

- Jangan commit `.env`, credential server, atau secret production.
- Gunakan `.env.example` sebagai template konfigurasi.
- Production image menjalankan Nginx dan PHP-FPM dalam satu container, sehingga `docker/nginx/default.conf` memakai `fastcgi_pass 127.0.0.1:9000`.
- Rule pengiriman kendaraan mengikuti alur bisnis H-1: `RENTAL_DISPATCH_WINDOW_HOURS=24`.
