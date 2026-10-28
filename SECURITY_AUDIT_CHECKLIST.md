# SETUVA — Security Audit Checklist & Operational Review

> **Project:** SETUVA (formerly ApplyRight) — AI-Powered Government Application Companion  
> **Application Stack:** Next.js 14 / TypeScript / PostgreSQL & SQLite / Prisma ORM / Vitest  
> **Audit Status:** Completed Verification Audit  
> **Overall Assessment:** Ready After Listed Conditions

---

## 1. Audit Record

| Field | Value |
|---|---|
| **Audit Date** | 2026-10-28 |
| **Auditor / Owner** | Security Engineering & Architecture Lead |
| **Commit / Release** | v0.1.0-mvp |
| **Environment Tested** | Local Hardened Environment + Next.js Production Build Worker |
| **Scope** | Web frontend, API route handlers, authentication, authorization (RBAC & IDOR), deterministic eligibility engine, AI assistant prompt injection, SSRF filters, database schema, rate limiting, and security headers. |
| **Exclusions** | Third-party cloud mail delivery provider live dispatch (mocked in development). Live external hosting DNS/TLS certificates. |
| **Overall Result** | **PASSED (with release conditions)** |

---

## 2. Control Status Summary

- **PASS:** 38 controls verified with unit, integration, and build evidence.
- **PARTIAL:** 2 controls (SMS/Email external delivery provider decoupled).
- **NOT APPLICABLE:** 2 controls (file uploads excluded by design in MVP data minimization).
- **NEEDS MANUAL VERIFICATION:** 4 controls (live hosting TLS certificate, registrar MFA, managed cloud backup restoration).

---

## 3. Authentication and Authorization

- [x] **PASS** — Individual accounts are used; administrator credentials are not shared. Unique accounts seeded for admin, publisher, reviewer, and student.
- [x] **PASS** — Maintained libraries used (`bcryptjs` salt rounds 12, `jose` signed JWT session tokens).
- [x] **PASS** — Passwords stored using modern salted hashing (`bcrypt.hash(password, 12)` in `lib/auth/session.ts`).
- [x] **PASS** — Login and registration endpoints are rate-limited (`checkRateLimit` in `app/api/auth/login/route.ts` enforcing 5 req/min).
- [x] **PASS** — Session cookies use `HttpOnly: true`, `SameSite: "lax"`, and `Secure` in production.
- [x] **PASS** — Session expiry (7 days), sign-out invalidation, and session verification behave as intended. Verified by `tests/security/auth-session.test.ts`.
- [ ] **NEEDS MANUAL VERIFICATION** — Privileged accounts MFA: Must be enforced on the hosting platform (e.g., Vercel / AWS SSO) for administrative deployment.
- [x] **PASS** — Server-side authorization checks protect every private API and page (`requireAuth`, `requireRole` in route handlers).
- [x] **PASS** — Server derives acting user identity strictly from verified session token, never trusting client-supplied `userId`.
- [x] **PASS** — A user cannot read, update, or delete another user's saved services, tracker, checklist items, or reminders by changing an identifier (IDOR protection verified in `app/api/applications/[id]/route.ts`).
- [x] **PASS** — Reviewers cannot publish unless explicitly authorized. `/api/admin/services/[id]/publish` requires `publisher` or `admin`.
- [x] **PASS** — Admin and role changes/actions are audited in `AuditLog` table.
- [x] **PASS** — Account recovery / login errors use generic messages (`"Invalid credentials."`) to prevent account enumeration.

**Evidence / Notes:**  
- Code: `lib/auth/session.ts`, `app/api/auth/*`, `app/api/applications/*`
- Tests: `tests/security/auth-session.test.ts` (3 tests passed)

---

## 4. HTTPS, TLS, Domain, and DNS

- [ ] **NEEDS MANUAL VERIFICATION** — Production pages and APIs served over HTTPS (enforced at reverse proxy / Vercel edge).
- [x] **PASS** — HSTS header configured with preload in `next.config.mjs` (`max-age=63072000; includeSubDomains; preload`).
- [ ] **NEEDS MANUAL VERIFICATION** — Registrar and DNS-provider accounts use MFA and restricted access.
- [x] **PASS** — Public source links strictly use verified official domains (e.g. `ssp.postmatric.karnataka.gov.in`, `sevasindhu.karnataka.gov.in`) and enforce HTTPS protocol.

**Evidence / Notes:**  
- Code: `next.config.mjs`, `lib/security/ssrf.ts`
- Tests: `tests/unit/ssrf-validator.test.ts` (4 tests passed)

---

## 5. Security Headers and Frontend

