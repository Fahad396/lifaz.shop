# LIFAZ Atelier — Server & VPS Migration Playbook
## 100% Self-Hosted Zero-Downtime Transfer Guide

This document is the definitive operational playbook for moving **LIFAZ Atelier** from one physical server/VPS to any new Linux server (Debian 12/13, Ubuntu 22.04/24.04 LTS, RHEL, etc.) with **0 data loss** and **0 cloud lock-in**.

---

## 🏛️ System Portability Philosophy

LIFAZ is engineered to be **100% self-contained**:
- **Database**: Native PostgreSQL 17 running on localhost (`127.0.0.1:5432`) with zero external cloud dependencies (no Supabase, AWS RDS, or PlanetScale dependencies).
- **Process Manager**: PM2 cluster running Next.js 15 App Router.
- **Reverse Proxy**: Nginx handling SSL (Let's Encrypt Certbot), HTTP/2, Gzip, and static asset caching.
- **Data Stores**: PostgreSQL schemas + local snapshot rollups in `apps/web/data/`.

Because the entire stack is self-contained, **the entire store can be packed, transferred, and restored on a new server in under 5 minutes.**

---

## ⚡ The 3-Step Express Migration (Automated)

### Step 1: On the OLD Server (Export Everything)
Run the automated export script inside the project root:
```bash
cd /path/to/lifaz.shop
./scripts/export-data.sh
```

**What this does automatically:**
1. Generates a clean, consistent PostgreSQL dump (`lifaz_db_dump.sql`).
2. Archives all JSON stores and rollback snapshot vaults (`apps/web/data/`).
3. Archives all uploaded media and product imagery (`apps/web/public/uploads/`).
4. Backs up environment configurations (`.env.local` and `packages/db/.env`).
5. Packages everything into a timestamped, compressed tarball (e.g. `backups/lifaz-migration-20261003_144943.tar.gz`) with a SHA256 checksum.

---

### Step 2: Transfer the Migration Bundle to the NEW Server
Transfer the project code and the backup bundle to your new server IP:

```bash
# Option A: If cloning repository fresh on new server
# 1. SSH into new server and clone your git repository:
ssh user@NEW_SERVER_IP
sudo mkdir -p /var/www/lifaz && sudo chown -R $USER:$USER /var/www/lifaz
git clone <YOUR_GIT_REPO_URL> /var/www/lifaz
mkdir -p /var/www/lifaz/backups

# 2. From your local machine / old server, copy the backup file to the new server:
scp backups/lifaz-migration-*.tar.gz user@NEW_SERVER_IP:/var/www/lifaz/backups/
```

```bash
# Option B: Direct RSYNC (copies entire workspace including files in one command):
rsync -avz --exclude 'node_modules' --exclude '.next' /path/to/lifaz.shop/ user@NEW_SERVER_IP:/var/www/lifaz/
```

---

### Step 3: On the NEW Server (Bootstrap & Restore)

#### A. Bootstrap OS Dependencies (If fresh server)
Run the bootstrap installer (provisions PostgreSQL 17, Node.js, PM2, Nginx, Certbot, UFW):
```bash
cd /var/www/lifaz
sudo ./scripts/setup-server.sh
```

#### B. Restore the Database and Media
Run the restore script pointing to your transfer archive:
```bash
./scripts/restore-data.sh backups/lifaz-migration-20261003_144943.tar.gz
```

#### C. Build and Start Application
```bash
cd /var/www/lifaz/packages/db && npx prisma db push
cd /var/www/lifaz/apps/web
npm install
npm run build
pm2 start /var/www/lifaz/ecosystem.config.js
pm2 save
sudo pm2 startup
```

---

## 🌐 Zero-Downtime DNS & SSL Cutover

Follow these steps to transition domain traffic (`lifaz.shop`) without dropping customer transactions:

### 1. Pre-Migration DNS TTL Reduction (24–48 Hours Prior)
- Log into your DNS provider (Cloudflare, Namecheap, Route53, etc.).
- Change the **TTL** of `lifaz.shop` and `www.lifaz.shop` from `86400` (24h) or `Auto` to **`300` (5 minutes)**.
- This ensures DNS changes propagate worldwide within 5 minutes when you switch IPs.

### 2. Configure Nginx on the New Server
Copy the production Nginx configuration:
```bash
sudo cp /var/www/lifaz/nginx.conf.example /etc/nginx/sites-available/lifaz.shop
sudo sed -i 's/YOUR_DOMAIN.com/lifaz.shop/g' /etc/nginx/sites-available/lifaz.shop
sudo ln -sf /etc/nginx/sites-available/lifaz.shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Provision Free SSL via Let's Encrypt Certbot
```bash
sudo certbot --nginx -d lifaz.shop -d www.lifaz.shop --non-interactive --agree-tos -m concierge@lifaz.shop
```

### 4. Switch Domain A Record
- In your DNS panel, update the **A Record** (`@`) and `www` to point to the **NEW_SERVER_IP**.
- Because the TTL is 300 seconds, traffic will route to the new server within 5 minutes.

---

## 🛠️ Detailed Manual Migration (Alternative to Scripts)

If you prefer to perform the migration manually step-by-step:

### 1. Database Dump & Restore
**On Old Server:**
```bash
PGPASSWORD='fahad123@' pg_dump -U lifaz_admin -d lifaz_db -h 127.0.0.1 -F p -f lifaz_db_backup.sql
```

**On New Server:**
```bash
# Create user & database
sudo -u postgres psql -c "CREATE ROLE lifaz_admin WITH LOGIN ENCRYPTED PASSWORD 'fahad123@';"
sudo -u postgres psql -c "CREATE DATABASE lifaz_db OWNER lifaz_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lifaz_db TO lifaz_admin;"
sudo -u postgres psql -d lifaz_db -c "GRANT ALL ON SCHEMA public TO lifaz_admin;"

# Restore SQL data
PGPASSWORD='fahad123@' psql -U lifaz_admin -d lifaz_db -h 127.0.0.1 -f lifaz_db_backup.sql
```

### 2. File & Upload Sync
```bash
rsync -avz /path/to/lifaz.shop/apps/web/data/ user@NEW_SERVER_IP:/var/www/lifaz/apps/web/data/
rsync -avz /path/to/lifaz.shop/apps/web/public/uploads/ user@NEW_SERVER_IP:/var/www/lifaz/apps/web/public/uploads/
rsync -avz /path/to/lifaz.shop/apps/web/.env.local user@NEW_SERVER_IP:/var/www/lifaz/apps/web/.env.local
```

---

## ✅ Post-Migration Verification Checklist

After restoring to the new server or VPS, perform this 5-minute health check:

| Step | Verification Command / Action | Expected Result |
| :--- | :--- | :--- |
| **1. Database Relations** | `psql -U lifaz_admin -d lifaz_db -h 127.0.0.1 -c "\dt"` | Shows all 10 tables (`Product`, `Drop`, `Order`, etc.) |
| **2. Prisma Connectivity** | `cd packages/db && npx prisma db push` | Returns `The database is already in sync` |
| **3. PM2 Process Status** | `pm2 list` | `lifaz-web` cluster status is `online` with 0 restarts |
| **4. Port 3000 Response** | `curl -I http://127.0.0.1:3000` | HTTP `200 OK` or `307 Redirect` |
| **5. Nginx Proxy & HTTPS** | `curl -I https://lifaz.shop` | HTTP `200 OK` with valid SSL cert |
| **6. Admin Studio Access** | Open `https://lifaz.shop/admin` | Prompts for Admin Passkey, authenticates seamlessly |
| **7. Order Flow & Badges** | Update an order status in Admin Studio | Status badge updates with real-time color badges |
| **8. Automated Backup Cron** | `crontab -l` | Daily backup entry `0 3 * * * /var/www/lifaz/scripts/backup-db.sh` is present |

---

## 🛟 Disaster Recovery & Rollback Plan

If you encounter any unexpected network or ISP issue during migration:
1. **Immediate Rollback**: Revert your DNS **A Record** back to the OLD_SERVER_IP. Traffic will immediately flow back to the original server within 5 minutes.
2. **Point-In-Time Backup**: All backups created by `./scripts/export-data.sh` and `./scripts/backup-db.sh` are stored in `backups/` and `apps/web/data/backups/`.
3. **Database Integrity**: The export script uses PostgreSQL `--clean --if-exists` flags, meaning re-running a restore will cleanly recreate tables without corrupting foreign keys or dropping orphaned rows.
