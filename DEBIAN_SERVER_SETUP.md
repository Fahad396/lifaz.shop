# LIFAZ Atelier — Debian 13 Private Server Setup Guide

This guide walks you through converting your **Debian 13 (Trixie)** machine into a production-grade, 24/7 self-hosted private server for **LIFAZ Atelier** with 0 external cloud dependencies.

---

## 🏛️ Server Architecture on Debian 13

```
Public / Local Network
       │
       ▼
[Port 80/443] 🛡️ Nginx Reverse Proxy (SSL + Gzip + Rate Limiting)
       │
       ▼
[Port 3000]   ⚡ Next.js App (Managed by PM2 Process Cluster)
       │
       ▼
[Port 5432]   💾 Native PostgreSQL 16/17 (Local Loopback / Socket)
       │
       ▼
[Disk Backup] 🗄️ Automated Rolling Backup Vault (/backups_archive/)
```

---

## 📋 Step 1: System Packages & Node.js 20/22 LTS

Open your terminal on Debian 13:

```bash
# Update repositories and install essential build tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential nginx

# Install Node.js 20 or 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v   # v20.x.x
npm -v    # 10.x.x

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

---

## 🐘 Step 2: Native PostgreSQL on Debian 13

```bash
# Install native PostgreSQL and contrib utilities
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL on system boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create Database and Dedicated User
sudo -u postgres psql
```

Inside the PostgreSQL terminal (`psql`):

```sql
CREATE DATABASE lifaz_db;
CREATE USER lifaz_admin WITH ENCRYPTED PASSWORD 'ChooseAStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE lifaz_db TO lifaz_admin;
GRANT ALL ON SCHEMA public TO lifaz_admin;
\q
```

---

## 📦 Step 3: Configure Environment Variables

Inside `apps/web/.env.local`:

```env
# Next.js Environment
NODE_ENV=production
PORT=3000

# Native PostgreSQL Database on Localhost (0 Cloud Dependence)
DATABASE_URL="postgresql://lifaz_admin:ChooseAStrongPassword123!@localhost:5432/lifaz_db?schema=public"

# Admin Master Security Key
ADMIN_PASSKEY=YourSecretAdminPasskey2026!

# JWT Secret for Client VIP Authentication
JWT_SECRET=YourSuperSecret64CharacterJwtKeyGeneratedHere!
```

---

## ⚡ Step 4: Build & Start via PM2 (24/7 Auto-Restart)

```bash
# 1. Install dependencies and build project
npm install
npm run build

# 2. Start PM2 cluster
pm2 start ecosystem.config.js

# 3. Configure PM2 to auto-start on Debian boot/reboot
pm2 save
pm2 startup systemd
# (Run the generated sudo env command shown in the terminal)
```

Useful PM2 commands:
- `pm2 status` — Check server status and CPU/memory usage
- `pm2 logs lifaz-atelier` — View real-time application logs
- `pm2 restart lifaz-atelier` — Restart server without downtime

---

## 🛡️ Step 5: Nginx Reverse Proxy Setup

```bash
# Copy the provided Nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/lifaz.conf

# Enable the site
sudo ln -s /etc/nginx/sites-available/lifaz.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 6: Security & Firewall (UFW)

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 💾 Step 7: Automated Local Backups (Cron Job)

An automated backup script is ready at `scripts/backup-db.sh`. It automatically backs up both JSON snapshots and PostgreSQL dumps to `backups_archive/` and keeps a rolling 30-day retention.

To run it daily at 3:00 AM:

```bash
crontab -e
```

Add this line:
```cron
0 3 * * * /home/fahad/Desktop/LIFAZ/lifaz.shop/scripts/backup-db.sh >> /var/log/lifaz-backup.log 2>&1
```

---

## 🌐 Accessing Your Private Server

- **Locally / LAN**: Access via `http://YOUR_LOCAL_IP` (e.g. `http://192.168.1.100`)
- **Public Domain**: Point your domain DNS A-record to your server's Public IP, or use **Cloudflare Tunnel** (`cloudflared`) for zero-port-forwarding secure SSL access.
