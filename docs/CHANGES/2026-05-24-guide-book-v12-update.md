# Guide Book v1.2 Documentation Update

Date: 2026-05-24  
Area: shared  
Type: docs

## Context

The existing GUIDE_BOOK.md (v1.1) and GUIDE_BOOK_PRESENTASI.md (v1.2 — but stale) were out of date with the actual current state of the application. Multiple features had been added or changed since these docs were last written, including shuttle order redesign, order cancellation, driver notifications, admin settings, and more.

## What changed

- **docs/GUIDE_BOOK.md** — Complete rewrite to v1.2:
  - Updated shuttle flow: booking now via `/shuttle` with route tariff card selector integrated into main catalog layout
  - Added order cancellation section (BR-011): customer can cancel rental and shuttle orders with reason
  - Updated driver portal: mobile-first with fixed topbar, in-app notifications, status toggle, profil
  - Added admin settings section (company logo, name, phone for WhatsApp, address)
  - Updated dashboard: real-time chart trends, CSV export
  - Added vehicle availability check (BR-010) and auto-upgrade documentation
  - Added driver status lock (BR-013) business rule
  - Updated navigation docs for customer (desktop + mobile bottom nav)
  - Updated FAQ: cancel order now supported, driver notifications exist, availability check exists
  - Updated roadmap to reflect current state vs future
  - Updated project structure to include new directories (Notifications, Dashboard service, driver pages)
  - Added key URLs & routes reference table

- **docs/GUIDE_BOOK_PRESENTASI.md** — Complete rewrite to v1.2:
  - Updated all sections to match new GUIDE_BOOK.md
  - Added shuttle demo scenario (Skenario B)
  - Added cancellation demo scenario (Skenario C)
  - Updated demo timeline to include shuttle, driver portal, and cancellation
  - Updated masalah-solusi table with availability check and driver notification
  - Updated FAQ with new questions (shuttle vs rental, availability check, data export, role security)
  - Updated roadmap table to reflect what's already implemented vs future
  - Updated troubleshooting table

## Impact

- Documentation now accurately reflects the application for end users
- No code changes, only documentation files

## How to test

- Read docs/GUIDE_BOOK.md and docs/GUIDE_BOOK_PRESENTASI.md
- Compare documented features against actual application behavior
- Verify all mentioned URLs, navigation menus, and workflows match the running application

## Rollback plan

- Revert the two documentation files via git
