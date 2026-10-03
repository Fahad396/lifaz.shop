#!/usr/bin/env bash
# ==============================================================================
# LIFAZ Atelier — Full Server Data Export & Migration Tool
# Generates a timestamped, portable backup archive for VPS/Server migration.
# ==============================================================================

set -e

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPORT_DIR="${ROOT_DIR}/backups/migration_${TIMESTAMP}"
ARCHIVE_NAME="lifaz-migration-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="${ROOT_DIR}/backups/${ARCHIVE_NAME}"

DB_NAME="${DB_NAME:-lifaz_db}"
DB_USER="${DB_USER:-lifaz_admin}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

echo "================================================================="
echo "  LIFAZ ATELIER — FULL DATA EXPORT FOR SERVER MIGRATION"
echo "  Timestamp: ${TIMESTAMP}"
echo "================================================================="

# Create working export directory
mkdir -p "${EXPORT_DIR}"
mkdir -p "${ROOT_DIR}/backups"

# 1. Export PostgreSQL Database (Full dump with schema + data)
echo "[1/4] Exporting PostgreSQL database '${DB_NAME}'..."
if command -v pg_dump >/dev/null 2>&1; then
    PGPASSWORD="${PGPASSWORD:-fahad123@}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        -F p \
        -f "${EXPORT_DIR}/lifaz_db_dump.sql"
    echo "      ✓ Database dumped to lifaz_db_dump.sql ($(du -h "${EXPORT_DIR}/lifaz_db_dump.sql" | cut -f1))"
else
    echo "      ⚠ pg_dump not found. Skipping PostgreSQL dump (ensure postgresql-client is installed)."
fi

# 2. Export Local JSON Datastores and Uploads
echo "[2/4] Exporting local datastores, JSON snapshots, and media..."
if [ -d "${ROOT_DIR}/apps/web/data" ]; then
    cp -r "${ROOT_DIR}/apps/web/data" "${EXPORT_DIR}/data"
    echo "      ✓ apps/web/data archived"
fi

if [ -d "${ROOT_DIR}/apps/web/public/uploads" ]; then
    cp -r "${ROOT_DIR}/apps/web/public/uploads" "${EXPORT_DIR}/uploads"
    echo "      ✓ apps/web/public/uploads archived"
fi

# 3. Export Environment and Configuration Blueprints
echo "[3/4] Exporting configuration blueprints..."
if [ -f "${ROOT_DIR}/apps/web/.env.local" ]; then
    cp "${ROOT_DIR}/apps/web/.env.local" "${EXPORT_DIR}/env.local.backup"
    echo "      ✓ .env.local archived safely"
fi

if [ -f "${ROOT_DIR}/packages/db/.env" ]; then
    cp "${ROOT_DIR}/packages/db/.env" "${EXPORT_DIR}/packages_db_env.backup"
fi

cat <<EOF > "${EXPORT_DIR}/MANIFEST.json"
{
  "project": "LIFAZ Atelier",
  "exportTimestamp": "${TIMESTAMP}",
  "database": "${DB_NAME}",
  "dbUser": "${DB_USER}",
  "dbHost": "${DB_HOST}",
  "nodeVersion": "$(node -v 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF

# 4. Compress everything into a single portable migration archive
echo "[4/4] Creating compressed migration bundle..."
cd "${ROOT_DIR}/backups"
tar -czf "${ARCHIVE_NAME}" -C "${ROOT_DIR}/backups" "migration_${TIMESTAMP}"
rm -rf "${EXPORT_DIR}"

SHA256_HASH=$(sha256sum "${ARCHIVE_PATH}" | cut -d' ' -f1)

echo "================================================================="
echo "  ✓ MIGRATION BUNDLE CREATED SUCCESSFULLY!"
echo "  File:    ${ARCHIVE_PATH}"
echo "  Size:    $(du -h "${ARCHIVE_PATH}" | cut -f1)"
echo "  SHA256:  ${SHA256_HASH}"
echo "================================================================="
echo ""
echo "To transfer this bundle to a new VPS/server, run on your terminal:"
echo "  scp ${ARCHIVE_PATH} user@NEW_SERVER_IP:/var/www/lifaz/backups/"
echo ""
echo "Then on the new server, run:"
echo "  ./scripts/restore-data.sh backups/${ARCHIVE_NAME}"
echo "================================================================="
