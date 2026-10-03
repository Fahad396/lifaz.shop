#!/bin/bash
# ==============================================================================
# LIFAZ Atelier — Automated Local Backup Script (Debian 13)
# ==============================================================================
# Cron Example (Run daily at 3:00 AM):
# 0 3 * * * /home/fahad/Desktop/LIFAZ/lifaz.shop/scripts/backup-db.sh >> /var/log/lifaz-backup.log 2>&1

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups_archive"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting LIFAZ backup on Debian 13..."

# 1. Backup Local JSON Database
if [ -f "${PROJECT_DIR}/apps/web/data/lifaz-database.json" ]; then
    cp "${PROJECT_DIR}/apps/web/data/lifaz-database.json" "${BACKUP_DIR}/lifaz-json-${TIMESTAMP}.json"
    echo "✓ Local JSON snapshot created: lifaz-json-${TIMESTAMP}.json"
fi

# 2. Backup PostgreSQL (if active)
if command -v pg_dump >/dev/null 2>&1; then
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw lifaz_db; then
        sudo -u postgres pg_dump lifaz_db | gzip > "${BACKUP_DIR}/lifaz-pg-${TIMESTAMP}.sql.gz"
        echo "✓ PostgreSQL compressed dump created: lifaz-pg-${TIMESTAMP}.sql.gz"
    fi
fi

# 3. Retain only last 30 backups (Prune older files)
find "${BACKUP_DIR}" -type f -mtime +30 -delete
echo "✓ Old backups pruned (Retention: 30 days)."
echo "[$(date)] Backup completed successfully."
