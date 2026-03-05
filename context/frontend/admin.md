# Frontend — Admin Module

The admin module is a fully self-contained section of the app with its own layout, routes, auth, and components. It does **not** share the store's `<Header>` or `<Footer>`.

**Admin routes:** `/admin/dashboard`, `/admin/orders`, `/admin/postex`
**All admin API calls require a Bearer JWT token.**

---

## How Authentication Works

### Flow
1. User visits any `/admin/*` route
2. `AdminProtectedRoute` checks `AdminAuthContext.checking` and `AdminAuthContext.token`
3. If no token → shows `AdminLoginModal`
4. User submits email/password → `AdminAuthContext.login()` → `POST /api/v1/admin/login`
5. Token stored in `localStorage` (`cartiva-admin-token`)
6. On next app load, `AdminAuthContext` calls `GET /api/v1/admin/verify` to auto-restore session
7. Logout clears token from state + localStorage

### Key Files
| File | Role |
|------|------|
| `context/AdminAuthContext.jsx` | Central auth state, token management, `authFetch` helper |
| `components/admin/AdminProtectedRoute.jsx` | Guards admin routes — shows login modal if not auth'd |
| `components/admin/AdminLoginModal.jsx` | Email + password form with show/hide toggle, calls `useAdminAuth().login()` |

---

## Pages

### `pages/admin/AdminDashboard.jsx`
**Route:** `/admin/dashboard`

**What it shows:**
- Greeting: "Hello, Admin 👋"
- 4 stat cards: Today's Orders, Pending, Fulfilled, Cancelled
- Recharts `BarChart` — orders per day for the last 7 days
- Recharts `PieChart` (donut) — order status distribution
- At-a-Glance table with all status counts
- Right panel (xl screens): date strip, weekly summary (total/avg/peak), activity feed

**Data sources:**
```
→ GET /api/v1/admin/stats         → DashboardStats (stat cards + donut)
→ GET /api/v1/admin/analytics/weekly → WeeklyStatsOut (bar chart + right panel)
```

**Polling:** `useNewOrderNotifier` polls `GET /admin/orders/latest-id` every 7s → triggers toast + refetch on new order.

---

### `pages/admin/AdminOrders.jsx`
**Route:** `/admin/orders`

**What it shows:**
- Filter tabs: All / Today / Pending / Confirmed / On Hold / Fulfilled / Cancelled
- Search bar (debounced 400ms, matches name/phone/ID)
- Paginated premium table with per-row checkboxes
- Selection toolbar (appears when ≥1 row checked):
  - **"Mark As (N)" dropdown** — bulk set status via `PATCH /api/v1/admin/orders/bulk-status`
  - **"Delete (N)" button** — bulk delete via `DELETE /api/v1/admin/orders` with confirm modal
- Clicking a row opens `OrderDetailPanel`

**Data flow:**
```
GET  /api/v1/admin/orders?status_filter=...&search=...&today_only=...&page=...
PATCH /api/v1/admin/orders/{id}              → single status update
PATCH /api/v1/admin/orders/{id}/details     → address/notes edit
PATCH /api/v1/admin/orders/bulk-status      → bulk status update { ids, status }
DELETE /api/v1/admin/orders                  → bulk delete { ids }
```

**Optimistic updates:** Status changes are applied to local state immediately; full re-fetch only on failure.

---

### `pages/admin/AdminPostex.jsx`
**Route:** `/admin/postex`

**What it shows:**
- Table of all `confirmed` orders (fetches `GET /admin/orders?status_filter=confirmed`)
- Per-row checkboxes for selection
- "Upload to Postex" button (disabled, Coming Soon tooltip)
- Upload status column: `Pending Upload` / `Uploaded` (local state only)
- Orange brand accent (`#FF6B00`)

**Note:** Postex API integration is UI-only placeholder for now.

---

## Components

