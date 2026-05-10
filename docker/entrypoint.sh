#!/usr/bin/env bash
# Laravel entrypoint for production container.
# Runs only on the initial container start. Safe to re-run.

set -euo pipefail

cd /var/www/html

# -------------------------------------------------------------
# 1. Ensure APP_KEY is present
# -------------------------------------------------------------
if [ -z "${APP_KEY:-}" ]; then
    echo "[entrypoint] WARN: APP_KEY is empty. Generating one (ephemeral)."
    php artisan key:generate --force --ansi || true
fi

# -------------------------------------------------------------
# 2. Wait for database to be reachable
# -------------------------------------------------------------
if [ "${DB_CONNECTION:-pgsql}" = "pgsql" ] && [ -n "${DB_HOST:-}" ]; then
    echo "[entrypoint] Waiting for PostgreSQL ${DB_HOST}:${DB_PORT:-5432}..."
    tries=0
    until pg_isready -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" -d "${DB_DATABASE:-postgres}" >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [ "$tries" -ge 60 ]; then
            echo "[entrypoint] ERROR: PostgreSQL not reachable after 60s. Continuing anyway."
            break
        fi
        sleep 1
    done
fi

# -------------------------------------------------------------
# 3. Ensure writable dirs (in case volume mount clobbered perms)
# -------------------------------------------------------------
mkdir -p storage/app/public storage/app/private \
         storage/framework/cache \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache

chown -R laravel:laravel storage bootstrap/cache 2>/dev/null || true

# -------------------------------------------------------------
# 4. Cache Laravel config/routes/views (production performance)
# -------------------------------------------------------------
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "[entrypoint] Caching config/routes/views/events..."
    php artisan config:cache --ansi
    php artisan route:cache --ansi || true
    php artisan view:cache --ansi || true
    php artisan event:cache --ansi || true
fi

# -------------------------------------------------------------
# 5. Run migrations (default: enabled)
# -------------------------------------------------------------
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "[entrypoint] Running database migrations..."
    php artisan migrate --force --ansi
fi

# -------------------------------------------------------------
# 6. Optional one-shot tasks
# -------------------------------------------------------------
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    echo "[entrypoint] Running database seeders..."
    php artisan db:seed --force --ansi
fi

if [ "${LINK_STORAGE:-true}" = "true" ]; then
    # storage:link is idempotent but harmless if skipped
    php artisan storage:link --force --ansi || true
fi

# -------------------------------------------------------------
# 7. Exec supplied command (default: supervisord)
# -------------------------------------------------------------
echo "[entrypoint] Starting: $*"
exec "$@"
