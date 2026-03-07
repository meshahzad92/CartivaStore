# ROADMAP.md

> **Current Phase**: All core features complete — in maintenance/improvement mode
> **Project**: Cartiva Store v1.0

## Core Feature Status

- [x] Customer storefront (Home, Products, ProductDetails, Cart, Checkout, Confirmation)
- [x] Admin authentication (JWT, protected routes)
- [x] Admin dashboard (stats, weekly chart, recent orders)
- [x] Order management (list, filter, search, status update, bulk ops, edit details)
- [x] PostEx courier integration (upload orders, capture tracking, track shipments)
- [x] Admin Settings page (PostEx API token, addresses, defaults, feature toggles)
- [x] Social proof popup + Testimonials
- [x] Notes field on orders

---

## Phases

### Phase 1: Foundation ✅
**Status**: ✅ Complete
**Objective**: Core e-commerce flow — product catalog, cart, COD checkout, order persistence

### Phase 2: Admin Panel ✅
**Status**: ✅ Complete
**Objective**: Admin login, order list with filters, status management, dashboard stats

### Phase 3: PostEx Integration ✅
**Status**: ✅ Complete
**Objective**: Upload confirmed orders to PostEx courier API, save tracking numbers, track shipments

### Phase 4: Admin Settings & Polish ✅
**Status**: ✅ Complete
**Objective**: DB-driven PostEx settings (no `.env` restarts), notes field, social proof, conversion features

---

## Potential Next Phases

### Phase 5: Product Management UI
**Status**: ✅ Complete
**Objective**: Admin UI to create, edit, delete products (currently requires direct DB / seed script)
**Requirements**: CRUD product forms in admin panel, image upload or URL input

### Phase 6: Reporting & Export
**Status**: ⬜ Not Started
**Objective**: Export orders to CSV/Excel, enhanced analytics (revenue by category, top products)

### Phase 7: Notifications & Automation
**Status**: ⬜ Not Started
**Objective**: WhatsApp/SMS order confirmation to customer, auto-PostEx upload on confirm

### Phase 8: Production Hardening
**Status**: ⬜ Not Started
**Objective**: Migrate to PostgreSQL, containerize with Docker, configure CI/CD, set up proper logging

---

### Phase 9: PostEx Item Details Expansion
**Status**: ✅ Complete
**Objective**: Enhance PostEx Orders UI with an Item Details Expansion (Slide-out panel/Modal) before upload.
**Depends on**: Phase 4

**Tasks**:
- [ ] TBD (run /plan 9 to create)

**Verification**:
- TBD
