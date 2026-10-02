# LIFAZ — Atelier System & Architecture Rules

## 1. Brand & Regional Identity
- **Brand**: LIFAZ (Dhaka Luxury Ready-To-Wear & Capsule Drops).
- **Currency**: Bangladeshi Taka (`BDT (৳)`), formatted as `৳ 18,500` via `@/lib/currency`.
- **Logistics**: 64-District Nationwide Courier Insured Shipping, 7-Day Sizing Exchange Desk.

---

## 2. Framework & Animation Standards
- **Framework**: Next.js 15 App Router with Turbopack & React 19.
- **Animations**: `framer-motion` (`AnimatePresence`, `motion.div`) with static bezier easing (`[0.22, 1, 0.36, 1]`).
- **No GPU Layer Hacks**: Never add `will-change: transform`, `translate3d(0,0,0)`, or `backface-visibility: hidden` in CSS, as they create blurry text and subpixel rendering defects.
- **Portals for Drawers & Modals**: All drawers ([`MenuDrawer.tsx`](file:///c:/Users/USER/lifaz/apps/web/src/components/layout/MenuDrawer.tsx), [`CartDrawer.tsx`](file:///c:/Users/USER/lifaz/apps/web/src/components/layout/CartDrawer.tsx), modals) **must** be rendered using `createPortal(..., document.body)` with an SSR `mounted` check to prevent getting trapped inside headers with `backdrop-filter`.

---

## 3. Database & Admin Security
- **Catalog**: Starts clean (`PRODUCTS = []`, `products: []` in JSON DB).
- **Local Persistence**: `apps/web/data/lifaz-database.json` managed through `src/lib/server-db.ts`.
- **Admin Access**: Protected via `ADMIN_PASSKEY` in `.env.local`. Rate-limited per IP.
- **Input Sanitization**: All product data validated through `src/lib/validation.ts`.
