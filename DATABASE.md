# LIFAZ Atelier — Database Architecture & Guide

This document describes the database design, data models, persistence mechanics, security protections, and visual management tools implemented in **LIFAZ Atelier**.

---

## 💾 Storage Architecture

LIFAZ uses a **two-tier database strategy**:

1. **Local Persistent Storage Engine (Default for local & single-server execution):**
   - **Path:** `apps/web/data/lifaz-database.json`
   - **Characteristics:** Zero external dependencies, starts immediately with `npm run dev`, persists changes permanently across restarts and sessions, and does not require background database containers or third-party cloud services.
   - **Server Layer:** Managed by [`apps/web/src/lib/server-db.ts`](file:///c:/Users/USER/lifaz/apps/web/src/lib/server-db.ts).

2. **Prisma ORM & Relational Schema (For multi-server VPS deployments & migrations):**
   - **File:** [`packages/db/schema.prisma`](file:///c:/Users/USER/lifaz/packages/db/schema.prisma)
   - **Supported Providers:** SQLite (Local) / PostgreSQL (Production VPS).

---

## 🗃️ Data Models & Schemas (7 Native Tables)

### 1. `products` (Catalog Pieces)
Stores garment metadata, BDT pricing, photos, size inventory, custom size chart blueprints, and fit advisory notes.
```json
{
  "id": "lifaz-01",
  "title": "FAUX LEATHER TRENCH COAT",
  "slug": "faux-leather-trench-coat",
  "price": 18500,
  "drop": "Drop 001: Faux Leather & Moto",
  "dropNumber": 1,
  "category": "Outerwear",
  "color": "Deep Black",
  "colorHex": "#111111",
  "description": "An oversized faux leather trench coat with sculpted lapels and belted waist.",
  "details": ["Floor-length dramatic silhouette", "Removable buckled belt"],
  "fabrication": ["Face: 100% Polyurethane", "Lining: 100% Polyester Satin"],
  "images": ["https://images.unsplash.com/..."],
  "sizeChartImage": "data:image/jpeg;base64,...",
  "sizeChartNotes": "Model is 6'1\" (185cm) wearing Size M. Boxy oversized drape with dropped shoulders.",
  "variants": [
    { "id": "v1-xs", "size": "XS", "color": "Deep Black", "sku": "LIFAZ-01-XS", "inventory": 8, "inStock": true },
    { "id": "v1-s", "size": "S", "color": "Deep Black", "sku": "LIFAZ-01-S", "inventory": 15, "inStock": true }
  ],
  "rating": 4.9,
  "reviewCount": 128,
  "featured": true,
  "badge": "Iconic"
}
```

### 2. `drops` (Capsule Drops & Seasonal Releases)
Full CRUD table powering the capsule drop system and lookbook collections.
```json
{
  "id": "drop-001",
  "dropNumber": 1,
  "title": "Drop 001: Faux Leather & Moto",
  "name": "THE RAW MINIMALISM MANIFESTO",
  "subtitle": "In collaboration with Atelier Core",
  "description": "Architectural drapes, sculpted silhouettes, and bonded vegan leather outerwear.",
  "heroImage": "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1600&auto=format&fit=crop",
  "status": "Active",
  "releaseDate": "ACTIVE NOW"
}
```

### 3. `orders` (Orders & Dispatch)
Recorded whenever a customer places an order on `/checkout`.
```json
{
  "id": "LIFAZ-BD-948210",
  "customer": "Nafis Rahman",
  "email": "nafis.rahman@dhaka.com",
  "phone": "+880 1711-234567",
  "items": "Faux Leather Trench Coat (S) x1",
  "total": 18580,
  "status": "Order Confirmed",
  "paymentMethod": "Cash on Delivery",
  "date": "OCT 2, 2026"
}
```

### 4. `categories` (Category Taxonomy)
```json
[
  "Outerwear",
  "Dresses",
  "Tops",
  "Bottoms",
  "Fleece",
  "Accessories"
]
```

### 5. `inquiries` (Concierge Contact Desk)
Created from the contact page at `/pages/contact`.
```json
{
  "id": "inq-1",
  "ticketNumber": "CONCIERGE-849201",
  "name": "Tanvir Hossain",
  "email": "tanvir@dhaka.atelier",
  "phone": "+880 1711-000001",
  "subject": "Order Status Inquiry",
  "message": "Could you please confirm the dispatch date for my coat order?",
  "orderNumber": "LIFAZ-BD-948210",
  "status": "Open",
  "createdAt": "2026-10-02T10:15:00.000Z"
}
```

### 6. `subscribers` (VIP Newsletter Drop Registrations)
```json
{
  "id": "sub-1",
  "email": "vip.collector@dhaka.com",
  "subscribedAt": "2026-09-28T08:30:00.000Z"
}
```

### 7. `hero` (Homepage Hero Banner & Editorial Studio)
```json
{
  "bannerTag": "Atelier Capsule Collection // 001",
  "showBannerTag": true,
  "title": "FAUX LEATHER & MOTO",
  "subtitle": "Monumental proportions, sculpted silhouettes, and cruelty-free craftsmanship.",
  "image": "https://images.unsplash.com/...",
  "ctaPrimaryText": "Shop Drop 001",
  "ctaPrimaryLink": "/collections/drop-001",
  "ctaSecondaryText": "Explore Archive",
  "ctaSecondaryLink": "/collections/all",
  "headlineSize": "monumental",
  "headlineFontSizeRem": 4.5,
  "headlineTracking": "wide",
  "headlineAlign": "center",
  "headlineColor": "#FFFFFF",
  "headlineTransform": "uppercase",
  "headlineLineHeight": 1.1,
  "headlineShadow": "subtle",
  "photoZoom": 100,
  "photoBrightness": 100,
  "photoContrast": 100,
  "photoPosition": "center",
  "photoFilter": "none"
}
```

---

## 🛡️ Database Security & Hardening

1. **SQL Injection Immunity:** Zero SQL concatenation — queries operate on structured JSON objects.
2. **Payload Sanitization:** All incoming mutations are filtered through [`src/lib/validation.ts`](file:///c:/Users/USER/lifaz/apps/web/src/lib/validation.ts) to strip HTML/scripts and block prototype pollution.
3. **Protected API Endpoints:** Mutating actions on `/api/db`, `/api/products`, `/api/drops`, `/api/categories`, and `/api/settings/hero` require valid `x-admin-key` authentication.
4. **Rate Limiting:** Sliding-window rate limiter prevents spam and resource exhaustion.

---

## 🖥️ Visual Database Inspector in Admin Portal

Open **`http://localhost:3000/admin`** and navigate to the **"Local Database Engine"** tab to:

- 📊 View real-time disk metrics, file size, and total row counts.
- 🗃️ Switch between all 7 tables with instant search.
- 🔍 Perform instant multi-field searches.
- 📋 Copy table data formatted as JSON.
- 📥 Download full JSON backup snapshots.
- 🗑️ Delete records directly from the database file.
