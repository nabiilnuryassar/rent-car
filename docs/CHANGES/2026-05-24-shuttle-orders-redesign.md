# Shuttle Orders UI Redesign & Route Alignment

Date: 2026-05-24  
Area: frontend | backend | shared  
Type: feat | refactor

## Context

The customer shuttle orders pages had a disconnected styling compared to the main premium catalog and rental orders UI. Additionally, the route for booking shuttle was deeply nested (`/customer/shuttle-orders/create`). This task makes the design uniform and maps the route to `/shuttle`.

## What changed

- **Backend Routing (`routes/web.php`)**: Excluded the `create` action from the prefixed resource group, mapped `/shuttle` directly to `ShuttleOrderController@create` (naming it `customer.shuttle-orders.create`), and added a 301 redirect from `/customer/shuttle-orders/create` to `/shuttle`.
- **Frontend Layouts (`customer-layout.tsx`, `MobileBottomNav.tsx`)**: Updated the "Shuttle" nav links to point to `/shuttle` instead of `/customer/shuttle-orders/create`.
- **Driver Portal Layout (`driver-layout.tsx`)**: Fixed mobile header position to remain sticky on scroll by removing `overflow-hidden` on the outer phone container. Compacted spacing (reduced margins, font sizes, avatar sizing) to make it neat and screen-efficient.
- **Frontend Page Components**:
  - `create.tsx` (Booking Form): Redesigned to use `CustomerLayout`, route selections styled as radio cards with custom icons, and form inputs formatted with appropriate focus states and shadows.
  - `index.tsx` (Orders List): Redesigned to use `CustomerLayout` and styled as modern route list cards with status color badges and full pagination.
  - `show.tsx` (Order Details): Redesigned to use `CustomerLayout`, detail metadata grids, progress timeline, and payment upload options.
- **TypeScript Fix**: Resolved pre-existing type mismatch in `catalog/show.tsx`.

## Impact

- Consistent visual experience across car rentals and shuttle bookings.
- Simplifies the shuttle booking entry point to `/shuttle`.
- Backward-compatible redirect prevents broken links or bookmarks.
- Fixed scroll tracking on mobile driver portal topbar header, making it properly fixed and compact.

## How to test

- Run the automated test suite with `php artisan test --compact` to verify zero regressions.
- Run type checks with `npm run types:check` to ensure zero typescript compile-time errors.
- Manually navigate to `http://localhost:8080/shuttle` or click on "Shuttle" in the navigation menus, select a route, input pickup/destination and scheduled details, and create the order.
- Verify that lists at `/customer/shuttle-orders` and details at `/customer/shuttle-orders/{id}` display matching premium styling.

## Rollback plan

- Revert modified files (`routes/web.php`, layouts, and `resources/js/pages/customer/shuttle-orders/*`) using git command.
