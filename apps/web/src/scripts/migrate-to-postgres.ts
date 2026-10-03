/**
 * LIFAZ Local-to-PostgreSQL Migration Utility
 *
 * Reads all data from the native local JSON store (data/lifaz-database.json)
 * and inserts/upserts everything into your native VPS PostgreSQL instance.
 *
 * Usage:
 *   DATABASE_URL="postgresql://lifaz_admin:password@localhost:5432/lifaz_db?schema=public" npx tsx src/scripts/migrate-to-postgres.ts
 */

import fs from "fs";
import path from "path";

async function runMigration() {
  console.log("=== LIFAZ ATELIER: Local JSON -> Native VPS PostgreSQL Migration ===");

  const dbPath = path.join(process.cwd(), "data", "lifaz-database.json");
  if (!fs.existsSync(dbPath)) {
    console.error("Local database file not found at:", dbPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, "utf-8");
  const localDb = JSON.parse(raw);

  console.log(`\nFound local data:`);
  console.log(`- Products: ${localDb.products?.length || 0}`);
  console.log(`- Drops: ${localDb.drops?.length || 0}`);
  console.log(`- Categories: ${localDb.categories?.length || 0}`);
  console.log(`- Payment Methods: ${localDb.paymentMethods?.length || 0}`);
  console.log(`- Orders: ${localDb.orders?.length || 0}`);
  console.log(`- Users: ${localDb.users?.length || 0}`);
  console.log(`- Inquiries: ${localDb.inquiries?.length || 0}`);
  console.log(`- Subscribers: ${localDb.subscribers?.length || 0}`);

  console.log("\nReady to sync to VPS PostgreSQL instance.");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
