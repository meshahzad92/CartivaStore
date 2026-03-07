# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

Cartiva Store is a production-ready Pakistani e-commerce web app for selling physical products via Cash-on-Delivery (COD). It provides a customer-facing storefront and a private admin panel. The admin panel integrates natively with **PostEx** (Pakistan's courier network) to automate order booking and shipment tracking.

## Goals

1. **Customer storefront** — Browse products, view details, add to cart, and place COD orders
2. **Admin dashboard** — Real-time order management, status updates, analytics, bulk operations
3. **PostEx integration** — Upload confirmed orders to PostEx, capture tracking numbers, track shipments live
4. **Settings management** — Store PostEx API credentials and shipment defaults in DB (no restart required)
5. **Conversion features** — Social proof popups, testimonials, optimized checkout flow

## Non-Goals (Out of Scope)

- Online payment gateway (Stripe, JazzCash, etc.) — COD only
- Multi-admin / role-based access control
- Customer accounts / login / order history portal
- Mobile app (iOS / Android)
- Multi-store or multi-tenant operation

## Users

| Actor | Description |
|---|---|
| **Customer** | Browses products, adds to cart, completes checkout with name/phone/address. No account needed. |
| **Admin** | Single admin (email + password configured in `.env`). Manages orders, uploads to PostEx, views analytics. |

## Constraints

- **Pakistan-only** — Currency is PKR, courier is PostEx.pk, city names match PostEx city list
- **COD only** — No payment processing
- **Single SQLite DB** — Suitable for early-stage; Alembic migrations ready for PostgreSQL promotion
- **Single admin user** — Credentials stored in `.env`, JWT for session management (24h expiry)
- **Backend-authoritative pricing** — Frontend prices are display-only; backend recalculates totals

## Success Criteria

- [ ] Customer can browse products, add to cart, and place a COD order end-to-end
- [ ] Admin can log in, view all orders, filter by status, and edit order details
- [ ] Admin can select confirmed orders and upload them to PostEx with tracking numbers returned
- [ ] PostEx settings (API token, addresses, defaults) are configurable from the UI without code change
- [ ] Dashboard shows real-time stats (total, revenue, pending, confirmed, weekly chart)
- [ ] Social proof popup and testimonials are visible on storefront
- [ ] PostEx Item Details Modal allows viewing and editing all PostEx parameters (including weight, optional fields) before order upload
