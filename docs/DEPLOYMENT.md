# 🐳 Docker Deployment Guide

> **For:** Rent Car Platform (Laravel 13 + Inertia React + PostgreSQL + Redis)
> **Last Updated:** 2026-05-10

---

## 📁 File Structure

```
rent-car/
├── Dockerfile                       # Multi-stage build (frontend + vendor + runtime)
├── .dockerignore                    # Files excluded from image
├── docker-compose.dev.yml           # Local development stack
├── docker-compose.prod.yml          # Production stack
├── .env.docker.example              # Env template for prod
└── docker/
    ├── entrypoint.sh                # Boot script (migrate, cache, etc.)
    ├── nginx/
    │   ├── nginx.conf               # Global nginx config
    │   └── default.conf             # Laravel vhost
    ├── php/
    │   ├── php.ini                  # PHP production tuning
    │   ├── www.conf                 # PHP-FPM pool
    │   └── opcache.ini              # OPcache + JIT settings
    └── supervisor/
        └── supervisord.conf         # Manages nginx + php-fpm + queue + scheduler
```

---

## 🚀 Quick Start (Production)

### 1. Prepare environment

```bash
cp .env.docker.example .env.docker
# Edit .env.docker and set:
#   - APP_KEY (generate with: docker run --rm rent-car:latest php artisan key:generate --show)
#   - DB_PASSWORD (strong password)
#   - APP_URL (your domain)
#   - MAIL_* (your SMTP credentials)
```

### 2. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This starts:

- **app** — Laravel + nginx + php-fpm + queue worker + scheduler (port 8080)
- **postgres** — PostgreSQL 16 (internal only)
- **redis** — Redis 7 for cache/session/queue (internal only)

### 3. First-run checks

```bash
# Check containers are healthy
docker compose -f docker-compose.prod.yml ps

# Tail logs
docker compose -f docker-compose.prod.yml logs -f app

# Verify HTTP health
curl http://localhost:8080/healthz
# → "ok"
```

### 4. Seed initial data (optional, one-off)

```bash
docker compose -f docker-compose.prod.yml exec app \
    php artisan db:seed --force
```

---

## 🧪 Local Development

```bash
# Build and start
docker compose -f docker-compose.dev.yml up -d

# Run Vite on host (faster HMR)
npm install
npm run dev

# Open browser
open http://localhost:8080
```

Includes **Mailpit** at http://localhost:8025 for email testing.

Default seeded accounts:

| Role     | Email                 | Password |
| -------- | --------------------- | -------- |
| Admin    | admin@rentcar.test    | password |
| Kasir    | kasir@rentcar.test    | password |
| Customer | customer@rentcar.test | password |
| Driver   | driver@rentcar.test   | password |

---

## 🏗️ Architecture

### Multi-Stage Build

| Stage      | Purpose                                 | Output                |
| ---------- | --------------------------------------- | --------------------- |
| `frontend` | Node 22 + npm ci + vite build           | `public/build/*`      |
| `vendor`   | Composer 2 install --no-dev + autoload  | `vendor/*`            |
| `runtime`  | PHP 8.3-fpm-alpine + nginx + supervisor | Final image (~180 MB) |

### Runtime Processes (managed by Supervisor)

| Process     | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `php-fpm`   | PHP worker pool (20 children, tuned for containers) |
| `nginx`     | HTTP front-end on port 8080                         |
| `queue`     | 2× `queue:work` workers for notifications           |
| `scheduler` | `schedule:run` every 60 seconds                     |

### Container Boot Sequence (entrypoint.sh)

1. Generate `APP_KEY` if missing
2. Wait for PostgreSQL to be ready (up to 60s)
3. Ensure writable storage/bootstrap/cache dirs
4. Cache config/routes/views/events (production only)
5. Run `php artisan migrate --force`
6. Run seeders if `RUN_SEEDERS=true`
7. Run `storage:link`
8. `exec` supervisord

---

## 🔧 Common Operations

### Run artisan commands

```bash
docker compose -f docker-compose.prod.yml exec app php artisan ...
```

### Rebuild image after code changes

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Scale app behind external load balancer

```bash
docker compose -f docker-compose.prod.yml up -d --scale app=3
```

Put nginx, Traefik, or a cloud LB in front of port 8080. Ensure you set `TRUSTED_PROXIES=*` in `.env.docker` so Laravel trusts `X-Forwarded-For` and `X-Forwarded-Proto`.

### Access database

```bash
docker compose -f docker-compose.prod.yml exec postgres \
    psql -U rentcar -d rentcar
```

### Backup database

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U rentcar rentcar > backup-$(date +%F).sql
```

### Restore database

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
    psql -U rentcar rentcar < backup-2026-05-10.sql
```

### Run queue manually (outside supervisor)

```bash
docker compose -f docker-compose.prod.yml exec app \
    php artisan queue:work --once
```

### Tail logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Only app
docker compose -f docker-compose.prod.yml logs -f app

# Inside container
docker compose -f docker-compose.prod.yml exec app \
    tail -f storage/logs/laravel.log
