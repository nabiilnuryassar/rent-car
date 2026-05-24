# Driver Portal Layout and Route Cache Fixes

Date: 2026-05-23
Area: shared, docker  
Type: fix

## Context

The driver portal orders page (`/driver/orders`) was throwing a 500 Internal Server Error:
> `Target class [App\Http\Controllers\Driver\OrderController] does not exist.`

**Root cause:** The app runs in Docker at `localhost:8080`. The `docker-compose.dev.yml` uses an anonymous volume for `/var/www/html/vendor`, which is separate from the host filesystem. The `Dockerfile.dev` builds the Composer classmap with `--classmap-authoritative`, which bakes the classmap at image build time. When `Driver\OrderController` was added after the image was built, the anonymous vendor volume inside the container had a stale classmap missing the new controller — so PHP's `ReflectionClass` could not find it.

Additionally, when in mobile view, the driver topbar/main content border-radius classes caused two white semi-circular gap/hole visual defects on the left and right corners of the screen (under the sticky header and page heading band).

## What changed

- **Immediate hotfix**: Copied the updated `vendor/composer/autoload_classmap.php` and `autoload_static.php` from host to the running container via `docker compose cp` and cleared all Laravel caches inside the container.
- **Long-term fix (Dockerfile.dev)**: Removed `--classmap-authoritative` from the Stage 2 `composer dump-autoload` command. Without this flag, Composer uses PSR-4 autoloading as fallback, which scans the filesystem for any class not found in the classmap. New PHP files added after image build will now be found automatically.
- **Long-term fix (Dockerfile.dev)**: Added `COPY --from=composer:2.8` to the runtime stage so Composer binary is available inside the container.
- **Long-term fix (docker/entrypoint.sh)**: Added a step that runs `composer dump-autoload --optimize` automatically at container start when `APP_ENV=local`. This ensures the classmap is always up-to-date on container restart.
- **UI fix**: Modified [driver-layout.tsx](file:///c:/laragon/www/rent-car/resources/js/layouts/driver-layout.tsx) to change `rounded-t-[24px]` to `md:rounded-t-[24px]` so the main content container has flat corners on mobile, removing the white corner gaps.

## Impact

- The driver orders page (`/driver/orders`) now loads correctly in Docker dev environment.
- Future PHP class additions will not require Docker image rebuild to be recognized by the autoloader.
- The mobile driver UI looks visually seamless without side gaps at the top header boundary.

## How to test

- Visit `http://localhost:8080/driver/orders` — should render the orders page correctly.
- Run tests: `docker compose -f docker-compose.dev.yml exec app php artisan test --filter=DriverPortalTest`
- Open the driver page on a mobile device or responsive simulator and check that there are no white holes/gaps on the sides under the navy blue top header.
- After rebuilding the image, add a new PHP class, restart the container, and verify it is autoloaded without a 500 error.

## Rollback plan

- To revert Docker fixes: run `git checkout Dockerfile.dev docker/entrypoint.sh`
- To revert UI fix: run `git checkout resources/js/layouts/driver-layout.tsx`
- If classmap is stale again before a rebuild: run `docker compose -f docker-compose.dev.yml cp vendor/composer/autoload_classmap.php app:/var/www/html/vendor/composer/autoload_classmap.php`
