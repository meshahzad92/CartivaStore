# JOURNAL.md — Development Log

> Running log of work sessions.

---

## 2026-03-05

**Session**: Project mapping and GSD initialization
- Ran `/new-project` workflow on existing brownfield codebase
- Mapped full architecture: React 19 frontend + FastAPI backend + SQLite + PostEx integration
- Discovered 4 DB models, 6 API routers, 8 public pages, 4 admin pages
- Created GSD documentation: SPEC.md, ARCHITECTURE.md, STACK.md, ROADMAP.md, STATE.md
- All Phase 1–4 features confirmed complete

## 2026-03-04 / 2026-03-05

**Session**: PostEx Settings Integration (conv: 0bc9434a)
- Created `PostexSettings` DB model (singleton row id=1)
- Implemented settings CRUD and `/api/v1/admin/settings` router
- Built `AdminSettings.jsx` admin page with token, addresses, defaults, 7 toggles
- Added navigation link in admin sidebar

## 2026-03-02

**Session**: Admin Panel Redesign Planning (conv: 366af0c5)
- Planned redesign for Shopify/Stripe-style admin UI
- Requirements gathered for sidebar, dashboard, orders, notifications, UX

## 2026-03-01

**Session**: Backend + Admin Panel Fixes (conv: 1268c91b)
- Fixed various backend and admin panel issues

## 2026-02-28

**Session**: Frontend/Backend Restructure (conv: db8845fd)
- Created `frontend/` directory, moved all frontend files
- Wired up API calls for products and testimonials
- Aligned frontend/backend data shapes
