# Catalog UI Improvements & Auth Flow Refinement

Date: 2026-05-09  
Area: frontend, auth  
Type: feat, refactor

## Context

The user provided feedback on the initial revamp, noting that the primary color (Navy Blue) was underutilized in the customer catalog and mobile navigation. Additionally, there was a layout overlap issue with the branding text on desktop, and the authentication flow for booking was not yet enforced.

## What changed

- **UI Branding Enhancements**:
    - **MobileBottomNav**: Changed background to Navy Blue with Amber accents for active states.
    - **CatalogIndex**: Strengthened typography and updated header components with more Navy Blue accents.
    - **VehicleCard**: Replaced success badges with Navy Blue variants and increased font weights for brand consistency.
- **Layout Fixes**:
    - **CustomerLayout**: Reduced font size of "Fleet Rental Management" and adjusted sidebar width/spacing to prevent overlapping with main content cards.
- **Authentication & Navigation Flow**:
    - **Auth Enforcement**: Protected the `catalog.show` route with `auth` middleware, causing "Gas Booking" clicks to trigger a login redirect for unauthenticated users.
    - **Redirect Logic**: Updated `DashboardRedirectController` to send customers directly to the `/catalog` index after login.
    - **Route Cleanup**: Removed the `/customer/dashboard` route as it is no longer part of the intended user journey.
    - **Catalog Show**: Created the missing `resources/js/pages/catalog/show.tsx` to handle category-specific vehicle listings.

## Impact

- **User Experience**: Customers now have a more brand-aligned experience and are correctly funneled into the authentication flow when attempting to book a vehicle.
- **Architecture**: Simplified the customer navigation by removing the redundant dashboard page.

## How to test

1.  Visit `/catalog` as a guest.
2.  Observe the new Navy Blue branding in headers and cards.
3.  Click "Book This Vehicle" (Gas Booking). Verify it redirects to the login page.
4.  Login as a customer. Verify you are redirected back to `/catalog`.
5.  Check mobile view and verify the Navy Blue bottom navigation bar.

## Rollback plan

- Revert the changes to `web.php`, `DashboardRedirectController.php`, and the React components to restore the previous layout and auth flow.
