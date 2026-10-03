# LIFAZ Atelier — Payment & Transaction Security (PCI-DSS)
## Enterprise Payment Security Architecture & SAQ A Compliance

This document establishes the official security architecture, transaction integrity standards, and PCI-DSS compliance specifications for **LIFAZ Atelier** across all domestic (bKash, Nagad, SSLCommerz, COD) and international (Stripe, Adyen, 3D Secure) checkout gateways.

---

## 🏛️ 1. PCI-DSS Compliance Scope (SAQ A Model)

E-commerce platforms are prime targets for card skimming, formjacking, Magecart scripts, and payment spoofing. To completely eliminate payment data liability and ensure absolute protection:

### **Zero PAN & CVV Ingestion Policy (SAQ A Compliance)**
- **Vulnerability**: Ingesting or storing Primary Account Numbers (PAN / Card Numbers), CVV / CVC security codes, or PIN blocks on our local servers exposes customer credit card details if the server is ever compromised, triggering massive financial liability, PCI-DSS Level 1 audit fines, and severe brand damage.
- **Strict Architecture Rule**: **LIFAZ NEVER touches, transmits, logs, or stores raw credit card PANs, expiration dates, or CVV security codes in application databases, server memory, or log files.**
- **Implementation**:
  - All payment card processing is offloaded 100% to **PCI-DSS Level 1 Certified Service Providers** (Stripe Elements, Adyen Hosted Fields, SSLCommerz 3D Secure, bKash Direct Checkout).
  - Hosted iframes, tokenized fields, or direct cryptographically signed gateway redirects are utilized so payment details travel directly from the customer's browser to the payment provider's hardened vault.
  - Our server only receives an opaque, single-use payment token or transaction identifier (e.g. `ch_3M...`, `trx_8A9F...`).

---

## 🔐 2. Webhook & Callback Cryptographic Verification

A common attack vector against e-commerce websites is **Payment Spoofing & Order Forgery**, where an adversary intercepts client network calls or sends crafted HTTP POST requests to the backend order endpoint to set `paymentStatus = "Paid"` without transferring actual funds.

```
┌─────────────────┐       (1) Initiate Checkout        ┌─────────────────────┐
│  LIFAZ Backend  │ ─────────────────────────────────> │   Payment Gateway   │
│   (Node Server) │ <───────────────────────────────── │  (Stripe/bKash/SSL) │
└─────────────────┘       (2) Server Secret Token      └─────────────────────┘
         ▲                                                        │
         │ (3) Cryptographic Webhook (HMAC-SHA256 Signed)         │
         └────────────────────────────────────────────────────────┘
                    [Verified with Webhook Secret]
                    [Client-Side Redirect Ignored]
```

### **The Vulnerability**
- Attackers forge payment callbacks (`/api/checkout/callback?status=SUCCESS&orderId=123`) or submit fake transaction approvals directly from browser developer tools.

### **The Solution & Implementation Standard**
1. **Never Trust Client-Side Redirects for Order Fulfillment:**
   - Client-side redirects (e.g. `https://lifaz.shop/checkout/success?trxId=abc`) are treated purely as **visual UI states**.
   - No order is marked `"Paid"`, deducted from inventory, or approved for dispatch based solely on frontend queries or client-side payload submissions.
2. **Cryptographic HMAC Signature Verification:**
   - Every payment webhook endpoint MUST verify the provider's digital signature using the shared webhook secret before parsing the payload.
   - For Stripe / Adyen:
     ```typescript
     import crypto from "crypto";

     export function verifyWebhookSignature(
       rawBody: string,
       signatureHeader: string,
       secret: string
     ): boolean {
       const [timestampPart, sigPart] = signatureHeader.split(",");
       const timestamp = timestampPart.split("=")[1];
       const signature = sigPart.split("=")[1];

       const signedPayload = `${timestamp}.${rawBody}`;
       const expectedSig = crypto
         .createHmac("sha256", secret)
         .update(signedPayload, "utf8")
         .digest("hex");

       // Constant-time comparison to prevent timing attacks
       return crypto.timingSafeEqual(
         Buffer.from(signature, "hex"),
         Buffer.from(expectedSig, "hex")
       );
     }
     ```
