# Frontend — Architecture & Structure

**Framework:** React 18 + Vite  
**Router:** React Router v6  
**Styling:** Vanilla CSS + inline styles  
**State:** React Context (no Redux)  
**API Layer:** `src/services/api.js` (native `fetch`)  
**Build Config:** `vite.config.js`

---

## Entry Points

| File            | Role                                                    |
|-----------------|---------------------------------------------------------|
| `index.html`    | HTML shell, mounts `<div id="root">`                    |
| `src/main.jsx`  | Renders `<App />` wrapped in `<BrowserRouter>`          |
| `src/App.jsx`   | Route definitions + `AdminAuthProvider` wrapper         |
| `src/index.css` | Global CSS variables and base styles                    |

---

## Route Map (`App.jsx`)

### Public Store Routes (`/*`)
Wrapped in `<Header /> + <main> + <Footer /> + <SocialProofPopup />` layout.

| Path               | Component          | Description                      |
|--------------------|--------------------|----------------------------------|
| `/`                | `Home`             | Landing page                     |
| `/products`        | `Products`         | Product catalog with filters     |
| `/products/:id`    | `ProductDetails`   | Single product detail page       |
| `/cart`            | `Cart`             | Shopping cart                    |
| `/checkout`        | `Checkout`         | Checkout form (COD)              |
| `/confirmation`    | `Confirmation`     | Order success page               |
| `/about`           | `About`            | About Us page                    |
| `/contact`         | `Contact`          | Contact page                     |

All public pages use `React.lazy()` + `<Suspense fallback={<Loader />}>` for code splitting.

### Admin Routes (own layout, no Header/Footer)
Protected by `<AdminProtectedRoute>` (redirects to login modal if not authenticated).

| Path                 | Component       | Description                         |
|----------------------|-----------------|-------------------------------------|
| `/admin/dashboard`   | `AdminDashboard`| Stats overview + sidebar navigation |
| `/admin/orders`      | `AdminOrders`   | Full order management table         |

---

## Directory Structure

```
src/
├── App.jsx                         # Routes + context providers
├── main.jsx                        # Entry point
├── index.css                       # Global styles

├── pages/                          # Route-level components
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetails.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Confirmation.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       └── AdminOrders.jsx

├── components/                     # Reusable UI components by domain
│   ├── layout/
│   │   ├── Header.jsx              # Store nav bar (logo, cart icon, links)
│   │   └── Footer.jsx              # Store footer
│   ├── common/
│   │   ├── Loader.jsx              # Spinner component (size prop: sm/md/lg)
│   │   └── ...                     # Other shared UI primitives
│   ├── product/
│   │   ├── ProductCard.jsx         # Product grid card
│   │   └── ...
│   ├── cart/
│   │   └── ...                     # Cart item components
│   ├── conversion/
│   │   ├── SocialProofPopup.jsx    # "Someone just bought X" popup
│   │   └── ...                     # Other trust/CRO widgets
│   └── admin/
│       ├── AdminLayout.jsx         # Admin sidebar + content shell
│       ├── AdminLoginModal.jsx     # Login overlay/modal
│       ├── AdminProtectedRoute.jsx # Auth guard wrapper
│       ├── OrderDetailPanel.jsx    # Slide-in panel for single order
│       ├── MarkAsDropdown.jsx      # Status change dropdown
│       ├── StatusBadge.jsx         # Colored badge for order status
│       └── NewOrderToast.jsx       # Toast popup for new order notification

├── context/
│   ├── CartContext.jsx             # Cart state (items, add, remove, quantity)
│   └── AdminAuthContext.jsx        # Admin auth state (token, login, logout, authFetch)

├── hooks/
│   ├── useCart.js                  # Shortcut hook for CartContext
│   └── useNewOrderNotifier.js      # Polls backend every 7s for new orders

├── services/
│   └── api.js                      # All API calls (products, orders, testimonials)

└── utils/
    └── ...                         # Utility functions
```

