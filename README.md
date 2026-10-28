# SETUVA — AI-Powered Government Application Companion

> **SETUVA** is an AI-assisted public scheme navigation and application companion designed for students and residents in Karnataka, India.
> It transforms complex government welfare guidelines, official gazettes, and portal requirements into transparent, source-grounded preparation checklists.

---

## 🌟 Core Architecture Principles

1. **Official Sources First:** Every eligibility rule, required document, and procedure is grounded in verified official government websites (e.g., SSP Karnataka, ePASS Vidyasiri, Seva Sindhu).
2. **Rules Before Generative AI:** Eligibility is evaluated deterministically using auditable, structured rule definitions. The AI assistant serves to explain published guidance without hallucinating conditions.
3. **Transparent Uncertainty:** Returns explicit uncertainty states (`potentially_eligible`, `not_eligible`, `insufficient_information`, `needs_official_verification`) rather than guessing.
4. **Data Minimization (Zero Identity Bloat):** Strictly prohibits the collection or storage of Aadhaar numbers, biometric data, bank credentials, portal OTPs, or scanned document copies.
5. **Role-Based Governance:** Separates draft creation, peer review, and publication workflows with comprehensive audit logging.

---

## 🚀 Technology Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Custom Editorial CTA Design System (`obra-cta`)
- **Database & ORM:** PostgreSQL (production) / SQLite (zero-config local dev & tests) + Prisma ORM
- **Authentication:** Salted bcrypt password hashing + signed JWT session cookies (`HttpOnly`, `SameSite=Lax`, `Secure`)
- **Validation:** Zod schemas for all API payloads and route parameters
- **AI Service:** Grounded retrieval adapter with prompt-injection filtering and citation verification
- **Testing:** Vitest automated unit, integration, and security test suites

---

## 📁 Repository Structure

```text
├── app/
│   ├── (auth)/sign-in, register
│   ├── admin/
│   ├── dashboard/applications/[id], saved-services
│   ├── services/[slug]
│   ├── about, privacy
│   └── api/ (services, eligibility, auth, applications, reminders, assistant, admin)
├── components/
│   ├── obra-cta.tsx, obra-cta.css (warm editorial primary CTA button)
│   ├── navbar.tsx, footer.tsx
│   ├── service-card.tsx, source-citation.tsx
│   ├── eligibility-wizard.tsx
│   ├── checklist.tsx
│   └── assistant-dialog.tsx
├── lib/
│   ├── auth/session.ts
│   ├── db/prisma.ts
│   ├── security/ (ssrf.ts, rate-limit.ts, sanitization.ts)
│   └── validation/schemas.ts
├── modules/
│   ├── eligibility/engine.ts
│   └── assistant/service.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── tests/
    ├── unit/ (eligibility-engine, ssrf-validator, rate-limiter, prompt-injection)
    ├── security/ (auth-session)
    └── integration/ (api-auth-and-access)
```

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed Verified Schemes
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Build and Start Application
```bash
npm run build
npm start
```

---

## 🔐 Security Baseline

- **XSS & Injection Protection:** Strict HTML escaping, React text rendering, and parameterized Prisma queries.
- **SSRF Defense:** Strict HTTPS enforcement and filtering of RFC 1918 private subnets, loopbacks, and cloud metadata (`169.254.169.254`).
- **AI Adversarial Defense:** Rejection of prompt injection and override attacks; citations strictly validated against active DB sources.
- **Rate Limiting:** Sliding-window throttling on authentication, eligibility checks, and AI queries.
- **Security Headers:** Strict CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