```

---

## 🔐 Security Checklist (Before Production)

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] `APP_KEY` is set to a unique 32-byte key (base64)
- [ ] `DB_PASSWORD` changed from default
- [ ] `SESSION_ENCRYPT=true` + `SESSION_SECURE_COOKIE=true` (HTTPS only)
- [ ] HTTPS terminated at LB/CDN (Cloudflare, ALB, Traefik)
- [ ] `TRUSTED_PROXIES` configured for your LB
- [ ] Mail credentials configured (for email verification)
- [ ] Transfer proof storage uses S3 in high-traffic environments
- [ ] Regular `pg_dump` backups scheduled
- [ ] Redis not exposed externally
- [ ] PostgreSQL not exposed externally
- [ ] Rate limit login routes (already in Laravel via `RouteServiceProvider`)
- [ ] Set up monitoring (Sentry, DataDog, or similar)
- [ ] Enable Laravel telescope **only** in staging

---

## 🧱 Resource Requirements

### Minimum (small deployment, <100 concurrent users)

| Service   | CPU         | RAM       |
| --------- | ----------- | --------- |
| app       | 1 vCPU      | 1 GB      |
| postgres  | 0.5 vCPU    | 512 MB    |
| redis     | 0.25 vCPU   | 128 MB    |
| **Total** | **~2 vCPU** | **~2 GB** |

### Recommended (medium, 500+ concurrent)

| Service                     | CPU         | RAM       |
| --------------------------- | ----------- | --------- |
| app (×3 replicas)           | 2 vCPU each | 2 GB each |
| postgres (managed RDS)      | 2 vCPU      | 4 GB      |
| redis (managed ElastiCache) | 1 vCPU      | 1 GB      |

For medium+ scale, **extract Postgres and Redis into managed services** (AWS RDS / ElastiCache, GCP Cloud SQL / Memorystore, DigitalOcean Managed DB) and keep only `app` in Compose/K8s.

---

## ☁️ Cloud Deployment Patterns

### Option 1: Docker Compose on VPS (simplest)

DigitalOcean Droplet / Hetzner Cloud / AWS Lightsail:

```bash
# On the server
git clone <repo>
cd rent-car
cp .env.docker.example .env.docker
# Fill in .env.docker
docker compose -f docker-compose.prod.yml up -d --build
```

Put nginx/Caddy or Cloudflare Tunnel in front for TLS.

### Option 2: Kubernetes

Convert Compose → Kubernetes manifests using `kompose` or write custom Helm chart. Key points:

- **app** becomes a `Deployment` with HPA (min 2, max 10 replicas)
- **Postgres/Redis** use managed cloud services (don't run in cluster for production)
- Persistent volume for `storage/app/public` (or switch `FILESYSTEM_DISK=s3`)
- `readinessProbe: GET /healthz`
- Separate `CronJob` or `schedule` sidecar for `schedule:run`

### Option 3: AWS ECS / Fargate

- Push `rent-car:latest` to ECR
- Create Task Definition with single container
- Use RDS Postgres + ElastiCache Redis
- Target Group health check on `/healthz`
- Session + cache on Redis ensures stateless app

### Option 4: Platform-as-a-Service

**Fly.io / Railway / Render:** Simply connect repo; they auto-detect Dockerfile. Set env vars from `.env.docker.example`, attach managed Postgres + Redis add-ons.

---

## 🧪 Test the Image Locally

```bash
# 1. Build
docker build -t rent-car:test .

# 2. Generate a key
APP_KEY=$(docker run --rm rent-car:test php artisan key:generate --show)

# 3. Run standalone (no compose)
docker run -d \
    --name rentcar-test \
    -p 8080:8080 \
    -e APP_KEY="$APP_KEY" \
    -e APP_URL=http://localhost:8080 \
    -e DB_CONNECTION=sqlite \
    -e CACHE_STORE=file \
    -e SESSION_DRIVER=file \
    -e QUEUE_CONNECTION=sync \
    rent-car:test

# 4. Check
curl http://localhost:8080/healthz
docker logs rentcar-test

# 5. Cleanup
docker rm -f rentcar-test
```

---

## 🐛 Troubleshooting

### Container restarts repeatedly

```bash
docker compose -f docker-compose.prod.yml logs app | tail -50
```

Common causes:

- `APP_KEY` empty and entrypoint cannot generate
- Database credentials wrong
- Storage permissions (`docker compose down -v` then restart)

### 502 Bad Gateway

nginx can't reach php-fpm. Check:

```bash
docker compose -f docker-compose.prod.yml exec app \
    ps aux | grep -E 'nginx|php-fpm'
```

Both should be running.

### Migrations fail

```bash
docker compose -f docker-compose.prod.yml exec app \
    php artisan migrate:status
```

### Mixed content (HTTP assets on HTTPS page)

Set `APP_URL=https://yourdomain.com` and configure `TRUSTED_PROXIES=*` in `.env.docker`. The nginx vhost already forwards `X-Forwarded-Proto`.

### Out of memory during build

```bash
# Increase Docker memory to 4 GB+
# Or build with less parallelism
docker build --memory=4g -t rent-car:latest .
```

### Frontend build fails

```bash
# Build only the frontend stage
docker build --target frontend -t rent-car:frontend .
```

---

## 📦 Image Size Optimization

Current image: **~180 MB** (alpine + PHP 8.3 + built assets).

Further optimization:

- Use `distroless` base (lose shell access)
- Split app + web into two containers (nginx + php-fpm separately)
- Use BuildKit cache mount for composer/npm

---

## 🔄 CI/CD Integration

### GitHub Actions example

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy
on:
    push:
        branches: [main]

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: docker/setup-buildx-action@v3
            - uses: docker/login-action@v3
              with:
                  registry: ghcr.io
                  username: ${{ github.actor }}
                  password: ${{ secrets.GITHUB_TOKEN }}
            - uses: docker/build-push-action@v5
              with:
                  context: .
                  push: true
                  tags: ghcr.io/${{ github.repository }}:latest
                  cache-from: type=gha
                  cache-to: type=gha,mode=max
```

---

## 📚 References

- [Laravel Deployment Docs](https://laravel.com/docs/13.x/deployment)
- [PHP-FPM Tuning](https://www.php.net/manual/en/install.fpm.configuration.php)
- [OPcache Production](https://www.php.net/manual/en/opcache.configuration.php)
- [Nginx + Laravel](https://laravel.com/docs/13.x/deployment#nginx)
