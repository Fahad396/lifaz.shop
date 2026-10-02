# LIFAZ Atelier — Bangladesh Luxury E-Commerce Platform

A production-ready, ultra-premium luxury e-commerce platform engineered with a **headless Next.js 15 App Router** architecture, Tailwind CSS v4 design tokens, `shadcn/ui` primitives, and an editorial high-fashion aesthetic tailored for **Bangladesh (BDT / ৳)**.

---

## 🏛️ Architecture & System Design

```
lifaz/
├── apps/
│   └── web/                          # Next.js 15 App Router Web Application
│       ├── data/
│       │   └── lifaz-database.json   # 💾 Native Persistent Local Database Store (7 Tables)
│       ├── src/
│       │   ├── app/                  # App Router Pages & API Routes
│       │   │   ├── page.tsx          # Editorial Runway Homepage
│       │   │   ├── collections/      # Product Listing (PLP) & Drop Archives
│       │   │   ├── products/         # Product Detail (PDP) with Sticky ATC, Size Chart & Gallery
│       │   │   ├── cart/             # Shopping Bag with Threshold Progress (৳5,000 Free Delivery)
│       │   │   ├── checkout/         # Bangladesh Checkout (bKash, Nagad, Cash on Delivery)
│       │   │   ├── search/           # Instant Real-Time Search & Category Filters
│       │   │   ├── editorial/        # Lookbook Drop Chapters (001, 002, 003)
│       │   │   ├── account/          # Customer Portal & Order History
│       │   │   ├── admin/            # Atelier Admin Studio & Local Database Inspector
│       │   │   ├── pages/            # FAQ, Shipping & Returns, Concierge Contact
│       │   │   └── api/              # Hardened REST API Endpoints with Rate Limiting & Auth
│       │   │       ├── admin/        # Admin Passkey Verification (Anti-Brute Force)
│       │   │       ├── db/           # Database Inspector & Table Management
│       │   │       ├── products/     # Product Catalog CRUD & Size Chart Management
│       │   │       ├── drops/        # Capsule Drops CRUD & Editorial Management
│       │   │       ├── orders/       # Order Placement & Status Updates
│       │   │       ├── categories/   # Category Taxonomy CRUD
│       │   │       ├── settings/     # Hero Banner & Typography Studio Settings
│       │   │       ├── contact/      # Concierge Ticket Submissions
│       │   │       └── newsletter/   # VIP Newsletter Registrations
│       │   ├── components/           # UI Components (Layout, PDP, PLP, Admin, SEO)
│       │   └── lib/                  # Server DB Engine, Rate Limiter, Validation, Types
│       ├── next.config.ts            # Security Headers, CSP & Image Optimization
│       └── package.json
├── packages/
│   └── db/                           # Prisma Database Schema (SQLite / PostgreSQL)
│       └── schema.prisma             # Multi-Model E-Commerce Database Schema
├── DEPLOYMENT.md                     # Single-VPS Production Linux Deployment Guide
├── DATABASE.md                       # Local & Production Database Architecture Guide
├── tokens.json                       # Design Tokens & Palette Specifications
└── README.md                         # Project Master Documentation
```

---

## 🛡️ Enterprise Security & Production Hardening

The platform features built-in enterprise defenses:

