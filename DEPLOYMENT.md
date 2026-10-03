# Single-VPS & Private Server Production Deployment Guide
## 100% Self-Hosted on Debian 12/13 or Ubuntu 22.04/24.04 LTS (0 Cloud Dependencies)

This guide provides complete instructions to deploy the entire **LIFAZ Atelier** luxury platform onto a **single Linux VPS or private server** running native **Node.js 22 LTS**, **PostgreSQL 17**, **PM2 Process Manager**, and **Nginx** with automated SSL via **Let's Encrypt Certbot**.

---

## 🏛️ System Architecture

```
Internet (HTTPS)
   │
   ▼
[Port 80/443] 🛡️ Nginx (Reverse Proxy + Let's Encrypt SSL + Gzip + Static Cache)
   │
   ▼
[Port 3000]   ⚡ Next.js 15 App (PM2 Cluster + Sliding-Window Rate Limiter + CSP)
   │
   ▼
[Port 5432]   💾 Native PostgreSQL 17 (Local Loopback Socket — 0 Cloud Bills)
```

---

## ⚡ Fast-Track: Automated Server Bootstrap (1-Command)

If setting up a fresh Debian 13 or Ubuntu 22/24 machine, you can run the automated provisioner:

```bash
# SSH into your VPS / Server
ssh root@YOUR_SERVER_IP

# Clone repository into /var/www/lifaz
mkdir -p /var/www/lifaz
git clone <YOUR_GIT_REPO_URL> /var/www/lifaz
cd /var/www/lifaz

# Run the automated bootstrap script
sudo ./scripts/setup-server.sh
```

The script automatically provisions UFW firewall, Nginx, PostgreSQL 17, Node.js 22 LTS, PM2, Certbot, creates `lifaz_db` and user `lifaz_admin`, and installs a daily 03:00 AM backup cron job.

---

## 🛠️ Step-by-Step Manual Setup

### 1. Firewall & Security Configuration
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Install Node.js LTS (v22.x) & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 3. Initialize Native PostgreSQL 17
```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql
```

Inside the `psql` console:
```sql
CREATE DATABASE lifaz_db;
CREATE USER lifaz_admin WITH ENCRYPTED PASSWORD 'fahad123@';
GRANT ALL PRIVILEGES ON DATABASE lifaz_db TO lifaz_admin;
\c lifaz_db
GRANT ALL ON SCHEMA public TO lifaz_admin;
\q
```

### 4. Build Application & Synchronize Database
```bash
cd /var/www/lifaz/apps/web
# Configure .env.local
cp .env.example .env.local
# Set DATABASE_URL="postgresql://lifaz_admin:fahad123%40@localhost:5432/lifaz_db?schema=public"

cd /var/www/lifaz/packages/db
npx prisma db push

cd /var/www/lifaz/apps/web
npm install
npm run build
```

### 5. Launch with PM2 Process Manager
```bash
cd /var/www/lifaz
pm2 start ecosystem.config.js
pm2 save
sudo pm2 startup
```

### 6. Configure Nginx Reverse Proxy & Free SSL
```bash
sudo cp /var/www/lifaz/nginx.conf.example /etc/nginx/sites-available/lifaz.shop
sudo sed -i 's/YOUR_DOMAIN.com/lifaz.shop/g' /etc/nginx/sites-available/lifaz.shop
sudo ln -sf /etc/nginx/sites-available/lifaz.shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test syntax and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# Provision Let's Encrypt SSL
sudo certbot --nginx -d lifaz.shop -d www.lifaz.shop --non-interactive --agree-tos -m concierge@lifaz.shop
```

---

## 🔁 Automated Backups & Server Migration

- **Daily Backups**: Automated daily at 03:00 AM via [`scripts/backup-db.sh`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/scripts/backup-db.sh) with 30-day automatic retention.
- **Server Migration**: If you ever need to change VPS provider, upgrade hardware, or move to a new machine, follow the complete step-by-step guide in [`SERVER_MIGRATION.md`](file:///home/fahad/Desktop/LIFAZ/lifaz.shop/SERVER_MIGRATION.md).

---

## 📊 Maintenance Commands

| Action | Command |
| :--- | :--- |
| **Check PM2 Status** | `pm2 list` / `pm2 logs` |
| **Reload App (Zero Downtime)** | `pm2 reload ecosystem.config.js` |
| **Check PostgreSQL** | `sudo systemctl status postgresql` |
| **Check Nginx** | `sudo systemctl status nginx` |
| **Trigger Database Backup** | `./scripts/backup-db.sh` |
| **Export Entire System Bundle** | `./scripts/export-data.sh` |
