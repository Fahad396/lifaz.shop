import crypto from "crypto";

/**
 * LIFAZ Atelier — Payment & Transaction Security Firewall (PCI-DSS & SAQ A)
 *
 * 1. Zero-PAN / CVV Scanner (Blocks any raw cardholder data from entering backend).
 * 2. Cryptographic HMAC-SHA256 Timing-Safe Webhook Signature Verification.
 * 3. Replay Attack Defense with 300s Timestamp Tolerance Window.
 * 4. Idempotency Key Tracking (Prevents duplicate order fulfillment & double charges).
 */

// In-memory processed transaction cache for instant idempotency checks
const processedTransactions = new Map<string, { timestamp: number; status: string }>();

// Clean up idempotency keys older than 24 hours
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  for (const [trxId, record] of processedTransactions.entries()) {
    if (now - record.timestamp > maxAge) {
      processedTransactions.delete(trxId);
    }
  }
}, 60 * 60 * 1000);

/**
 * Luhn Algorithm Check — Identifies valid credit card numbers
 */
function isLuhnValid(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * PCI-DSS Zero-PAN / CVV Data Firewall
 * Deep-scans any incoming payload. Throws a security exception if raw card numbers
 * or CVV codes are detected anywhere in the payload.
 */
export function inspectPayloadForRawCardData(payload: unknown, depth = 0): void {
  if (depth > 6 || !payload) return;

  if (typeof payload === "string") {
    // 1. Check for 13-19 digit continuous or hyphenated card numbers (Visa, MC, AMEX, etc.)
    const potentialCards = payload.match(/\b(?:\d[ -]*?){13,19}\b/g);
    if (potentialCards) {
      for (const cardCandidate of potentialCards) {
        const cleanDigits = cardCandidate.replace(/\D/g, "");
        if (isLuhnValid(cleanDigits)) {
          throw new Error(
            "PCI-DSS Violation: Raw cardholder PAN detected in request payload. Card data must be tokenized via hosted provider fields."
          );
        }
      }
    }

    // 2. Check for explicit CVV/CVC keywords accompanied by 3-4 digits
    if (/(\bcvv\b|\bcvc\b|\bsecurity_code\b)\s*[:=]\s*\d{3,4}/i.test(payload)) {
      throw new Error(
        "PCI-DSS Violation: Raw CVV/CVC detected in request payload. Security codes must never be transmitted to application backend."
      );
    }
    return;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      inspectPayloadForRawCardData(item, depth + 1);
    }
    return;
  }

  if (typeof payload === "object") {
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();

      // Block dangerous card fields by property name
      if (
        lowerKey === "cardnumber" ||
        lowerKey === "pan" ||
        lowerKey === "cvv" ||
        lowerKey === "cvc" ||
        lowerKey === "securitycode" ||
        lowerKey === "card_number"
      ) {
        throw new Error(
          `PCI-DSS Violation: Prohibited field '${key}' detected in request body. Use tokenized payment tokens only.`
        );
      }

      inspectPayloadForRawCardData(value, depth + 1);
    }
  }
}

/**
 * Timing-Safe HMAC-SHA256 Webhook Signature Verification
 * Prevents timing attacks, forged webhooks, and payment callback spoofing.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string
): { isValid: boolean; reason?: string } {
  if (!signatureHeader || !webhookSecret) {
    return { isValid: false, reason: "Missing signature header or webhook secret" };
  }

  try {
    // Standard format: t=1728000000,v1=abcdef... or direct hex signature
    let timestamp = "";
    let signature = "";

    if (signatureHeader.includes("t=") && signatureHeader.includes("v1=")) {
      const parts = signatureHeader.split(",");
      for (const part of parts) {
        const [k, v] = part.trim().split("=");
        if (k === "t") timestamp = v;
        if (k === "v1" || k === "sig") signature = v;
      }
    } else {
      signature = signatureHeader.trim();
    }

    // Replay attack defense: Verify timestamp if present (max 300s drift)
    if (timestamp) {
      const parsedTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - parsedTime) > 300) {
        return { isValid: false, reason: "Webhook timestamp expired (replay attack defense)" };
      }
    }

    const payloadToSign = timestamp ? `${timestamp}.${rawBody}` : rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadToSign, "utf8")
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (sigBuffer.length !== expectedBuffer.length) {
      return { isValid: false, reason: "Signature buffer length mismatch" };
    }

    const isMatch = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    return { isValid: isMatch, reason: isMatch ? undefined : "Cryptographic signature mismatch" };
  } catch (err: unknown) {
    return {
      isValid: false,
      reason: `Signature evaluation error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

/**
 * Webhook Idempotency Lock
 * Ensures a transaction is processed exactly once, preventing double-fulfillments.
 */
export function recordIdempotentTransaction(
  trxId: string,
  status: string
): { isDuplicate: boolean; previousStatus?: string } {
  if (!trxId) return { isDuplicate: false };

  const existing = processedTransactions.get(trxId);
  if (existing) {
    return { isDuplicate: true, previousStatus: existing.status };
  }

  processedTransactions.set(trxId, { timestamp: Date.now(), status });
  return { isDuplicate: false };
}
