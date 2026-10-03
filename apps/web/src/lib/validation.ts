import { Product, Drop, Order, Inquiry, Subscriber, HeroSettings } from "./types";

/**
 * Strips HTML tags and potential script injections
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:[^"']*/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

/**
 * Deep sanitization for plain objects to prevent prototype pollution and XSS
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    if (typeof obj === "string") {
      return sanitizeString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block Prototype Pollution
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    // Block MongoDB / NoSQL operator keys
    if (key.startsWith("$")) {
      continue;
    }
    clean[key] = sanitizeObject(value);
  }
  return clean as T;
}

/**
 * Validate Product Payload
 */
export function validateProductInput(data: unknown): Partial<Product> {
  const sanitized = sanitizeObject(data) as Partial<Product>;
  if (!sanitized.title || typeof sanitized.title !== "string") {
    throw new Error("Product title is required");
  }
  if (typeof sanitized.price !== "number" || sanitized.price < 0) {
    throw new Error("Valid product price is required");
  }
  return sanitized;
}

import { inspectPayloadForRawCardData } from "./payment-firewall";

/**
 * Validate Order Payload with PCI-DSS & Field Firewall
 */
export function validateOrderInput(data: unknown): Partial<Order> {
  // 1. PCI-DSS Zero-PAN scan
  inspectPayloadForRawCardData(data);

  // 2. Sanitize against XSS and Prototype Pollution
  const sanitized = sanitizeObject(data) as Partial<Order>;
  if (!sanitized.customer || typeof sanitized.customer !== "string") {
    throw new Error("Customer name is required");
  }
  if (!sanitized.phone || typeof sanitized.phone !== "string") {
    throw new Error("Phone number is required");
  }
  if (!sanitized.address || typeof sanitized.address !== "string") {
    throw new Error("Delivery address is required");
  }
  return sanitized;
}

