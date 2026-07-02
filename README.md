# GreenCart — Fresh Groceries Delivered

E-commerce grocery delivery frontend built with React 18, TypeScript, and Tailwind CSS.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS (custom design tokens) |
| Routing | react-router-dom v6 |
| Data fetching | TanStack React Query + Axios |
| State | Zustand (auth, cart, UI) |
| Forms | react-hook-form + Zod |
| Payments | Stripe (`@stripe/react-stripe-js`) |
| UI primitives | Radix (dialog, dropdown, select, tabs, etc.) |
| Icons | lucide-react |
| Notifications | sonner |
| Charts | recharts, chart.js |

## Prerequisites

- Node 18+
- A running backend at the URL configured in `.env`

## Getting Started

```bash
cp .env.example .env   # then edit with your values
npm install
npm run dev            # → http://localhost:5173
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | TypeScript type-check + Vite production build |
| `npm run preview` | Preview the production build locally |

## Environment Variables

| Var | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:9000` | Backend origin (API at `/api/v1`) |
| `VITE_STRIPE_PK` | — | Stripe publishable key |
| `VITE_OAUTH2_URL` | — | Google OAuth2 initiation URL |

## Project Structure

```
src/
├── api/              # Axios client + React Query hooks
├── components/
│   ├── layout/       # Navbar, Footer, MobileNav, CartDrawer, AdminLayout
│   └── ui/           # Radix wrappers (button, card, input, etc.)
├── context/          # AuthContext (React context)
├── lib/              # Zod schemas, cn() utility
├── pages/
│   ├── admin/        # Dashboard, products, orders, payments, images, categories
│   ├── auth/         # Login, Register, LoginSuccess (OAuth2 callback)
│   ├── cart/         # CartPage
│   ├── checkout/     # Checkout, CheckoutSuccess, OrderConfirmation
│   ├── home/         # HomePage
│   ├── orders/       # MyOrders, OrderDetail
│   ├── payment/      # PaymentPage
│   ├── products/     # ProductCatalog, ProductDetail
│   └── profile/      # ProfilePage
├── stores/           # Zustand stores (auth, cart, UI)
├── types/            # TypeScript interfaces and enums
└── utils/            # JWT decoding, Cloudinary image URL optimization
```

## Features

**User-facing:**
- Product catalog with search and category filtering
- Product detail page with image gallery
- Cart management (add, remove, quantities)
- Checkout flow with Stripe payment integration
- Order history and order detail views
- User profile management
- JWT-based authentication with email/password and Google OAuth2
- Responsive design (mobile-first with bottom nav on small screens)

**Admin (`/admin`):**
- Dashboard with order/product/payment statistics
- Product CRUD with image management
- Order management and status updates
- Payment tracking
- Image library (Cloudinary integration)
- Category management

## Architecture

- **Authentication:** JWT stored in `localStorage`. `ProtectedRoute` wrapper enforces auth; admin routes additionally require `ROLE_ADMIN` claim from the JWT.
- **Data flow:** React Query hooks (`src/api/hooks.ts`) fetch data through an Axios client that auto-refreshes tokens on 401. Cart data is mirrored in a Zustand store for local UI state.
- **Routing:** Public routes (home, products, login, register) + authenticated routes (cart, checkout, orders, profile) + admin routes under `/admin` with nested layout.
- **API base path:** `{VITE_API_BASE_URL}/api/v1`

## Design System

Custom Tailwind theme with a monochrome palette (cream canvas, near-black ink, neutral gray ladder), 4px border radius on interactive elements, and Fraunces/Inter typefaces. See `tailwind.config.js` for full token set.

## Backend

Expected REST API at `{VITE_API_BASE_URL}/api/v1`. The backend manages authentication, product/order/cart persistence, Stripe payment intents, and Cloudinary image uploads.
