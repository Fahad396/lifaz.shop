# Single-VPS Production Deployment Guide (No Docker / No External DB)

This guide provides complete, step-by-step instructions to deploy the entire **LIFAZ Atelier** project onto a **single Linux VPS** (Ubuntu 22.04 / 24.04 LTS) running native **Node.js 20 LTS**, **PostgreSQL**, **PM2**, and **Nginx** with free SSL certificates via **Let's Encrypt Certbot**.

---

## 🏛️ VPS Topology

```
Internet (HTTPS)
   │
   ▼
[Port 80/443] 🛡️ Nginx (Reverse Proxy + Let's Encrypt SSL + Gzip + Rate Limits)
   │
   ▼
[Port 3000]   ⚡ Next.js App (Managed by PM2 Process Manager + Built-In Rate Limiting & CSP)
   │
   ▼
[Port 5432]   💾 Native PostgreSQL / Local Database (Loopback Socket)
```

---

## 📋 Step 1: Initial VPS Setup & Firewall

SSH into your fresh VPS as `root`:
```bash
ssh root@YOUR_SERVER_IP
```

Update packages and install core build utilities:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential
```

Configure firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable -y
```

---

## ⚡ Step 2: Install Node.js 20 LTS & PM2

```bash
# Add NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v # v20.x.x
npm -v

# Install PM2 globally
sudo npm install -g pm2
```

---

## 🐘 Step 3: Install & Configure Native PostgreSQL (Optional if using Prisma)

```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL on boot
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create database and user:
```bash
sudo -u postgres psql
```

Inside the `psql` console, run:
```sql
CREATE DATABASE lifaz_db;
CREATE USER lifaz_admin WITH ENCRYPTED PASSWORD 'ChooseAStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE lifaz_db TO lifaz_admin;
GRANT ALL ON SCHEMA public TO lifaz_admin;
\q
```

---

## 📦 Step 4: Clone Repository & Build Application

```bash
# Create web directory and set ownership
sudo mkdir -p /var/www/lifaz
sudo chown -R $USER:$USER /var/www/lifaz

# Clone your repository
cd /var/www/lifaz
git clone <YOUR_GIT_REPO_URL> .

# Install dependencies
npm install
```

Configure environment variables:
```bash
nano apps/web/.env
```

Add your production configuration:
```env
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="https://lifaz.shop"

# Admin Master Security Key
ADMIN_SECRET_KEY="ChooseAStrongAdminPasskey2026!"

# Optional PostgreSQL Connection (if using Prisma)
DATABASE_URL="postgresql://lifaz_admin:ChooseAStrongPassword123!@localhost:5432/lifaz_db?schema=public"

# Auth Secrets
NEXTAUTH_SECRET="your-generated-random-32-character-secret-key"
NEXTAUTH_URL="https://lifaz.shop"
```

Build the Next.js production bundle:
```bash
cd apps/web
npm run build
```

---

## 🔄 Step 5: Start & Manage App with PM2

```bash
# Start Next.js with PM2
cd /var/www/lifaz/apps/web
pm2 start npm --name "lifaz" -- start

# Save process list and generate systemd startup hook
pm2 save
pm2 startup
```

Useful PM2 commands:
- `pm2 status` — View application status and memory usage.
- `pm2 logs lifaz` — View live application logs.
- `pm2 restart lifaz` — Restart the application after code updates.

---

## 🛡️ Step 6: Configure Nginx Reverse Proxy & Security

Install Nginx:
```bash
sudo apt install -y nginx
```

Create site configuration:
```bash
sudo nano /etc/nginx/sites-available/lifaz.shop
```

Paste configuration:
```nginx
# Rate Limiting Zone at Nginx Level
limit_req_zone $binary_remote_addr zone=lifaz_limit:10m rate=30r/s;

server {
    listen 80;
    listen [::]:80;
    server_name lifaz.shop www.lifaz.shop;

    # Maximum upload size for high-res product photos & size chart specs
    client_max_body_size 25M;

    # Apply Rate Limiting
    limit_req zone=lifaz_limit burst=50 nodelay;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_vary on;

    # Cache static Next.js assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy all traffic to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/lifaz.shop /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 7: Setup Free SSL with Let's Encrypt

Ensure your domain DNS `A` records (`@` and `www`) point to your VPS IP, then run:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lifaz.shop -d www.lifaz.shop
```

Certbot automatically schedules auto-renewal cron tasks.

---

## 💾 Step 8: Automated Daily Database Backups

Create a daily local backup cron job:
```bash
sudo mkdir -p /var/backups/lifaz_db
crontab -e
```

For PostgreSQL:
```cron
0 3 * * * PGPASSWORD='ChooseAStrongPassword123!' pg_dump -U lifaz_admin -h localhost lifaz_db | gzip > /var/backups/lifaz_db/db_$(date +\%F).sql.gz && find /var/backups/lifaz_db/ -type f -mtime +14 -delete
```

For Flat-File Database (`lifaz-database.json`):
```cron
0 3 * * * cp /var/www/lifaz/apps/web/data/lifaz-database.json /var/backups/lifaz_db/lifaz-db_$(date +\%F).json && find /var/backups/lifaz_db/ -type f -mtime +14 -delete
```
