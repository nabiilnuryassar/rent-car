# Admin Dashboard Modal Refactor & Color Revamp

Date: 2026-05-09  
Area: frontend  
Type: refactor  

## Context

The user requested a global color scheme revamp to follow a new premium design system featuring Navy Blue (`#0f172a`), Amber Gold (`#f59e0b`), Success Green (`#10b981`), and Surface Gray (`#f8fafc`). The user also wanted to eliminate all legacy, multi-page creation workflows (`create.tsx`, `edit.tsx`) for admin CRUD operations in favor of streamlined, modal-based single-page operations (`index.tsx` with modals). 

## What changed

- **Design System Update**: Updated Tailwind configurations (`tailwind.config.js`) and globally replaced legacy colors (e.g., `blue-600`, `indigo-600`, etc.) with the new semantic palette using a regex/find-replace script.
- **Admin Modal Components**: Created reusable `Modal.tsx` utilizing `@headlessui/react` and `framer-motion` for animated, accessible dialog windows.
- **Admin Refactoring**: Migrated `VehicleCategory`, `Vehicle`, and `Driver` to solely rely on their respective `index.tsx` for viewing, creating, and editing records. Used `useForm` mapped directly to these modals.
- **Controller Cleanup**: Stripped out legacy `create` and `edit` views/functions from `VehicleCategoryController`, `VehicleController`, and `DriverController`.
- **ESLint/TS Errors**: Fixed a massive series of unused variables and missing dependencies scattered throughout the codebase (recharts, icons, forms). 
- **Customer Catalog**: Refactored the `VehicleCard` and `Catalog/Index.tsx` to accommodate the new color palette, layout changes, and interactive detail-modals.

## Impact

- **Behavior changes**: Admin users can now create, edit, and view records without page reloads, dramatically speeding up data entry. 
- **Compatibility notes**: No backend APIs were broken, but the routes to `/create` and `/edit` will 404 since they were removed. This is intended.

## How to test

- Check the customer catalog: `http://localhost:8000/catalog` to view new styles and modals.
- Log into Admin Dashboard `http://localhost:8000/admin/dashboard`
- Navigate to "Kendaraan", "Kategori", and "Pengemudi". Verify "Tambah" buttons open modals.
- Add or edit a record to ensure form submission and visual transitions work.

## Rollback plan

- Reverse the `git` commits associated with this task to restore the `create.tsx` and `edit.tsx` pages and original color variants.
