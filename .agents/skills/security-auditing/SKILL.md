---
name: security-auditing
description: Security guidelines, rate-limiting rules, passkey verification, and input sanitization protocols for the LIFAZ luxury store.
---

# Security & Auditing Guidelines for LIFAZ

## 1. Admin Authentication
- The `/admin` portal requires passkey authorization (`ADMIN_PASSKEY` in `.env.local`).
- Verification endpoints check authorization headers (`Authorization: Bearer <TOKEN>`) via `src/lib/admin-auth.ts`.
- Never expose passkeys, API keys, or raw tokens in client console logs or public bundles.

## 2. Rate Limiting
- Public read endpoints are rate-limited to 60 req/min per IP.
- Mutation and checkout endpoints are rate-limited to 10 req/min per IP via `src/lib/rate-limiter.ts`.
- Supports in-memory sliding window and optional Upstash Redis cloud distributed cache.

## 3. Input Sanitization & SQL/XSS Defense
- All inputs must be sanitized using `src/lib/validation.ts`.
- Strips HTML tags, script tags, and malicious payloads before persisting to storage.
- File uploads are restricted to `image/jpeg`, `image/png`, `image/webp`, `image/avif` with size limits.