3. **Use Raw Request Buffers for Verification:**
   - Webhook signatures are computed over the **exact raw byte stream**. Any JSON re-serialization or whitespace alteration will break signature checks.
   - In Next.js App Router, webhooks read `await req.text()` directly before any JSON parsing.

---

## ⚡ 3. Idempotency & Replay Attack Defense

Network retries or malicious duplicate webhook replays must never cause double charges, multiple inventory deductions, or duplicate order records.

### **1. Idempotency Key Tracking**
- Every transaction initiation generates a unique cryptographic UUIDv4 **Idempotency Key** stored with the draft order.
- If a webhook or API retry is received with an already processed transaction identifier (`trxId`), the server returns HTTP `200 OK` with the existing processed status without re-executing inventory decrements or notification dispatches.

### **2. Webhook Timestamp Tolerance (Replay Defense)**
- Webhooks with a timestamp older than **300 seconds (5 minutes)** are automatically rejected with HTTP `400 Bad Request` to neutralize replay attacks.

---

## 🇧🇩 4. Local Bangladesh & Global Payment Implementations

LIFAZ supports a hardened multi-channel payment matrix tailored for Dhaka and nationwide operations:

### **A. Mobile Financial Services (bKash & Nagad Tokenized API)**
- **Workflow**:
  1. Customer selects bKash / Nagad at checkout.
  2. Server requests a payment session token via official Merchant APIs using encrypted `app_key` and `app_secret` stored in `.env.local`.
  3. Customer completes 2FA PIN on bKash/Nagad secured overlay.
  4. Server performs server-to-server **Query Payment (`/queryPayment`)** verification to confirm balance capture before updating the database.
- **Manual MFS TrxID Verification (For Direct Merchant Transfers)**:
  - When customer submits an 8-character TrxID for manual verification:
  - Status is flagged as **`paymentStatus: "Pending Verification"`** (Amber badge in Admin Studio).
  - Admin Studio provides 1-click manual settlement confirmation after cross-checking the atelier merchant statement.

### **B. Cash on Delivery (COD) & Courier Fraud Mitigation**
- **Advance Delivery Charge Safeguard**:
  - Option to mandate an advance delivery fee (৳80 Inside Dhaka / ৳150 Outside Dhaka) via bKash/Nagad before shipping high-value capsule drop pieces, preventing courier return penalties.
- **Phone Number Verification & Sanitization**:
  - Bangladesh phone numbers are validated against standard telecom prefixes (`013`, `014`, `015`, `016`, `017`, `018`, `019`) with rate-limited submission guards.

### **C. Cards & 3D Secure (Visa / Mastercard / AMEX)**
- Full 3D Secure 2.0 (3DS2) authentication with biometric/SMS OTP challenge offloaded to the issuing bank.

---

## 🛡️ 5. Payment Security Verification Checklist

| Security Control | Implementation Standard | Status |
| :--- | :--- | :--- |
| **No Raw Card Storage** | 0 PAN / CVV fields in database schema or logs | ✅ Enforced |
| **SAQ A Compliance** | Card data entered exclusively inside hosted third-party fields | ✅ Enforced |
| **HMAC Webhook Verification** | Webhooks verified with SHA256 timing-safe signatures | ✅ Enforced |
| **Server-Side Order Settlement** | Orders marked "Paid" only via verified server callbacks | ✅ Enforced |
| **Idempotent Webhook Processing** | Duplicate webhooks do not duplicate inventory decrements | ✅ Enforced |
| **Anti-Brute Force Protection** | Sliding-window rate limiting on checkout endpoints | ✅ Enforced |
| **Input Sanitization** | All customer fields sanitized against XSS/Prototype Pollution | ✅ Enforced |
| **Transport Layer Security** | HTTPS TLS 1.3 with HSTS (`max-age=63072000; includeSubDomains; preload`) | ✅ Enforced |

---

## 🚨 6. Security Incident Response Protocol

In the event of an anomalous payment event or failed signature surge:
1. **Immediate Rate Limit Throttling**: Checkout endpoints will automatically return HTTP `429 Too Many Requests` for suspicious IP ranges.
2. **Audit Logging**: All failed webhook signatures and transaction attempts are recorded in server logs with IP addresses, timestamps, and payment provider trace IDs.
3. **Atelier Admin Lockout**: Any attempt to brute-force the Admin Studio passkey triggers an immediate 15-minute IP quarantine.