### `components/admin/AdminLayout.jsx`
Shell wrapper for all admin pages. Full redesign (March 2026).

- **Sidebar:** Dark navy (`#1E293B`), lucide icons, indigo active accent, orange for Postex, user card at bottom
- **Top bar:** Search input, date display, notification bell, avatar initials
- **Sidebar links:** Dashboard, Orders, Postex
- **To add a new page:** Add nav item to `NAV_ITEMS` array + route in `App.jsx`

---

### `components/admin/OrderDetailPanel.jsx`
Slide-in side panel (portal, right side).

**Displays:**
- Order ID, status badge, created timestamp
- Items list: `product_name` (from backend), qty × unit price, line total
- Subtotal / shipping / total (recalculates live when item edit mode is active)
- **Item edit mode** (visual only): toggle qty/price inputs → recalculates displayed total, does NOT persist to DB
- Customer info card (name, phone, city, postal)
- Editable: delivery address, admin notes

**API calls:**
- `PATCH /api/v1/admin/orders/{id}` — status via MarkAsDropdown
- `PATCH /api/v1/admin/orders/{id}/details` — address + notes on Save

---

### `components/admin/MarkAsDropdown.jsx`
Small dropdown to change a single order's status. Used in both table rows and `OrderDetailPanel`.

**Options:** pending / confirmed / on_hold / fulfilled / cancelled
**API:** called by parent → `PATCH /api/v1/admin/orders/{id}`

---

### `components/admin/StatusBadge.jsx`
Colored pill badge. Dot + label pattern.
Colors: pending=amber, confirmed=blue, on_hold=orange, fulfilled=green, cancelled=red.

---

### `components/admin/ConfirmDeleteModal.jsx`
Portal modal for bulk delete confirmation. Shows order count, Cancel / Delete buttons.

---

### `components/admin/NewOrderToast.jsx`
Slide-in toast for new incoming orders. Used in Dashboard and Orders pages.

---

## New Order Polling System

**Hook:** `src/hooks/useNewOrderNotifier.js`

```
Every 7 seconds:
  → GET /api/v1/admin/orders/latest-id  (Bearer token)
  → Compare latest_order_id with localStorage["cartiva-last-order-id"]
  → If latest > stored: play /static/sound/shopify_sale_sound.mp3 → call onNewOrder()
```

---

## Admin Data Shapes

### `OrderOut` (updated — includes `product_name` in items)
```js
{
  id, full_name, phone, address, city, postal_code,
  status: "pending"|"confirmed"|"on_hold"|"fulfilled"|"cancelled",
  total_amount, notes, created_at,
  items: [{ id, product_id, product_name, quantity, price }]
}
```

### `WeeklyStatsOut` (new)
```js
{
  days: [{ date: "Mon 03", count: 4 }, ...],   // 7 entries
  total: 14, average: 2.0, peak_day: "Thu 05", peak_count: 6
}
```

---

## How to Add a New Admin Feature

1. **New admin page?**
   - Create `src/pages/admin/AdminNewPage.jsx`
   - Add to `NAV_ITEMS` in `AdminLayout.jsx` with icon + optional accent color
   - Add route in `App.jsx` under `/admin/new-page` wrapped in `<AdminProtectedRoute>`

2. **New dashboard stat?**
   - Add computation in `get_dashboard_stats()` → `app/crud/order.py`
   - Add field to `DashboardStats` schema → `app/schemas/order.py`
   - Display in `AdminDashboard.jsx`

3. **New order field visible in admin?**
   - Add column to `Order` model → `app/models/order.py`
   - Add to `OrderOut` schema + `OrderUpdateAdmin` if editable
   - Display/edit in `OrderDetailPanel.jsx`


---

## How Authentication Works

