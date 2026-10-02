# LIFAZ Atelier — Headless Luxury E-Commerce Platform

A production-ready, pixel-perfect luxury brand platform engineered with a headless Next.js 15 App Router architecture, Tailwind CSS v4 design tokens, `shadcn/ui` primitives, and an editorial high-fashion aesthetic.

---

## 🏛️ Architecture Overview

```
lifaz/
├── apps/
│   ├── web/                          # Headless Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router Pages & API Routes
│   │   │   │   ├── (marketing)/      # Home, Editorial, About
│   │   │   │   ├── collections/      # PLP & Drop Archives
│   │   │   │   ├── products/         # PDP with Sticky ATC & Gallery
│   │   │   │   ├── cart/             # Shopping Bag with Threshold Progress
│   │   │   │   ├── checkout/         # Multi-Tier Express Checkout
│   │   │   │   ├── search/           # Instant Live Filter Search
│   │   │   │   ├── account/          # Customer Portal & Auth
│   │   │   │   ├── admin/           # Real-Time Inventory & Photo Studio
│   │   │   │   ├── pages/            # FAQ, Shipping, Concierge, Legal
│   │   │   │   └── api/              # Catalog, Newsletter & Ticket Endpoints
│   │   │   ├── components/           # UI Components (Layout, PDP, PLP, SEO)
│   │   │   └── lib/                  # CartContext, Types, Data Store & SDK
│   │   ├── tests/                    # E2E & Validation Suites
│   │   ├── Dockerfile                # Production Container Build
│   │   └── vercel.json               # Edge Deployment Config
│   └── api/                          # Standalone Microservices (Optional)
├── packages/
│   ├── db/                           # Prisma Database Schema & Migrations
│   └── ui/                           # Shared UI Tokens & Primitives
├── tokens.json                       # Design Tokens
└── .github/workflows/ci.yml          # GitHub Actions CI/CD Pipeline
```

---

## 🎨 Design System & Tokens

| Token | Value | Context |
|---|---|---|
| **Canvas Background** | `rgb(241, 240, 220)` (`#F1F0DC`) | Signature warm editorial paper canvas |
| **Foreground / Text** | `rgb(0, 0, 0)` (`#000000`) | High-contrast editorial typography (17.5:1 ratio) |
| **Headings Font** | `Monospace-Typewriter` | Architectural uppercase typographic hierarchy |
| **Body Font** | `Times New Roman`, serif | Editorial magazine body copy |
| **Border Radius** | `0rem` | Sharp razor-cut luxury corners |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm** / **pnpm** / **yarn**

### 1. Installation
```bash
# Navigate to web application directory
cd apps/web

# Install dependencies
npm install
```

### 2. Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the runway in your browser.

### 3. Production Build & Validation
```bash
npm run build
npm run start
```

### 4. Running Automated Tests
```bash
node tests/run-all-tests.js
```

---

## 📦 Key Feature Highlights

1. **Editorial Lookbook & Drop Campaigns (`/editorial`)**: Chapter narratives for Drop 001 (Faux Leather), Drop 002 (Puffer & Fleece), and Drop 003 (Foundations).
2. **Product Detail Page with Sticky ATC (`/products/[id]`)**: High-resolution gallery, interactive sizing matrix, collapsible atelier care accordions, and verified customer review breakdowns.
3. **Cart & Bag Engine (`/cart`)**: Dynamic $200 complimentary shipping progress tracker, promo code validator (`LIFAZ10`, `VIP10`, `FALL20`), and gift box messaging.
4. **Instant Search & Discovery (`/search`)**: Real-time filtering across drop collections, trending search chips, and category pills.
5. **Express Checkout (`/checkout`)**: Multi-tier delivery selection (Standard, Express, White-Glove Overnight), SSL-encrypted payment authorization, and dynamic order confirmation receipts.
6. **SEO & Structured Data**: Dynamic XML sitemap generation (`/sitemap.xml`), `robots.txt`, OpenGraph/Twitter social cards, and JSON-LD Rich Snippets (Organization, Product, Breadcrumbs).
7. **Admin Portal & Photo Studio (`/admin`)**: Real-time product management, local file uploads (PNG, JPG, WEBP, AVIF), image adjustments (brightness, contrast, zoom, color grading), and persistent local state.

---

## 🚢 Deployment Options

### Vercel Deployment
```bash
vercel deploy --prod
```

### Docker Container Deployment
```bash
docker build -t lifaz:latest -f apps/web/Dockerfile apps/web
docker run -p 3000:3000 lifaz:latest
```

---

## 📄 License & Attribution
Designed for **LIFAZ Atelier**.
All brand rights belong to **LIFAZ** and its collaborative partners.
