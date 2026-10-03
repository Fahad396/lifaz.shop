# LIFAZ Atelier — Bangladesh Luxury E-Commerce Platform
## Dhaka Atelier // Ready-To-Wear & Capsule Drops

A production-ready, ultra-premium luxury e-commerce platform engineered with a **headless Next.js 15 App Router** architecture, Tailwind CSS v4 design tokens, `shadcn/ui` primitives, and an editorial high-fashion aesthetic tailored for **Bangladesh (BDT / ৳)**.

---

## 🏛️ Architecture & System Design

```
lifaz/
├── apps/
│   └── web/                          # Next.js 15 App Router Web Application
│       ├── data/                     # Local Database Snapshots & Rollback Vaults
│       ├── src/
│       │   ├── app/                  # App Router Pages & API Routes
│       │   │   ├── page.tsx          # Editorial Runway Homepage
│       │   │   ├── collections/      # Product Listing (PLP) & Drop Archives
│       │   │   ├── products/         # Product Detail (PDP) with Sticky ATC, Size Chart & Gallery
│       │   │   ├── cart/             # Shopping Bag with Threshold Progress (৳5,000 Free Delivery)
│       │   │   ├── checkout/         # Bangladesh Checkout (bKash, Nagad, Cash on Delivery)
│       │   │   ├── search/           # Instant Real-Time Search & Category Filters
│       │   │   ├── editorial/        # Lookbook Drop Chapters (001, 002, 003)
│       │   │   ├── account/          # Customer Portal, Live Polling & Order Tracking
│       │   │   ├── admin/            # Unified Atelier Admin Studio (Catalog, Drops, Categories)
│       │   │   ├── pages/            # FAQ, Shipping & Returns, Concierge Contact
│       │   │   └── api/              # Hardened REST API Endpoints with Rate Limiting & Auth
│       │   ├── components/           # UI Components (Layout, PDP, PLP, Admin, SEO)
│       │   └── lib/                  # Prisma Connector, Server DB, Rate Limiter, Validation
│       ├── next.config.ts            # Security Headers, CSP & Image Optimization
│       └── package.json
├── packages/
│   └── db/                           # Prisma Database Schema (Native PostgreSQL)
│       ├── schema.prisma             # 10-Model E-Commerce Relational Database Schema
│       └── index.ts                  # Exported Prisma Client Singleton
├── scripts/
│   ├── setup-server.sh               # 🚀 1-Command Automated Server Bootstrapper (Debian/Ubuntu)
│   ├── backup-db.sh                  # 💾 Automated Daily Database Backup with 30-Day Retention
│   ├── export-data.sh                # 📦 Full System Migration Exporter (Postgres + Media + Data)
│   └── restore-data.sh               # ⚡ 1-Command Migration Importer & Database Restorer
├── ecosystem.config.js               # PM2 Cluster Production Configuration
├── nginx.conf.example                # High-Performance Nginx Reverse Proxy & SSL Template
├── SERVER_MIGRATION.md               # 🌐 Complete Step-by-Step Server & VPS Migration Playbook
├── DEPLOYMENT.md                     # Single-VPS & Private Server Production Deployment Guide
├── DATABASE.md                       # PostgreSQL Architecture & Scaling Documentation
└── README.md                         # Project Master Documentation
```

---

## ⚡ Self-Hosted & 0 Cloud Dependencies

LIFAZ is engineered for **100% self-hosted operation** with zero reliance on costly third-party cloud databases or SaaS lock-in:
- **Native PostgreSQL 17**: Runs locally on `127.0.0.1:5432` with zero network overhead.
- **Node.js 22 LTS & PM2**: Clustered multi-core background execution with automated crash restart.
- **Nginx Reverse Proxy**: Gzip compression, edge caching, and free SSL via Let's Encrypt Certbot.
- **Turnkey Server Migration**: Complete export and restore tooling ([`SERVER_MIGRATION.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/SERVER_MIGRATION.md)) allows moving the entire store to any new VPS or machine in under 5 minutes.

---

## 🛡️ Enterprise Security & Production Hardening

1. **SQL / Injection Defense:**
   - Zero raw SQL concatenation vulnerabilities.
   - Built-in **Input Sanitization Engine** ([`src/lib/validation.ts`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/apps/web/src/lib/validation.ts)) strips `<script>`, `<iframe>`, `javascript:` URIs, and blocks prototype pollution (`__proto__`, `constructor`).

2. **Tiered API Rate Limiting ([`src/lib/rate-limiter.ts`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/apps/web/src/lib/rate-limiter.ts)):**
   - **Admin Auth:** Strictly limited to **5 attempts per 15 minutes** (anti-brute force).
   - **Checkout Orders:** Limited to **10 orders per 10 minutes** per IP.
   - **Public Forms:** Limited to **6 submissions per minute** for concierge and newsletter.
   - **Public Reads:** Limited to **180 requests per minute**.

3. **HTTP Security Headers & CSP ([`next.config.ts`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/apps/web/next.config.ts)):**
   - **`Content-Security-Policy`**: Restricts scripts, styles, and media to authorized origins.
   - **`X-Frame-Options: DENY`**: Complete defense against clickjacking.
   - **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing.
   - **`Strict-Transport-Security (HSTS)`**: Enforces HTTPS with subdomains and preload.

---

## 🇧🇩 Bangladesh Localization & E-Commerce Features

- **Currency & Pricing:** All pieces formatted in Bangladeshi Taka (**BDT / ৳**) with dynamic comma grouping (e.g., `৳ 18,500`).
- **Logistics & Delivery Matrix:**
  - **Inside Dhaka Standard (24–48h):** ৳80 (Complimentary for orders above ৳5,000 via Pathao / Paperfly).
  - **Outside Dhaka Nationwide (2–3 days):** ৳150 across all 64 districts via Steadfast Courier.
  - **Dhaka Same-Day VIP Concierge:** ৳250 white-glove signature garment delivery.
  - **Division & Thana Selectors:** Full coverage for Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh.
- **Local Payment Gateways:**
  - **Cash on Delivery (COD):** Inspect luxury garments upon delivery before payment.
  - **bKash & Nagad (MFS):** Integrated merchant transaction verification and wallet numbers.
  - **Cards & Banking:** Visa, Mastercard, AMEX 3D Secure checkout.

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
cd apps/web && npm install

# 2. Start local development server (Turbopack)
npm run dev

# 3. Synchronize PostgreSQL database schema
cd ../../packages/db && npx prisma db push

# 4. Create full migration backup bundle
./scripts/export-data.sh

# 5. Restore migration bundle on any new VPS
./scripts/restore-data.sh backups/lifaz-migration-*.tar.gz
```

---

## 📚 Documentation Index

- 📖 **[`README.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/README.md)** — Master Architecture & Project Overview
- 🔒 **[`PAYMENT_SECURITY.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/PAYMENT_SECURITY.md)** — PCI-DSS Security, SAQ A Compliance & HMAC Webhook Signatures
- 🌐 **[`SERVER_MIGRATION.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/SERVER_MIGRATION.md)** — Step-by-Step Server & VPS Migration Playbook
- 🚀 **[`DEPLOYMENT.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/DEPLOYMENT.md)** — Single-VPS & Private Server Production Guide
- 💾 **[`DATABASE.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/DATABASE.md)** — PostgreSQL Schema, Models, and Backup Strategy

