# GreenCart Frontend — Agent Guide

## Commands

```bash
npm run dev     # vite dev server on :5173 (strictPort)
npm run build   # tsc typecheck + vite build (tsc must pass first)
npm run preview # vite preview
```

No test runner, no linter, no formatter.

## Environment

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend origin (API at `{base}/api/v1`) |
| `VITE_STRIPE_PK` | Stripe publishable key |
| `VITE_OAUTH2_URL` | Google OAuth2 initiation URL |

See `.env.example`. Copy to `.env` with real values.

## Gotchas

- **Two Axios clients:** `apiClient` (default) sends `Authorization: Bearer` from localStorage. `refreshClient` is a bare instance with `withCredentials: true` (HTTP-only cookie) — used only for `/auth/refresh` and `/auth/logout`. The 401 interceptor queues concurrent failures so only one refresh fires.
- **JWT admin check:** `isAdminToken()` in `src/utils/jwt.ts` handles three possible claim keys (`authorities`/`roles`/`role`) and two value shapes (string array or `{authority: string}` array). Use it — don't parse localStorage directly.
- **`useCart()`** is `enabled: !!localStorage.getItem('token')` and `retry: false`. Won't fire for anonymous users.
- **Backend response shape:** `ApiResponse<{ data: T }>`. Hooks unwrap via `.then(r => r.data.data!)`. Lists nest one level deeper (`.data.products`, `.data.orders`, etc.) and go through `unwrapList()`.
- **Cart is server-authoritative.** The Zustand cart store (`useCartStore`) is a local mirror synced from `useCart()` in `AppLayout`. Mutations invalidate the `['cart']` query key.
- **`build` = tsc + vite build.** `tsc` checks types but emits nothing (`noEmit: true`). `noUnusedLocals` and `noUnusedParameters` are on — unused imports/vars fail the build.
- **No test runner.** No linter, no formatter.
- **`.gitignore` exists** — covers `node_modules/`, `dist/`, `.env`, `*.local`, `*.log`, `.vscode`.
- **Font:** `index.css` sets Berkeley Mono fallback chain globally. Custom spacing/font-size/radius tokens in `tailwind.config.js`.
- **Images:** Cloudinary URLs transformed via `getOptimizedImageUrl()` in `src/utils/images.ts` (appends `q_auto,f_auto,w_*,h_*,c_fill`). Non-Cloudinary URLs pass through. Fallback: `placehold.co`.
- **Payment providers:** STRIPE, K_PAY, CASH_ON_DELIVERY (enum `PaymentProvider`).
- **OAuth2 flow:** user → `VITE_OAUTH2_URL` → back to `/login-success?code=...` → `useOAuth2Exchange()`.

## Architecture

- **Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`
- **Routing:** react-router-dom v6. `ProtectedRoute` wraps authenticated pages (uses Zustand `useAuthStore`). Pass `requireAdmin` for admin routes under `/admin`.
- **Data fetching:** TanStack React Query hooks in `src/api/hooks.ts`. `staleTime: 30_000`, `retry: 1`.
- **State:** Zustand stores — `auth-store`, `cart-store`, `ui-store`. `AuthContext` (React context) mirrors auth-store but `ProtectedRoute` uses the store.
- **Forms:** Zod schemas in `src/lib/schemas.ts` + react-hook-form.
- **UI:** Radix primitives with thin wrappers in `src/components/ui/`. `cn()` utility (`clsx` + `tailwind-merge`) in `src/lib/utils.ts`.

## Source layout

```
src/
├── api/              # Axios client + React Query hooks
├── components/
│   ├── layout/       # Navbar, Footer, MobileNav, CartDrawer, AdminLayout
│   └── ui/           # Radix wrappers (button, card, input, select, tabs, etc.)
├── context/          # AuthContext (redundant with auth-store)
├── lib/              # Zod schemas, cn() utility
├── pages/
│   ├── admin/        # Dashboard, products, orders, payments, images, categories
│   ├── auth/         # Login, LoginSuccess, Register
│   ├── cart/         # CartPage
│   ├── checkout/     # Checkout, CheckoutSuccess, OrderConfirmation
│   ├── home/         # HomePage
│   ├── orders/       # MyOrders, OrderDetail
│   ├── payment/      # PaymentPage
│   ├── products/     # ProductCatalog, ProductDetail
│   └── profile/      # ProfilePage
├── stores/           # Zustand: auth-store, cart-store, ui-store
├── types/            # TypeScript interfaces and enums
└── utils/            # JWT decoding (jwt.ts), image URL optimization (images.ts)
```
