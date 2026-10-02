# LIFAZ — System & Agent Master Context

## 1. Project Overview & Identity
- **Brand Name**: **LIFAZ**
- **Tagline**: *Dhaka Atelier // Ready-To-Wear & Capsule Drops*
- **Design Philosophy**: High-fashion, architectural luxury (inspired by Khy, Bottega Veneta, Acne Studios, Jacquemus).
- **Target Market**: Dhaka, Bangladesh & Worldwide.
- **Currency**: Bangladeshi Taka (**`BDT (৳)`**), formatted with custom separator (`৳ 18,500`).
- **Logistics**: 64-District Nationwide Courier Insured Shipping, 7-Day Sizing Exchange Desk.

---

## 2. Technology Stack & Packages
- **Framework**: Next.js 15 App Router (`apps/web`) with Turbopack.
- **Runtime**: Node.js & React 19.
- **Styling**: Tailwind CSS v4 (with custom `@theme` tokens in `src/app/globals.css`).
- **Animations & Drawers**: **`framer-motion`** (`AnimatePresence`, `motion.div`) with static bezier easing (`[0.22, 1, 0.36, 1]`). Zero GPU force-layer hacks.
- **Icons**: `lucide-react`.
- **Carousel**: `embla-carousel-react` / `@/components/ui/carousel`.

---

## 3. Architecture & Key Files

```
lifaz/
├── AGENTS.md                   # Master agent instructions & workspace context
├── README.md                   # Complete developer guide
├── DATABASE.md                 # Database schema & migration docs
├── DEPLOYMENT.md               # Vercel & Production deployment guide
└── apps/
    └── web/
        ├── .env.example        # Environment variable template
        ├── data/
        │   └── lifaz-database.json  # Persistent JSON database (0 mock items, clean catalog)
        └── src/
            ├── app/            # App router pages
            │   ├── page.tsx    # Home page (Hero, Featured, Mosaic, Lookbook, Newsletter)
            │   ├── collections/
            │   │   └── [slug]/page.tsx  # PLP with filter drawer & grid/lookbook view mode
            │   ├── products/
            │   │   └── [id]/page.tsx    # PDP with gallery, size selector, sticky ATC, sizing guide
            │   ├── cart/page.tsx        # Shopping Bag page
            │   ├── checkout/page.tsx    # 64-District Courier Checkout & payment options
            │   ├── admin/page.tsx       # Secure Atelier Management Dashboard
            │   ├── editorial/page.tsx   # Autumn/Winter Campaign Lookbook
            │   ├── account/page.tsx     # Client VIP Profile & Order Tracker
            │   ├── search/page.tsx      # Archive search engine with category filters
            │   └── api/                 # Secure REST API endpoints (products, drops, orders, etc.)
            ├── components/
            │   ├── layout/
            │   │   ├── Header.tsx       # Fixed navigation bar with dynamic hero transparency
            │   │   ├── MenuDrawer.tsx   # Luxury 920px split lookbook menu portalled to body
            │   │   ├── CartDrawer.tsx   # Full-height sliding cart drawer portalled to body
            │   │   └── Footer.tsx       # Editorial footer with atelier coordinates
            │   ├── pdp/                 # StickyATC, SizingGuide, ProductGallery, Reviews, etc.
            │   ├── plp/                 # FilterSidebar, ProductCard, ViewModeMenu, CollectionClient
            │   └── home/                # Hero, Mosaic, FeaturedCarousel, Newsletter
            └── lib/
                ├── types.ts             # TypeScript interfaces (Product, Drop, Order, Variant)
                ├── currency.ts          # BDT formatting utilities (formatPrice, formatPriceWithCode)
                ├── storage.ts           # Client reactive localStorage and sync helpers
                ├── server-db.ts         # Server file-based JSON persistence engine
                ├── admin-auth.ts        # Admin authorization & passkey verification
                ├── rate-limiter.ts      # Tiered IP rate limiting
                ├── validation.ts        # Input sanitization and product schema validator
                └── cart-context.tsx     # Global React Cart Context with quantity & sizes
```

---

## 4. Critical Engineering & Design Rules

1. **Drawers & Modals MUST Use `createPortal(..., document.body)`**:
   - The `<header>` element uses `backdrop-blur`. In CSS, any ancestor with `backdrop-filter` traps `position: fixed` child elements inside its height.
   - All drawers ([`MenuDrawer.tsx`](file:///c:/Users/USER/lifaz/apps/web/src/components/layout/MenuDrawer.tsx), [`CartDrawer.tsx`](file:///c:/Users/USER/lifaz/apps/web/src/components/layout/CartDrawer.tsx), modals) must be rendered via `createPortal` to `document.body` with `mounted` SSR checks.
2. **Static Transitions**:
   - All animations use `framer-motion` with static transforms (`x`, `y`, `opacity`, `scale`).
   - Do NOT add CSS GPU layers (`will-change`, `translate3d(0,0,0)`, `backface-visibility`) which cause blurriness.
3. **Clean Production Catalog**:
   - The default catalog starts empty (`PRODUCTS = []`, `products = []` in database).
   - Real garments are created, published, and priced in BDT via `/admin`.
4. **Admin Security**:
   - The `/admin` portal requires passkey authorization (configured via `ADMIN_PASSKEY` in `.env.local`).

---

## 5. Local Development Commands
```bash
# In apps/web:
npm install
npm run dev      # Starts Next.js Turbopack dev server on http://localhost:3000
npm run build    # Validates production build
```