---

## Data Flow — Public Store

### Products (listings & detail)
```
Products.jsx / ProductDetails.jsx
  → import { getProducts, getProductById } from services/api.js
  → api.js calls GET /api/v1/products (with query params)
  → normalizeProduct() maps snake_case → camelCase for frontend
  → stored in local useState
  → passed to ProductCard / ProductDetails UI
```

### Cart
```
CartContext.jsx
  → stores cart items in React state + localStorage (for persistence across refresh)
  → exposes: items, addToCart(product, qty), removeFromCart(id), updateQty(id, qty), clearCart()

useCart.js
  → thin wrapper: const { items, addToCart, ... } = useContext(CartContext)
  → used by: Header, ProductDetails, Cart, Checkout
```

### Checkout → Order
```
Checkout.jsx (form: full_name, phone, address, city, postal_code)
  → on submit: calls submitOrderToBackend(orderData) from api.js
  → api.js POSTs to /api/v1/orders
  → on success: navigates to /confirmation with order data via React Router state
  → CartContext.clearCart() called after successful order
```

### Testimonials
```
Home.jsx
  → calls getTestimonials() from api.js
  → api.js calls GET /api/v1/testimonials
  → api.js normalizes response (maps message→comment, derives avatar initials)
```

---

## API Service Layer (`src/services/api.js`)

Central file for all backend communication. All functions are `async`.

| Function                          | Endpoint called                     | Notes                          |
|-----------------------------------|-------------------------------------|--------------------------------|
| `getProducts(params)`             | `GET /api/v1/products`              | Returns normalized array       |
| `getProductById(id)`              | `GET /api/v1/products/:id`          | Returns normalized product     |
| `getCategories()`                 | `GET /api/v1/products/categories`   | Raw response (no normalization)|
| `getTestimonials()`               | `GET /api/v1/testimonials`          | Normalizes to frontend shape   |
| `submitOrderToBackend(orderData)` | `POST /api/v1/orders`               | Maps camelCase → snake_case    |

**`normalizeProduct(p)`** — internal helper that maps backend snake_case fields to camelCase frontend shape:
- `original_price` → `originalPrice`  
- `in_stock` → `inStock`
- `add_on` → `addOn`
- `images`: uses `p.images` if non-empty, else falls back to `[p.image_url]`

---

## Context Providers

### `CartContext` (`src/context/CartContext.jsx`)
- Provides global cart state
- Persisted to `localStorage`
- Wraps the entire app via `main.jsx`

### `AdminAuthContext` (`src/context/AdminAuthContext.jsx`)
- Persists JWT token to `localStorage` under key `cartiva-admin-token`
- On mount: calls `GET /api/v1/admin/verify` to restore session
- Exposes:
  - `token` — raw JWT string
  - `admin` — email of logged-in admin
  - `checking` — boolean while verifying session on load
  - `login(email, password)` — POSTs to admin/login, stores token
  - `logout()` — clears token from state + localStorage
  - `authFetch(url, options)` — `fetch` pre-configured with Bearer header
- Wraps entire app in `App.jsx`

---

## Custom Hooks

### `useNewOrderNotifier({ token, onNewOrder })`
**File:** `src/hooks/useNewOrderNotifier.js`

- Polls `GET /api/v1/admin/orders/latest-id` every **7 seconds**
- Compares returned `latest_order_id` with last-known ID stored in `localStorage` under key `cartiva-last-order-id`
- On new order detected: plays Shopify sale sound + calls `onNewOrder(count)`
- Sound URL: `http://localhost:8000/static/sound/shopify_sale_sound.mp3`
- Only active when admin `token` is present
- Used by: `AdminOrders.jsx` / `AdminDashboard.jsx`

---

## Styling

- Global variables/tokens defined in `src/index.css`
- Component styles are co-located inline or in module files
- No CSS framework (no Tailwind, no Bootstrap)
- Responsive layout via flexbox/grid in each component
