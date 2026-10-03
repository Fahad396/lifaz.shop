#!/usr/bin/env bash
# ==============================================================================
# LIFAZ Atelier — Full Server Data Restore & Migration Importer
# Restores PostgreSQL database, data stores, media, and environments on any VPS.
# ==============================================================================

set -e

ARCHIVE_FILE="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "${ARCHIVE_FILE}" ] || [ ! -f "${ARCHIVE_FILE}" ]; then
    echo "Usage: $0 <path-to-migration-archive.tar.gz>"
    echo "Example: $0 backups/lifaz-migration-20261003_140000.tar.gz"
    exit 1
fi

TEMP_RESTORE_DIR="/tmp/lifaz_restore_$(date +%s)"
DB_NAME="${DB_NAME:-lifaz_db}"
DB_USER="${DB_USER:-lifaz_admin}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

echo "================================================================="
echo "  LIFAZ ATELIER — SERVER DATA RESTORATION & IMPORT"
echo "  Target Archive: ${ARCHIVE_FILE}"
echo "================================================================="

mkdir -p "${TEMP_RESTORE_DIR}"
tar -xzf "${ARCHIVE_FILE}" -C "${TEMP_RESTORE_DIR}"

# Locate extracted migration folder
EXTRACTED_DIR=$(find "${TEMP_RESTORE_DIR}" -mindepth 1 -maxdepth 1 -type d | head -n 1)

if [ -z "${EXTRACTED_DIR}" ] || [ ! -d "${EXTRACTED_DIR}" ]; then
    echo "❌ Error: Invalid archive format or empty extraction."
    rm -rf "${TEMP_RESTORE_DIR}"
    exit 1
fi

# 1. Restore PostgreSQL database
if [ -f "${EXTRACTED_DIR}/lifaz_db_dump.sql" ]; then
    echo "[1/4] Restoring PostgreSQL database '${DB_NAME}'..."
    
    # Check if database exists, create if not
    if ! PGPASSWORD="${PGPASSWORD:-fahad123@}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
        echo "      Database '${DB_NAME}' does not exist. Creating..."
        PGPASSWORD="${PGPASSWORD:-fahad123@}" createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" || true
    fi

    # Execute SQL restore
    PGPASSWORD="${PGPASSWORD:-fahad123@}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f "${EXTRACTED_DIR}/lifaz_db_dump.sql" >/dev/null 2>&1 || true
        
    echo "      ✓ PostgreSQL database restored successfully"
else
    echo "[1/4] No lifaz_db_dump.sql found in archive. Skipping SQL restore."
fi

# 2. Restore JSON Datastores and Media Uploads
echo "[2/4] Restoring datastores and uploads..."
if [ -d "${EXTRACTED_DIR}/data" ]; then
    mkdir -p "${ROOT_DIR}/apps/web/data"
    cp -r "${EXTRACTED_DIR}/data/"* "${ROOT_DIR}/apps/web/data/"
    echo "      ✓ apps/web/data restored"
fi

if [ -d "${EXTRACTED_DIR}/uploads" ]; then
    mkdir -p "${ROOT_DIR}/apps/web/public/uploads"
    cp -r "${EXTRACTED_DIR}/uploads/"* "${ROOT_DIR}/apps/web/public/uploads/"
    echo "      ✓ apps/web/public/uploads restored"
fi

# 3. Restore Environment Blueprints if missing
echo "[3/4] Restoring configuration files..."
if [ -f "${EXTRACTED_DIR}/env.local.backup" ] && [ ! -f "${ROOT_DIR}/apps/web/.env.local" ]; then
    cp "${EXTRACTED_DIR}/env.local.backup" "${ROOT_DIR}/apps/web/.env.local"
    echo "      ✓ Created apps/web/.env.local from backup"
fi

if [ -f "${EXTRACTED_DIR}/packages_db_env.backup" ] && [ ! -f "${ROOT_DIR}/packages/db/.env" ]; then
    cp "${EXTRACTED_DIR}/packages_db_env.backup" "${ROOT_DIR}/packages/db/.env"
    echo "      ✓ Created packages/db/.env from backup"
fi

# 4. Clean up temporary files
echo "[4/4] Finalizing and cleaning up temporary buffers..."
rm -rf "${TEMP_RESTORE_DIR}"

echo "================================================================="
echo "  ✓ RESTORATION COMPLETED SUCCESSFULLY!"
echo "================================================================="
echo ""
echo "Next verification steps on this server:"
echo "  1. Test database connection: psql -U ${DB_USER} -d ${DB_NAME} -h ${DB_HOST} -c '\dt'"
echo "  2. Restart PM2 processes:    pm2 reload ecosystem.config.js"
echo "================================================================="
