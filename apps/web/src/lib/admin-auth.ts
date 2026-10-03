import crypto from "crypto";

const MASTER_PASSKEY =
  process.env.ADMIN_PASSKEY ||
  process.env.ADMIN_SECRET_KEY ||
  "lifaz_atelier_passkey_2026";

/**
 * Constant-time string comparison to prevent timing attacks
 */
function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Run dummy timing comparison to avoid length leak
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies if the provided passkey matches the master admin key
 */
export function verifyAdminPasskey(candidate: string | undefined | null): boolean {
  if (!candidate) return false;
  return safeEqual(candidate.trim(), MASTER_PASSKEY.trim());
}

/**
 * Checks request headers (Authorization Bearer or x-admin-key)
 */
export function isAuthorizedAdminRequest(headers: Headers): boolean {
  const authHeader = headers.get("authorization");
  const adminKeyHeader = headers.get("x-admin-key");

  if (adminKeyHeader && verifyAdminPasskey(adminKeyHeader)) {
    return true;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    return verifyAdminPasskey(token);
  }

  return false;
}
