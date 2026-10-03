#!/usr/bin/env bash
# ==============================================================================
# LIFAZ Atelier — Automated Server Provisioning & Setup Script
# Works on Debian 12/13 and Ubuntu 22.04/24.04 LTS VPS & Bare-Metal Servers
# ==============================================================================

set -e

echo "================================================================="
echo "  LIFAZ ATELIER — SERVER BOOTSTRAPPER (DEBIAN / UBUNTU)"
echo "================================================================="

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run this script with sudo or as root."
  exit 1
fi

DB_USER="lifaz_admin"
DB_PASS="${DB_PASS:-fahad123@}"
DB_NAME="lifaz_db"

echo "[1/6] Updating system packages and security repositories..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw build-essential nginx postgresql postgresql-contrib certbot python3-certbot-nginx

echo "[2/6] Configuring UFW Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "[3/6] Installing Node.js LTS (v22.x) and PM2..."
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
npm install -g pm2

echo "[4/6] Initializing local PostgreSQL 17 database & user..."
systemctl enable postgresql
systemctl start postgresql

# Configure user and database safely
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE ROLE ${DB_USER} WITH LOGIN ENCRYPTED PASSWORD '${DB_PASS}';
    ELSE
        ALTER ROLE ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
EOF

echo "[5/6] Setting up automated daily backup cron job..."
BACKUP_SCRIPT="/var/www/lifaz/scripts/backup-db.sh"
if [ -f "${BACKUP_SCRIPT}" ]; then
    chmod +x "${BACKUP_SCRIPT}"
    (crontab -l 2>/dev/null | grep -v "${BACKUP_SCRIPT}" ; echo "0 3 * * * ${BACKUP_SCRIPT} >> /var/log/lifaz_backup.log 2>&1") | crontab -
    echo "      ✓ Daily backup scheduled at 03:00 AM"
fi

echo "[6/6] Verifying installations..."
echo "      Node:       $(node -v)"
echo "      NPM:        $(npm -v)"
echo "      PM2:        $(pm2 -v)"
echo "      PostgreSQL: $(psql --version)"
echo "      Nginx:      $(nginx -v 2>&1)"

echo "================================================================="
echo "  ✓ SERVER PROVISIONING COMPLETE!"
echo "================================================================="
echo "Next step: Deploy your code into /var/www/lifaz, run:"
echo "  cd /var/www/lifaz"
echo "  npm install"
echo "  npm run build"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save && pm2 startup"
echo "================================================================="
