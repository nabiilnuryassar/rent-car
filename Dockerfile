# syntax=docker/dockerfile:1.7

# ============================================================================
# Stage 1a: Wayfinder code generation (PHP + Composer)
# ============================================================================
FROM php:8.4-cli-alpine AS wayfinder

# PHP extensions needed for artisan to boot + wayfinder
# Install runtime libs first so they survive .build-deps deletion
RUN apk add --no-cache \
        libpq \
        libpng \
        icu-libs \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        postgresql-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        libpng-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        zip \
        opcache \
        pcntl \
        mbstring \
        gd \
    && apk del --no-cache .build-deps

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-autoloader --no-interaction --no-progress

COPY . .
RUN cp .env.example .env \
    && composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && php artisan wayfinder:generate --no-ansi

# ============================================================================
# Stage 1b: Frontend build (PHP 8.4 + Node 22 for Wayfinder + Vite)
# ============================================================================
FROM php:8.4-cli-alpine AS frontend

# Install Node.js 24 (from Alpine 3.23 community repo)
RUN apk add --no-cache nodejs npm

# PHP extensions needed for artisan to boot
RUN apk add --no-cache \
        libpq \
        libpng \
        icu-libs \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        postgresql-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        libpng-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        zip \
        opcache \
        pcntl \
        mbstring \
        gd \
    && apk del --no-cache .build-deps

WORKDIR /app

# Install frontend deps first for better cache
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy vendor + generated files from wayfinder stage
COPY --from=wayfinder /app/vendor /app/vendor
COPY --from=wayfinder /app/resources/js/routes /app/resources/js/routes
COPY --from=wayfinder /app/resources/js/actions /app/resources/js/actions

# Copy source last
COPY . .

# php artisan wayfinder:generate runs automatically via vite plugin
RUN cp .env.example .env \
    && npm run build


# ============================================================================
# Stage 2: Composer dependencies (no dev) — PHP 8.4 with all extensions
# ============================================================================
FROM php:8.4-cli-alpine AS vendor

RUN apk add --no-cache --virtual .build-deps \
        build-base \
        postgresql-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        libpng-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        zip \
        opcache \
        pcntl \
        mbstring \
        gd \
    && apk del --no-cache .build-deps

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-scripts \
    --no-autoloader \
    --no-interaction \
    --no-progress

COPY . .

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative


# ============================================================================
# Stage 3: Production runtime (PHP-FPM 8.4)
# ============================================================================
FROM php:8.4-fpm-alpine AS runtime

ARG WWWUSER=1000
ARG WWWGROUP=1000

# System deps + PHP extensions required by Laravel + PostgreSQL
# Install runtime libs as real packages so they survive .build-deps deletion
RUN apk add --no-cache \
        bash \
        curl \
        tini \
        nginx \
        supervisor \
        postgresql-client \
        git \
        # Runtime libraries needed by PHP extensions
        libpq \
        libpng \
        icu-libs \
        libzip \
        libjpeg-turbo \
        freetype \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        autoconf \
        postgresql-dev \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        zip \
        opcache \
        pcntl \
        gd \
        mbstring \
        exif \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del --no-cache .build-deps

# Non-root user
RUN addgroup -g ${WWWGROUP} -S laravel \
    && adduser -u ${WWWUSER} -S laravel -G laravel -s /bin/bash \
    && mkdir -p /var/log/supervisord /var/run/supervisord /var/log/nginx /var/lib/nginx /var/lib/nginx/tmp /run/nginx \
    && chown -R laravel:laravel /var/log/supervisord /var/run/supervisord /var/log/nginx /var/lib/nginx /run/nginx

# PHP production config
RUN rm -f /usr/local/etc/php-fpm.d/zz-docker.conf \
    && rm -f /usr/local/etc/php-fpm.d/www.conf \
    && rm -f /usr/local/etc/php-fpm.d/www.conf.default \
    && rm -f /usr/local/etc/php-fpm.d/docker.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-laravel.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-laravel.conf
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/10-opcache.ini

# Nginx config
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Supervisor config (runs nginx + php-fpm + queue worker + scheduler)
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

# Copy vendor + app code
COPY --chown=laravel:laravel --from=vendor /app /var/www/html

# Copy frontend build output
COPY --chown=laravel:laravel --from=frontend /app/public/build /var/www/html/public/build

# Ensure writable dirs exist and owned by laravel
RUN mkdir -p storage/app/public \
        storage/app/private \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R laravel:laravel storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

EXPOSE 8080

# tini keeps PID 1 sane; entrypoint runs migrations + caches then starts supervisord
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
