# LIFAZ Atelier — Database Architecture & Scaling Roadmap
## Native PostgreSQL & Zero-Cloud Data Engine

This document details the production database architecture, schema definitions, backup automation, and migration procedures for **LIFAZ Atelier**.

---

## 🏛️ Database Engine Architecture

LIFAZ operates on a **100% self-hosted, native PostgreSQL engine** running directly on the Linux server (`Debian 13 / Ubuntu 22.04+`):

- **Database Engine**: Native PostgreSQL 17.x daemon on `localhost:5432` / local Unix domain socket.
- **Database Name**: `lifaz_db`
- **Owner Role**: `lifaz_admin`
- **ORM & Type Safety**: Prisma ORM with strongly typed schema models in [`packages/db/schema.prisma`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/packages/db/schema.prisma).
- **Client Connector**: Direct connection pooling via [`apps/web/src/lib/prisma.ts`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/apps/web/src/lib/prisma.ts).
- **Dual Fallback Snapshot Vault**: POSIX atomic JSON rolling snapshot engine in `apps/web/data/` for instantaneous offline reads and fast recovery.

### Why 100% Self-Hosted (Zero Cloud Dependencies)?
1. **0 Monthly Cloud Bills**: No Supabase, AWS RDS, Neon, or PlanetScale compute or bandwidth fees.
2. **Sub-Millisecond Query Latency**: Database queries execute over local loopback (`127.0.0.1:5432`), bypassing internet hops.
3. **Data Sovereignty**: Complete control over all customer orders, payment TrxIDs, VIP profiles, and archival logs.
4. **Effortless Portability**: Transfer the entire store to any VPS, bare-metal server, or private device in under 5 minutes.

---

## 🗃️ Complete Data Schema (10 Tables)

| Model Name | Primary Keys & Indexes | Description & Stored Attributes |
| :--- | :--- | :--- |
| **`Product`** | `id` (UUID), `slug` (unique) | Garment title, slug, BDT pricing, compareAtPrice, color, colorHex, details, fabrication, images, sizeChartImage, sizeChartNotes, rating, reviewCount, featured, badge. |
| **`ProductVariant`** | `id` (UUID), `sku` (unique), `productId` | Relational size and inventory matrix (`XS`, `S`, `M`, `L`, `XL`, `Custom`) with real-time stock counters. |
| **`Drop`** | `id` (UUID), `dropNumber` (unique) | Capsule drop release metadata, title, manifesto name, subtitle, description, hero banner, lookbook chapters, status (`Active`, `Upcoming`, `Archived`), and release date. |
| **`Category`** | `id` (UUID), `slug` (unique) | Store department taxonomy (`outerwear`, `tops`, `tailoring`, `dresses`, `leather-goods`, `accessories`) and display order. |
| **`Order`** | `id` (UUID), `orderNumber` (unique) | 64-District deliveries, customer coordinates, advance delivery fee, due amount, payment method, payment status, TrxID, order stage, and tracking. |
| **`PaymentMethodConfig`** | `id` (UUID) | Dynamic payment channels (bKash Merchant, Nagad Merchant, Cash on Delivery, Bank Transfer, Visa/Mastercard). |
| **`User`** | `id` (UUID), `phone` (unique), `email` | Client VIP accounts, hashed passkeys, saved delivery addresses, VIP tier status, and order history. |
| **`Inquiry`** | `id` (UUID) | Concierge desk messages, contact tickets, and bespoke tailoring requests. |
| **`Subscriber`** | `id` (UUID), `email` (unique) | VIP runway newsletter registrations and notification preferences. |
| **`SystemSettings`** | `key` (unique) | Live atelier configurations, runway hero typography, mosaic layouts, and maintenance banners. |

---

## 🔒 Connection String & Environment Setup

Configure your PostgreSQL credentials in `apps/web/.env.local`:

```env
# Native PostgreSQL Database on Localhost (100% Self-Hosted on VPS)
DATABASE_URL="postgresql://lifaz_admin:fahad123%40@localhost:5432/lifaz_db?schema=public"
```

> **Note on Special Characters**: If the database password contains special characters such as `@`, ensure it is URL-percent-encoded (`@` -> `%40`).

---

## 🔄 Schema Synchronization & Migrations

```bash
# Push schema changes directly to PostgreSQL
cd packages/db
npx prisma db push

# Open interactive web GUI for live table inspections
npx prisma studio

# Generate updated Prisma Client TypeScript types
npx prisma generate
```

---

## 🛡️ Automated Backup & Disaster Recovery

LIFAZ includes built-in scripts for both automated daily backups and full system migrations:

### 1. Daily Automated Database Backups
Automated script: [`scripts/backup-db.sh`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/scripts/backup-db.sh)
- Dumps PostgreSQL schema and data using `pg_dump`.
- Creates compressed `.sql.gz` archives in `backups/` and `apps/web/data/backups/`.
- Automatically purges backups older than 30 days to protect disk space.
- Run manually: `./scripts/backup-db.sh`
- Automated via Crontab:
  ```cron
  0 3 * * * /var/www/lifaz/scripts/backup-db.sh >> /var/log/lifaz_backup.log 2>&1
  ```

### 2. Full System Export & Migration Archive
Automated script: [`scripts/export-data.sh`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/scripts/export-data.sh)
- Generates a full portable archive (`lifaz-migration-YYYYMMDD_HHMMSS.tar.gz`) containing:
  - Complete PostgreSQL SQL dump
  - JSON snapshots and data stores
  - Media uploads
  - Environment blueprints
- See [`SERVER_MIGRATION.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/SERVER_MIGRATION.md) for step-by-step transfer instructions.

### 3. One-Command Data Restoration
Automated script: [`scripts/restore-data.sh`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/scripts/restore-data.sh)
```bash
./scripts/restore-data.sh backups/lifaz-migration-YYYYMMDD_HHMMSS.tar.gz
```
