# SETUVA — Production Readiness & Deployment Runbook

> **Project:** SETUVA (formerly ApplyRight) — AI-Powered Government Application Companion  
> **Status:** Release Stage — Ready After Listed Conditions  
> **Target Release:** v0.1.0-mvp

---

## 1. Release Readiness Summary

SETUVA has achieved code completeness, passed 100% of automated security and unit tests, and compiled successfully in production mode.

Before opening public network access, the following operational deployment requirements must be fulfilled.

---

## 2. Environment Variables Checklist

Ensure these variables are injected into your hosting provider (e.g. Vercel / AWS Amplify / ECS / Kubernetes) and **never** committed to version control:

| Variable | Requirement | Recommended Production Setting |
|---|---|---|
| `NODE_ENV` | Enforces production optimizations and secure cookie flags | `production` |
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require&pgbouncer=true` |
| `JWT_SECRET` | Cryptographic secret for signing session cookies | Minimum 64 random characters generated with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Canonical origin for links and CSRF verification | `https://setuva.org` |
| `SMTP_HOST` | (Optional) Transactional email host for reminders | `smtp.postmarkapp.com` / AWS SES |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | Secure credential from secret manager |
| `SMTP_PASS` | SMTP password | Secure credential from secret manager |

---

## 3. Database Provisioning & Migrations

1. **PostgreSQL Setup:**
   - In `prisma/schema.prisma`, update the datasource provider for production:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
2. **Apply Migrations in CI/CD:**
   - Run `npx prisma migrate deploy` as a release phase step prior to starting traffic.
   - Separate runtime database credentials from migration / DDL credentials where supported.
3. **Automated Backups:**
   - Enable daily automated snapshots with 30-day retention on AWS RDS or Supabase.
   - Perform and record a restoration drill to a separate staging schema before public launch.

---

## 4. HTTPS, Domain, & Edge Security

1. **TLS / SSL Termination:**
   - Enforce TLS 1.3 at Cloudflare / Vercel edge.
   - Verify that HTTP traffic automatically redirects to HTTPS with status code 301.
2. **Security Headers Verification:**
   - Verify that production response headers include:
     - `Content-Security-Policy` (tested and active in `next.config.mjs`)
     - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
3. **CORS & CSRF:**
   - API endpoints use cookie-authenticated SameSite=Lax architecture; reject cross-origin state changes with mismatched `Origin` headers.

---

## 5. Rate Limiting & Abuse Protection

1. **Application-Level:**
   - Sliding-window rate limiter active in `lib/security/rate-limit.ts` (Login: 5/min, AI: 10/min, Eligibility: 20/min).
2. **Edge / WAF Protection:**
   - Enable Cloudflare or AWS WAF rate-limiting rules at the edge to mitigate automated credential stuffing and volumetric DDoS.

---

## 6. Observability, Logging, & Alerting

1. **Operational Telemetry:**
   - Capture HTTP status codes, latency, and route hits.
   - Explicitly redact passwords, session tokens, authorization headers, and questionnaire answers from log outputs (`SECURITY.md` Section 14).
2. **Alerting Thresholds:**
   - Set automated alerts for:
     - Sustained 5xx error rate > 1% over 5 minutes.
     - Spikes in 429 rate limit events (> 50 in 1 minute).
     - Database connection pool exhaustion.
     - AI assistant prompt injection rejection spikes.

---

## 7. Incident Response & Rollback Procedures

1. **Rollback Strategy:**
   - Maintain immutable deployment tags (e.g. `v0.1.0-mvp`).
   - In case of deployment defect, initiate one-click rollback in Vercel / container orchestrator to previous container revision.
2. **Compromised Credential Rotation:**
   - If `JWT_SECRET` is suspected of compromise, rotate the secret immediately. This will invalidate all active user sessions and require users to re-authenticate.
3. **Official Data Errata / Rollback:**
   - If an official rule or deadline is found to have changed, authorized publishers can update the rule and publish a revised snapshot version through `/api/admin/services/[id]/publish`. Previous snapshots remain preserved in `ServiceRevision` table.

---

## 8. Release Sign-Off Matrix

| Check | Owner | Status |
|---|---|---|
| Automated Test Suite (21/21 Pass) | AppSec & QA Lead | **APPROVED** |
| Next.js Production Build (25 Routes) | Fullstack Lead | **APPROVED** |
| IDOR & Cross-User Security | AppSec Lead | **APPROVED** |
| Prompt Injection & Citation Grounding | AI Architect | **APPROVED** |
| Data Minimization & Privacy Policy | Compliance Lead | **APPROVED** |
| Edge TLS & Production Database | DevOps Lead | **PENDING HOST PROVISIONING** |