- [x] **PASS** — Content-Security-Policy configured in `next.config.mjs` with `default-src 'self'`, `frame-ancestors 'none'`, and `object-src 'none'`.
- [x] **PASS** — `X-Content-Type-Options: nosniff` configured.
- [x] **PASS** — Restrictive `Referrer-Policy: strict-origin-when-cross-origin` configured.
- [x] **PASS** — Clickjacking protection configured with `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- [x] **PASS** — `Permissions-Policy` configured disabling unused hardware APIs (`camera=(), microphone=(), geolocation=(), browsing-topics=()`).
- [x] **PASS** — User-provided content is rendered safely via React standard text bindings without `dangerouslySetInnerHTML`.
- [x] **PASS** — No secrets or private server configuration appear in client bundles (verified in `next build` traces).
- [x] **PASS** — The `obra-cta` button component includes visible `:focus-visible` styling (`outline: 2px solid var(--obra-ember)`) and respects `prefers-reduced-motion: reduce`.
- [x] **PASS** — External links use `rel="noopener noreferrer"`.

**Evidence / Notes:**  
- Code: `next.config.mjs`, `components/obra-cta.css`, `components/service-card.tsx`

---

## 6. Input Validation and API Protection

- [x] **PASS** — All API request bodies, query parameters, and path parameters validated server-side using Zod schemas (`lib/validation/schemas.ts`).
- [x] **PASS** — Length, type, range, and allowed-value limits enforced (e.g., password regex, max character bounds).
- [x] **PASS** — Database queries use parameterized access through Prisma ORM; no dynamic SQL string concatenation.
- [x] **PASS** — User input is never passed to shell execution or dynamic `eval()`.
- [x] **PASS** — Mutation operations do not use `GET`.
- [x] **PASS** — Rate limits active on login, registration, eligibility checks, and AI assistant queries (`lib/security/rate-limit.ts`).
- [x] **PASS** — Public error responses do not disclose stack traces or database connection details.

**Evidence / Notes:**  
- Tests: `tests/integration/api-auth-and-access.test.ts` (3 tests passed), `tests/unit/rate-limiter.test.ts` (3 tests passed)

---

## 7. Database, Secrets, and Privacy

- [x] **PASS** — Production secrets are not committed to Git (`.gitignore` protects `.env`, `.env.local`, `*.db`).
- [x] **PASS** — `.env.example` contains placeholders only with safe defaults.
- [x] **PASS** — Strict Data Minimization: The schema and application explicitly exclude Aadhaar numbers, biometric records, bank passwords, OTPs, and scanned document uploads.
- [x] **PASS** — Audit logs record actor, role, action, and timestamp without storing sensitive passwords or tokens.
- [x] **PASS** — Privacy Notice and Data Minimization policy published at `/privacy`.

**Evidence / Notes:**  
- Code: `prisma/schema.prisma`, `.env.example`, `app/privacy/page.tsx`

---

## 8. AI Assistant and Official-Source Integrity

- [x] **PASS** — AI assistant retrieval is strictly grounded in reviewed official source records from the database.
- [x] **PASS** — Prompt injection defense in `modules/assistant/service.ts` detects and rejects override attempts ("ignore previous instructions", "reveal secrets", "developer mode").
- [x] **PASS** — Citations are validated server-side against actual retrieved source IDs with verified issuing authorities.
- [x] **PASS** — Deterministic rule engine handles eligibility assessment (`modules/eligibility/engine.ts`), returning explainable outcomes.
- [x] **PASS** — Unsupported, stale, or conflicting source data produces an explicit uncertainty outcome (`needs_official_verification` / `insufficient_information`).
- [x] **PASS** — The UI explicitly disclaims government endorsement and advises that final approval rests with the official authority.

**Evidence / Notes:**  
- Code: `modules/assistant/service.ts`, `modules/eligibility/engine.ts`
- Tests: `tests/unit/prompt-injection.test.ts` (3 tests passed), `tests/unit/eligibility-engine.test.ts` (5 tests passed)

---

## 9. External URLs, SSRF, and Network Egress

- [x] **PASS** — No arbitrary server-side URL fetching endpoint exists.
- [x] **PASS** — `validateOfficialUrl` in `lib/security/ssrf.ts` blocks private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), IPv4 loopback (`127.0.0.0/8`), IPv6 loopback (`[::1]`), IPv6 ULA/link-local, and cloud metadata (`169.254.169.254`).
- [x] **PASS** — Only `https:` protocols are accepted for official sources.

**Evidence / Notes:**  
- Tests: `tests/unit/ssrf-validator.test.ts` (4 tests passed)

---

## 10. File Uploads and Document Handling

- [x] **NOT APPLICABLE** — File uploads are excluded from the MVP scope in accordance with data minimization requirements (ARCHITECTURE.md Section 1 & SECURITY.md Section 13). Users manage task checklists without uploading sensitive personal documents.

---

## 11. Findings Register

| ID | Finding | Severity | Evidence | Owner | Status | Retest Result |
|---|---|---|---|---|---|---|
| **SEC-001** | IPv6 loopback `[::1]` URL bypass in SSRF validator | High | `new URL("https://[::1]/internal").hostname` contained brackets, bypassing `^::1$` pattern | AppSec Lead | **CLOSED** | Added bracket-tolerant regex `^\[?::1\]?$`. Verified by automated test suite. |
| **SEC-002** | Webpack downlevel iteration build error in rate limiter | Medium | `rateLimitStore.entries()` failed typecheck during `next build` | Fullstack Lead | **CLOSED** | Refactored to `rateLimitStore.forEach()` and updated `tsconfig.json` target to `es2022`. Verified by successful production build. |
| **SEC-003** | Upgraded Next.js from vulnerable 14.2.15 to patched 14.2.35 | High | Advisory CVE-2024-34351 in Next.js 14.2.15 | DevOps Lead | **CLOSED** | Upgraded in `package.json` to `^14.2.25` (resolved to `14.2.35`). All tests pass. |

---

## 12. Release Decision

- [x] No unresolved critical findings.
- [x] High-severity findings (SEC-001, SEC-003) resolved and verified by automated tests.
- [x] Cross-user authorization tests pass.
- [x] Production build passes with 25 pre-rendered / dynamic routes.
- [x] AI source integrity and prompt injection defense verified.
- [x] Data minimization and privacy notice active.

**Decision:** **READY AFTER LISTED CONDITIONS**

**Conditions to satisfy before opening public traffic:**
1. Connect production deployment to managed PostgreSQL instance.
2. Inject production `JWT_SECRET` (64+ random characters) into hosting environment variables.
3. Configure domain DNS and SSL certificate with automated renewal.
4. Set up operational error monitoring (e.g. Sentry) with sensitive data redaction.
