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
  products.js       — TEMP mock data (swap for real API later)
```

## Build roadmap (matching the Figma screen list)

- [x] Homepage
- [x] Shop – Furniture (category listing + filters)
- [x] Product Detail
- [ ] Search Results
- [x] Shopping Cart
- [x] Checkout
- [x] Order Confirmation
- [x] Order History & Tracking
- [x] Customization Studio
- [x] My Account – Overview
- [x] Wishlist
- [x] Login
- [x] Register
- [x] Contact Us
- [x] 404 Page
- [ ] Admin – Order Processing
- [ ] Admin – Product Management
- [ ] Admin – Business Overview

## Notes for later (backend/DB hookup)

- All product/category data currently comes from `lib/products.js`. Once the database is ready, replace the exports there with real fetch calls — no page code should need to change if the shape stays the same.
- Product images are placeholder blocks (`bg-sand`) since real photography isn't in the repo yet — drop real images into `public/images/` and swap the `<div className="bg-sand" />` blocks for `next/image`.
- Auth (Login/Register), Cart, Wishlist, and Account pages will need real state/session once the backend exists — for now they'll use local component state or localStorage-free mock state so the UI is fully clickable without a database.
