# EpCraft — Frontend

Next.js (App Router) + Tailwind CSS frontend, built directly against the EpCraft Figma file.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

### Obtaining Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **Project Settings** (gear icon in sidebar) > **API**.
3. Under **Project URL**, copy the URL for `NEXT_PUBLIC_SUPABASE_URL`.
4. Under **Project API Keys**:
   - Copy the `anon` / `public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy the `service_role` / `secret` key for `SUPABASE_SERVICE_ROLE_KEY` *(keep secret, server-side only)*.
5. Paste these values into `.env.local`.


## Design system (extracted from Figma)

| Token       | Value      | Use                                  |
|-------------|-----------|----------------------------------------|
| `cream`     | `#f9f3ea` | page / nav / footer background         |
| `espresso`  | `#502c12` | headings, primary text, buttons        |
| `walnut`    | `#805437` | active nav underline                   |
| `bark`      | `#51443d` | body / muted text                      |
| `ink`       | `#1d1b16` | near-black headings on light cards     |
| `gold`      | `#c9a063` | accents, CTAs, dividers                |
| `sand`      | `#e7e2d9` | image placeholders / card backgrounds  |
| `border`    | `#e2d7c6` | hairline borders                       |

Fonts: **Playfair Display** (serif — headings) / **Inter** (sans — body). Both loaded via Google Fonts in `app/globals.css`.

Shared utility classes (`.btn-primary`, `.btn-secondary`, `.btn-outline-dark`, `.h1`/`.h2`/`.h3`, `.input-field`, `.container-page`) live in `app/globals.css` — reuse these instead of one-off Tailwind strings so every new screen stays visually consistent.

## Structure

```
app/
  layout.js        — wraps every page in Navbar + Footer
  page.js           — Homepage ✅ built
  globals.css       — design tokens + shared classes
components/
  Navbar.jsx        — ✅ shared across all pages
  Footer.jsx        — ✅ shared across all pages
  ProductCard.jsx   — ✅ shared product card
lib/
  products.js       — formatting utilities and asset helpers
```

## Build roadmap (matching the Figma screen list)

- [x] Homepage
- [x] Shop – Furniture (category listing + filters)
- [x] Product Detail
- [x] Search Results
- [x] Shopping Cart
- [x] Checkout (dynamic calculations via store settings)
- [x] Order Confirmation
- [x] Order History & Tracking
- [x] Customization Studio
- [x] My Account – Overview
- [x] Wishlist
- [x] Login
- [x] Register
- [x] Contact Us
- [x] 404 Page
- [x] Admin – Order Processing
- [x] Admin – Product Management
- [x] Admin – Business Overview

## Backend & Database Setup

- **Supabase**: Real authentication (Google OAuth + email), PostgreSQL database schemas, triggers, and Row Level Security (RLS) policies are active.
- **PayHere Sandbox**: Sandbox payment gateways integrated in checkout.
- **Environment variables**: Configured in `.env.local` including `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (kept server-side only), `DATABASE_URL` (direct Postgres pooled access), `PAYHERE_MERCHANT_ID`, and `PAYHERE_MERCHANT_SECRET`.
- **Database Migrations**: SQL migration files are located under `/supabase/migrations`. Runs standard Postgres schema tables (`profiles`, `categories`, `makers`, `products`, `orders`, `order_items`, `custom_order_requests`, and `store_settings`). RLS verified securely.