1. **SQL / Injection Defense:**
   - Zero raw SQL execution or concatenation vulnerabilities.
   - Built-in **Input Sanitization Engine** ([`src/lib/validation.ts`](file:///c:/Users/USER/lifaz/apps/web/src/lib/validation.ts)) strips `<script>`, `<iframe>`, `javascript:` URIs, inline handlers, and blocks prototype pollution (`__proto__`, `constructor`) and NoSQL operator injections.

2. **API Rate Limiting Middleware ([`src/lib/rate-limiter.ts`](file:///c:/Users/USER/lifaz/apps/web/src/lib/rate-limiter.ts)):**
   - In-memory sliding-window token bucket limiter with automatic stale IP cleanup.
   - **Admin Auth:** Strictly limited to **5 attempts per 15 minutes** (blocks brute-force attacks).
   - **Checkout Orders:** Limited to **10 orders per 10 minutes** per IP.
   - **Public Forms:** Limited to **6 submissions per minute** for contact concierge and VIP newsletter.
   - **Admin Mutations:** Limited to **120 requests per minute**.
   - **Public Reads:** Limited to **180 requests per minute**.

3. **HTTP Security Headers & CSP ([`next.config.ts`](file:///c:/Users/USER/lifaz/apps/web/next.config.ts)):**
   - **`Content-Security-Policy`**: Restricts scripts, styles, fonts, and media to authorized origins (`self`, Google Fonts, Unsplash CDN).
   - **`X-Frame-Options: DENY`**: Complete defense against clickjacking and unauthorized iframe embedding.
   - **`X-Content-Type-Options: nosniff`**: Prevents MIME-type confusion attacks.
   - **`Strict-Transport-Security (HSTS)`**: Enforces HTTPS with subdomains and preload.
   - **`Cross-Origin-Opener-Policy: same-origin`** & **`Referrer-Policy: strict-origin-when-cross-origin`**.

4. **Edge & Browser Caching:**
   - Configured `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` on public read endpoints (`/api/products`, `/api/drops`, `/api/categories`, `/api/settings/hero`).

---

## 🇧🇩 Bangladesh Localization & E-Commerce Features

- **Currency & Pricing:** All pieces formatted in Bangladeshi Taka (**BDT / ৳**) with dynamic comma grouping (e.g., `৳18,500`).
- **Logistics & Delivery Matrix:**
  - **Inside Dhaka Standard (24–48h):** ৳80 (Complimentary for orders above ৳5,000 via Pathao / Paperfly).
  - **Outside Dhaka Nationwide (2–3 days):** ৳150 across all 64 districts via Steadfast Courier.
  - **Dhaka Same-Day VIP Concierge:** ৳250 white-glove signature garment delivery.
  - **Division & Thana Selectors:** Full coverage for Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh.
- **Local Payment Gateways:**
  - **Cash on Delivery (COD):** Inspect luxury garments upon delivery before payment.
  - **bKash & Nagad (MFS):** Integrated merchant transaction verification and wallet numbers.
  - **Cards & Banking:** Visa, Mastercard, AMEX, UnionPay 3D Secure checkout.

---

## ✨ Key Platform Features

### 1. Capsule Drops Engine (Full CRUD)
- Manage seasonal drops with custom titles, manifesto names, subtitles, descriptions, cover photos, status (`Active`, `Upcoming`, `Archived`), and release dates.
- Filter catalog products by drop in storefront and admin studio.

### 2. Garment Size Chart & Fit Blueprint
- Drag-and-drop file upload for garment measurement diagrams (`JPG`, `PNG`, `WEBP`, `AVIF` up to 10MB).
- Tailoring and model advisory notes field (e.g., *"Model is 6'1\" wearing Size M. Boxy oversized drape."*).
- Customer PDP interactive sizing modal with dual-mode tabs:
  - **Garment Blueprint**: High-resolution image view with interactive zoom toggle (`100%` / `150%`).
  - **Body Matrix**: Interactive measurement matrix with dynamic unit conversion (**IN** / **CM**).

### 3. Headline & Hero Studio
- Real-time headline font sizing in `rem`, letter tracking, alignment, colors, text transformation, and shadow presets.
- Editorial photo adjustment controls: Zoom (100%–140%), brightness, contrast, vertical framing focus (`Top Focus`, `Center Balance`, `Bottom Silhouette`), and atelier color presets (*Haute B&W*, *Warm Atelier*, *Cool Minimal*, *Editorial Pop*).

---

## 💾 Zero-Dependency Local Database

The platform operates a **100% self-contained native database engine** with zero external platform dependencies:

1. **Persistent Local Database File:** Located at [`apps/web/data/lifaz-database.json`](file:///c:/Users/USER/lifaz/apps/web/data/lifaz-database.json).
2. **7 Native Database Tables:** `products`, `drops`, `categories`, `orders`, `inquiries`, `subscribers`, `hero`.
3. **Visual Database Inspector & Manager:** Accessible at [`http://localhost:3000/admin`](http://localhost:3000/admin) under the **Local Database Engine** tab:
   - **Real-Time Metrics:** File size, record counts, write timestamps.
   - **Interactive Table Viewer:** Switch between tables, paginate, and search.
   - **Table & JSON View:** Switch between formatted tables and raw JSON view with 1-click clipboard copy.
   - **Export & Backup:** One-click JSON database backup downloads.
   - **Record Management:** Edit or delete records directly from disk.
4. **Prisma ORM Ready:** [`packages/db/schema.prisma`](file:///c:/Users/USER/lifaz/packages/db/schema.prisma) configured with SQLite for local development and easily switchable to PostgreSQL for production VPS.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm** / **pnpm** / **yarn**

### 2. Run the Development Server
```bash
# Navigate to web application directory
cd apps/web

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Key Pages & Routes

| Route | Description |
| :--- | :--- |
| **`/`** | Editorial Runway Homepage with dynamic Hero Banner adjustments |
| **`/collections/all`** | Product Listing Page (PLP) with category filtering and sorting |
| **`/collections/[slug]`** | Capsule Drop Archives (e.g., `/collections/drop-001`) |
| **`/products/[id]`** | Product Detail Page (PDP) with Sticky ATC, Size Chart Blueprint, Gallery |
| **`/editorial`** | Editorial lookbook chapters and high-fashion narratives |
| **`/cart`** | Shopping bag with ৳5,000 free delivery progress bar |
| **`/checkout`** | Express Bangladesh Checkout (bKash, Nagad, COD, Nationwide Courier) |
| **`/search`** | Instant search with category pills and price filters |
| **`/account`** | Customer Account Portal & Order History |
| **`/admin`** | Atelier Studio & **Local Database Engine** manager |
| **`/pages/contact`** | Concierge inquiry desk with automatic ticket generation in database |
| **`/pages/shipping-returns`** | 64-district courier shipping guidelines and 7-day exchange policies |

---

## 🔌 API Reference

| Endpoint | Method | Description | Rate Limit |
| :--- | :--- | :--- | :--- |
| **`/api/admin/verify`** | `POST` | Validates Master Admin Passkey | 5 req / 15 min |
| **`/api/db`** | `GET`, `POST` | Inspects database metadata and updates tables | 120 req / min (Admin) |
| **`/api/products`** | `GET`, `POST` | Fetches filtered catalog or publishes a new piece | 180 req/min (Read), 120 req/min (Post) |
| **`/api/products/[id]`** | `GET`, `PUT`, `DELETE` | Read, modify, or remove an individual product | 180 req/min (Read), 120 req/min (Mutate) |
| **`/api/drops`** | `GET`, `POST` | Fetches capsule drops or launches a new drop | 180 req/min (Read), 120 req/min (Post) |
| **`/api/drops/[id]`** | `GET`, `PUT`, `DELETE` | Read, modify, or delete a capsule drop | 180 req/min (Read), 120 req/min (Mutate) |
| **`/api/orders`** | `GET`, `POST` | Fetches orders or records a new customer checkout | 10 req / 10 min (Create) |
| **`/api/orders/[id]`** | `PATCH` | Updates order fulfillment status (`In Transit`, `Delivered`) | 120 req / min (Admin) |
| **`/api/categories`** | `GET`, `POST`, `DELETE` | Manages category taxonomy | 180 req/min (Read), 120 req/min (Admin) |
| **`/api/settings/hero`** | `GET`, `POST` | Reads and updates live homepage hero typography & banner | 180 req/min (Read), 120 req/min (Admin) |
| **`/api/contact`** | `GET`, `POST` | Submits concierge inquiries and records tickets in DB | 6 req / min |
| **`/api/newsletter`** | `GET`, `POST` | Registers VIP drop notification subscribers | 6 req / min |

---

## 🖥️ Single-VPS Production Hosting (No Docker)

For complete instructions on running this entire project on a single Ubuntu VPS with native **PostgreSQL**, **PM2**, and **Nginx** (without Docker or third-party cloud database platforms), see [DEPLOYMENT.md](file:///c:/Users/USER/lifaz/DEPLOYMENT.md).

---

## 📄 Documentation Links

- 📖 [DEPLOYMENT.md](file:///c:/Users/USER/lifaz/DEPLOYMENT.md) — Bare-metal Linux VPS deployment guide.
- 💾 [DATABASE.md](file:///c:/Users/USER/lifaz/DATABASE.md) — Local database architecture, schema definitions, and security guide.
- 🎨 [`tokens.json`](file:///c:/Users/USER/lifaz/tokens.json) — Design tokens, color palette, typography scales.

---

## 🏷️ License
Designed for **LIFAZ Atelier**. All rights reserved.
