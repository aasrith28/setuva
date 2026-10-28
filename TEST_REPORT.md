# SETUVA — Test Execution & Validation Report

> **Project:** SETUVA (formerly ApplyRight) — AI-Powered Government Application Companion  
> **Test Framework:** Vitest v2.1.9 / Next.js 14.2.35 Compiler / Prisma Client v5.22.0  
> **Date:** 2026-10-28  
> **Overall Result:** 100% Automated Tests Passed (21/21) | Production Build Passed (25/25 Routes)

---

## 1. Automated Test Execution Summary

Command executed:
```powershell
npm test
```

### Test Suite Results

```text
 RUN  v2.1.9 E:/ApplyRight

 ✓ tests/unit/ssrf-validator.test.ts (4 tests) 6ms
 ✓ tests/unit/eligibility-engine.test.ts (5 tests) 9ms
 ✓ tests/integration/api-auth-and-access.test.ts (3 tests) 6ms
 ✓ tests/unit/prompt-injection.test.ts (3 tests) 6ms
 ✓ tests/unit/rate-limiter.test.ts (3 tests) 87ms
 ✓ tests/security/auth-session.test.ts (3 tests) 774ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Duration  2.18s
```

---

## 2. Test Cases Breakdown

### Suite 1: `tests/unit/eligibility-engine.test.ts` (Deterministic Eligibility)
1. `returns 'potentially_eligible' when all mandatory criteria pass` — **PASS**
2. `returns 'not_eligible' when a mandatory rule fails` — **PASS**
3. `returns 'insufficient_information' when mandatory answers are missing` — **PASS**
4. `returns 'needs_official_verification' when service status is stale or conflicting` — **PASS**
5. `evaluates boolean operator correctly for both boolean and string representations` — **PASS**

### Suite 2: `tests/unit/ssrf-validator.test.ts` (SSRF & Official URLs)
1. `approves official HTTPS government URLs` — **PASS**
2. `rejects non-HTTPS protocols (http, ftp, javascript, file)` — **PASS**
3. `blocks private IP ranges, loopback, and cloud metadata (10.x, 192.168.x, 172.16.x, 127.x, 169.254.x, [::1])` — **PASS**
4. `enforces strict government-only domain filtering when requested` — **PASS**

### Suite 3: `tests/unit/prompt-injection.test.ts` (AI Adversarial Security)
1. `detects system override attempts ("ignore previous instructions", "developer mode", "system prompt")` — **PASS**
2. `detects code and SQL injection attempts (<script>, SELECT * FROM, DROP TABLE)` — **PASS**
3. `permits legitimate questions regarding government schemes` — **PASS**

### Suite 4: `tests/unit/rate-limiter.test.ts` (Abuse & DoS Throttling)
1. `allows requests under the specified limit` — **PASS**
2. `blocks requests once the limit is exceeded` — **PASS**
3. `resets rate limit counter after the time window expires` — **PASS**

### Suite 5: `tests/security/auth-session.test.ts` (Authentication & Cryptography)
1. `securely hashes passwords with salt and verifies matches (bcrypt 12 rounds)` — **PASS**
2. `signs and verifies JWT session tokens with tamper detection` — **PASS**
3. `enforces secure cookie attributes (HttpOnly, SameSite=Lax, Secure)` — **PASS**

### Suite 6: `tests/integration/api-auth-and-access.test.ts` (Input Validation & Schemas)
1. `enforces strict password complexity on registration (uppercase, number, min length)` — **PASS**
2. `validates UUID format for service and tracker identifiers to prevent injection` — **PASS**
3. `rejects invalid slugs and missing required fields in administrative creation` — **PASS**

---

## 3. Production Build Validation

Command executed:
```powershell
npm run build
```

Result:
```text
  ▲ Next.js 14.2.35
  - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (25/25)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                    Size     First Load JS
┌ ƒ /                                          464 B          96.4 kB
├ ○ /_not-found                                873 B          88.1 kB
├ ○ /about                                     142 B          87.4 kB
├ ƒ /admin                                     182 B          96.2 kB
├ ƒ /api/admin/audit-logs                      0 B                0 B
├ ƒ /api/admin/services                        0 B                0 B
├ ƒ /api/admin/services/[id]/publish           0 B                0 B
├ ƒ /api/admin/sources                         0 B                0 B
├ ƒ /api/applications                          0 B                0 B
├ ƒ /api/applications/[id]                     0 B                0 B
├ ƒ /api/applications/[id]/checklist/[itemId]  0 B                0 B
├ ƒ /api/assistant/ask                         0 B                0 B
├ ƒ /api/auth/login                            0 B                0 B
├ ƒ /api/auth/logout                           0 B                0 B
├ ƒ /api/auth/me                               0 B                0 B
├ ƒ /api/auth/register                         0 B                0 B
├ ƒ /api/eligibility/check                     0 B                0 B
├ ƒ /api/reminders                             0 B                0 B
├ ƒ /api/reminders/[id]                        0 B                0 B
├ ƒ /api/saved-services                        0 B                0 B
├ ƒ /api/saved-services/[id]                   0 B                0 B
├ ƒ /api/services                              0 B                0 B
├ ƒ /api/services/[id]                         0 B                0 B
├ ƒ /dashboard                                 182 B          96.2 kB
├ ƒ /dashboard/applications/[id]               2 kB             98 kB
├ ƒ /dashboard/saved-services                  182 B          96.2 kB
├ ○ /privacy                                   142 B          87.4 kB
├ ○ /register                                  2.73 kB        98.7 kB
├ ƒ /services                                  182 B          96.2 kB
├ ƒ /services/[slug]                           3.38 kB        99.4 kB
└ ○ /sign-in                                   2.48 kB        98.5 kB
+ First Load JS shared by all                  87.3 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Exit code: `0` (Success).

---

## 4. Test Failures & Resolved Defects

1. **IPv6 Loopback SSRF Test Failure:**
   - *Failure:* Initial test for `https://[::1]/internal` returned `isValid: true` because `new URL().hostname` kept brackets around IPv6 addresses.
   - *Fix:* Regex updated to handle optional bracket delimiters (`^\[?::1\]?$`). Re-executed tests; suite passed cleanly.

2. **TypeScript Downlevel Iteration:**
   - *Failure:* `rateLimitStore.entries()` caused TypeScript compilation failure during Next.js build.
   - *Fix:* Refactored to `rateLimitStore.forEach()` and set `"target": "es2022"` in `tsconfig.json`.

---

## 5. Environment & Tool Limitations

1. **Live Transactional Email Dispatch:**
   - External SMTP / SES email transmission was verified through data model persistence and input validation. Live network transmission requires live SMTP server credentials.
2. **PostgreSQL Hosted Instance:**
   - The test environment executed using SQLite (`file:./dev.db`) through Prisma's engine. Production deployment target PostgreSQL requires cloud RDS / Neon connection string.