### Flow
1. User visits `/admin/dashboard` or `/admin/orders`
2. `AdminProtectedRoute` checks `AdminAuthContext.checking` and `AdminAuthContext.token`
3. If no token → shows `AdminLoginModal`
4. User submits email/password → `AdminAuthContext.login()` → `POST /api/v1/admin/login`
5. Token stored in `localStorage` (`cartiva-admin-token`)
6. On next app load, `AdminAuthContext` calls `GET /api/v1/admin/verify` to auto-restore session
7. Logout clears token from state + localStorage

### Key Files
| File | Role |
|------|------|
| `context/AdminAuthContext.jsx` | Central auth state, token management, `authFetch` helper |
| `components/admin/AdminProtectedRoute.jsx` | Guards admin routes — shows login modal if not auth'd |
| `components/admin/AdminLoginModal.jsx` | Email + password form, calls `useAdminAuth().login()` |

---

## Pages

### `pages/admin/AdminDashboard.jsx`
**Route:** `/admin/dashboard`

**What it shows:**
- Stat cards: Today's Orders, Pending, Confirmed, On Hold, Fulfilled, Cancelled
- Summary of overall order status counts

**Data source:**
```
AdminDashboard → useAdminAuth().authFetch
→ GET /api/v1/admin/stats
→ Returns DashboardStats: { total_today, pending, confirmed, on_hold, fulfilled, cancelled, latest_order_id }
```

**Polling for new orders:**
- Uses `useNewOrderNotifier({ token, onNewOrder })`
- Every 7 seconds polls `GET /api/v1/admin/orders/latest-id`
- On new order: plays sound + triggers `NewOrderToast`

**Layout:** Rendered inside `AdminLayout` (sidebar + content)

---

### `pages/admin/AdminOrders.jsx`
**Route:** `/admin/orders`

**What it shows:**
- Full order management table with:
  - Filter tabs: All / Pending / Confirmed / On Hold / Fulfilled / Cancelled
  - Search bar (matches name, phone, order ID)
  - Today Only toggle
  - Paginated table of orders
  - Clicking a row opens `OrderDetailPanel`

**Data source:**
```
AdminOrders → useAdminAuth().authFetch
→ GET /api/v1/admin/orders?status_filter=...&search=...&today_only=...&page=...&page_size=...
→ Returns OrderListOut: { orders[], total, page, page_size, total_pages }
```

**Order status update flow:**
```
MarkAsDropdown (select new status)
→ PATCH /api/v1/admin/orders/{id}   body: { status: "confirmed" }
→ Response: updated OrderOut
→ Local state updated (no full re-fetch needed)
```

**Address/Notes edit flow:**
```
OrderDetailPanel (admin edits address or notes)
→ PATCH /api/v1/admin/orders/{id}/details   body: { address, notes }
→ Response: updated OrderOut
→ Local state updated
```

**New order notification:**
- Same `useNewOrderNotifier` hook as dashboard
- Refetches orders automatically when new order detected

**Layout:** Rendered inside `AdminLayout` (sidebar + content)

---

## Components

### `components/admin/AdminLayout.jsx`
The shell/wrapper for all admin pages.

- **Renders:** Sidebar + top bar + content area (`children`)
- **Sidebar links:** Dashboard (`/admin/dashboard`), Orders (`/admin/orders`)
- **Top bar:** Admin email display + Logout button
- **Calls:** `useAdminAuth()` for email and logout action
- **How to modify:** If you need to add a new admin page, add a sidebar link here and register a route in `App.jsx`

---

### `components/admin/AdminProtectedRoute.jsx`
Wraps admin pages.

- While `checking === true` (session being verified) → shows `<Loader>`
- If authenticated → renders `children`
- If not authenticated → renders `<AdminLoginModal />`

---

### `components/admin/AdminLoginModal.jsx`
Full-screen overlay login form.

- Email + password fields
- On submit: calls `useAdminAuth().login(email, password)`
- Shows error message on failure (`"Invalid credentials"`)
- On success: modal disappears, underlying protected page renders

---

### `components/admin/OrderDetailPanel.jsx`
Slide-in side panel showing full order details.

**Triggered by:** Clicking an order row in `AdminOrders`

**Displays:**
- Order ID, customer name, phone, city, postal code
- Order status + created_at timestamp
- All ordered items with product names, quantities, unit price, line totals
- Delivery address (editable)
- Admin notes field (editable)

**Interactions:**
- `MarkAsDropdown` for status changes
- Save button for address/notes → calls `PATCH /api/v1/admin/orders/{id}/details`
- Close button (X) dismisses panel

**Data it receives:** Full `OrderOut` object passed as prop from parent (`AdminOrders`)

**To modify:** If you add new fields to the Order model (e.g., tracking number), add them here and in the `PATCH /details` endpoint + schema.

---

### `components/admin/MarkAsDropdown.jsx`
Dropdown to change order status.

- Options: `pending`, `confirmed`, `on_hold`, `fulfilled`, `cancelled`
- On selection → calls parent's update handler
- Parent sends: `PATCH /api/v1/admin/orders/{id}` with `{ status: "..." }`
- **Used in:** `OrderDetailPanel`, potentially in order row actions

---

### `components/admin/StatusBadge.jsx`
Small colored badge component.

- **Props:** `status: string`
- Renders different colors for each status value
- **Used in:** Order table rows + `OrderDetailPanel`
- **To change colors/labels:** Edit the status → color map inside this file

---

### `components/admin/NewOrderToast.jsx`
Popup notification for new incoming orders.

- Shown when `useNewOrderNotifier` detects new orders
- Displays count of new orders
- Auto-dismisses after a few seconds
- **Used in:** `AdminDashboard` and `AdminOrders`

---

## New Order Polling System

**Hook:** `src/hooks/useNewOrderNotifier.js`

```
Every 7 seconds:
  → GET /api/v1/admin/orders/latest-id  (with Bearer token)
  → Compare response.latest_order_id with localStorage["cartiva-last-order-id"]
  → If latest > stored:
      → Play /static/sound/shopify_sale_sound.mp3
      → Call onNewOrder(count)   # count = latestId - lastKnownId
      → Update localStorage
```

**Where it's used:**
- `AdminDashboard.jsx` — shows toast, prompts user to check orders page
- `AdminOrders.jsx` — shows toast + auto-refreshes order list

---

## Admin Data Shapes

### `DashboardStats` (from `GET /admin/stats`)
```js
{
  total_today: number,
  pending: number,
  confirmed: number,
  on_hold: number,
  fulfilled: number,
  cancelled: number,
  latest_order_id: number | null
}
```

### `OrderOut` (from `GET /admin/orders` and `PATCH` responses)
```js
{
  id: number,
  full_name: string,
  phone: string,
  address: string,
  city: string,
  postal_code: string,
  status: "pending" | "confirmed" | "on_hold" | "fulfilled" | "cancelled",
  total_amount: number,
  notes: string | null,
  created_at: string,  // ISO timestamp
  items: [
    { id, product_id, quantity, price }
  ]
}
```

---

## How to Add a New Admin Feature (Checklist)

1. **New admin page?**
   - Create `src/pages/admin/AdminNewPage.jsx`
   - Add route in `App.jsx` under `/admin/new-page` wrapped in `<AdminProtectedRoute>`
   - Add sidebar link in `AdminLayout.jsx`

2. **New field on Order visible in admin?**
   - Add column to `Order` model (`app/models/order.py`)
   - Add field to `OrderOut` schema (`app/schemas/order.py`)
   - If editable: add to `OrderUpdateAdmin` schema + `update_order_details()` CRUD + `PATCH /orders/{id}/details` route
   - Display in `OrderDetailPanel.jsx`

3. **New dashboard stat?**
   - Add computation in `get_dashboard_stats()` in `app/crud/order.py`
   - Add field to `DashboardStats` schema
   - Display in `AdminDashboard.jsx`
