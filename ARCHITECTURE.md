# WorkSpeak Portugal — Architecture Decision Record

## Environment
- Node.js: 22.x
- npm: 10.x
- Target: Vercel (Next.js) + Railway (PostgreSQL)
- Started: Phase 1

---

## Stack Decisions

### Framework
- **Next.js 14** with App Router
- **TypeScript** strict mode throughout
- **React 18** Server Components by default; Client Components only for interactivity

### Styling
- **Tailwind CSS 3** — utility-first, no CSS modules
- Design tokens defined in `tailwind.config.ts`
- Component variants via `class-variance-authority` (cva)
- Icons: `lucide-react`

### Database
- **PostgreSQL** via Railway
- **Prisma ORM** — migrations only, never `db push` in production
- UUID primary keys (`gen_random_uuid()`)
- `Decimal` for all monetary values
- All timestamps in UTC; display converted to `Europe/Lisbon`

### Authentication
- **JWT** signed with HS256 (configurable secret, min 32 chars)
- Stored in **HTTP-only, Secure, SameSite=Lax** cookies
- Access token: 15-minute expiry
- Refresh token: 7-day expiry, stored in DB (`RefreshSession`)
- Server-side verification on every protected request
- Middleware-based route protection

### Authorization
- Three roles: `STUDENT`, `TUTOR`, `ADMIN`
- Server-side only — never trust client role claims
- Row-level security enforced in service layer
- Object ownership verified before every data mutation

### Payments
- **Stripe Checkout** (hosted page) — EUR only
- Server-side session creation with DB-sourced prices
- Webhook-driven booking confirmation (never redirect-only)
- Idempotent webhook processing (deduplicated by `stripeEventId`)
- Refund workflow: admin-initiated through management UI

### File Storage
- **Cloudflare R2** (S3-compatible) with private bucket
- Abstracted behind `StorageProvider` interface — swap to AWS S3 by changing env vars
- Short-lived signed GET URLs (15 minutes)
- File type + size validation before upload
- Files never served through Next.js static directory

### Rate Limiting
- **Upstash Redis** (serverless-compatible) for distributed limiting
- Falls back to in-memory for local development when `REDIS_URL` is absent
- Applied at middleware level for auth endpoints
- Applied at API route level for booking + payment creation

### Email
- **Resend** as primary provider (configurable)
- React Email templates
- Outbox pattern: email send failures never roll back bookings/payments
- Async dispatch with error logging

### Internationalization
- `next-intl` for UI string management
- Locales: `en`, `pt-PT`
- Currency: `EUR` via `Intl.NumberFormat`
- Timezone: `Europe/Lisbon` via `date-fns-tz`
- Language switcher in navigation

### Logging
- Structured JSON logging via `pino`
- Request ID propagation
- Never log passwords, tokens, or card data
- Log levels: `error`, `warn`, `info`, `debug`

### Testing
- Unit + integration: **Vitest**
- End-to-end: **Playwright**
- Database: test database isolated by `DATABASE_URL_TEST`

---

## Security Boundaries

```
Browser
  ↓ HTTPS only
Next.js Middleware (JWT verify, rate limit, security headers)
  ↓
Route Handlers (thin controllers — validate input, call service)
  ↓
Service Layer (business logic, authorization, ownership checks)
  ↓
Repository Layer (database queries via Prisma)
  ↓
PostgreSQL (constraints, indexes, transactions)
```

### What never crosses the boundary
- JWT secret → server-side only
- Stripe secret key → server-side only
- Database credentials → server-side only
- Storage credentials → server-side only
- Private tutor notes → never in student API responses
- Password hashes → never serialized to responses
- Other students' data → enforced in service layer

---

## Database Schema Summary

### Core Models
| Model | Purpose |
|---|---|
| User | Identity, credentials, role |
| StudentProfile | Student-specific data |
| TutorProfile | Tutor bio, qualifications |
| RefreshSession | Refresh token store |
| PasswordResetToken | Password reset (hashed) |
| EmailVerificationToken | Email verify (hashed) |

### Business Models
| Model | Purpose |
|---|---|
| Service | Lesson types with prices |
| Package | Lesson bundles |
| PackagePurchase | Student package ownership |
| Availability | Tutor weekly schedule |
| AvailabilityException | One-off overrides |
| Booking | Lesson booking record |
| Lesson | Completed lesson record |
| Attendance | Per-lesson attendance |
| LearningMaterial | File metadata |
| Homework | Homework assignments |
| HomeworkSubmission | Student submissions |
| StudentProgress | Level + milestone tracking |

### Financial Models
| Model | Purpose |
|---|---|
| Payment | Payment record |
| StripeWebhookEvent | Idempotency store |
| Invoice | Invoice metadata |

### Admin/System Models
| Model | Purpose |
|---|---|
| AssessmentRequest | Pre-registration inquiries |
| CompanyTrainingRequest | Corporate inquiries |
| BusinessSetting | Key-value config store |
| Notification | In-app notifications |
| AuditLog | Admin action trail |
| CookieConsent | GDPR consent tracking |

---

## API Contract Summary

Base: `/api/v1`

| Prefix | Scope |
|---|---|
| `/auth/*` | Public authentication |
| `/assessments/*` | Public submit; admin manage |
| `/availability/*` | Tutor manage; public read slots |
| `/bookings/*` | Student create; tutor/admin manage |
| `/payments/*` | Student checkout; Stripe webhook |
| `/packages/*` | Public list; student purchase |
| `/lessons/*` | Tutor manage; student view own |
| `/materials/*` | Tutor upload; student access own |
| `/homework/*` | Tutor assign; student submit |
| `/admin/*` | Admin-only management |
| `/student/*` | Student-scoped data |
| `/tutor/*` | Tutor-scoped data |

### Response Envelope
```json
{ "success": true, "data": {}, "message": "..." }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## Directory Structure

```
workspeak/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/          # Public marketing pages
│   │   ├── (student)/         # Student dashboard
│   │   ├── (management)/      # Tutor + Admin dashboard
│   │   └── api/v1/            # Route handlers
│   ├── components/
│   │   ├── ui/                # Design system primitives
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── public/            # Marketing components
│   │   ├── dashboard/
│   │   ├── booking/
│   │   └── forms/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   ├── rate-limit.ts
│   │   ├── validation.ts
│   │   ├── stripe.ts
│   │   ├── email.ts
│   │   ├── storage.ts
│   │   ├── logger.ts
│   │   ├── security.ts
│   │   ├── dates.ts
│   │   └── money.ts
│   ├── services/
│   ├── repositories/
│   ├── schemas/
│   ├── types/
│   ├── emails/
│   ├── i18n/
│   └── middleware.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── security/
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

---

## Implementation Checklist

### PHASE 1 — Architecture ✅
- [x] Environment inspection
- [x] Architecture decisions documented
- [x] Database schema designed
- [x] API contracts defined
- [x] Security boundaries defined
- [x] Directory structure defined

### PHASE 2 — Project Foundation
- [ ] package.json with all dependencies
- [ ] tsconfig.json (strict mode)
- [ ] next.config.mjs (security headers, i18n)
- [ ] tailwind.config.ts (design tokens)
- [ ] .env.example (all variables)
- [ ] Environment variable validation (startup)
- [ ] ESLint + Prettier config
- [ ] Logger (pino)
- [ ] Error boundary setup

### PHASE 3 — Database
- [ ] Complete Prisma schema (all models)
- [ ] Database indexes
- [ ] Unique constraints
- [ ] Initial migration
- [ ] Seed procedure
- [ ] Admin seed CLI

### PHASE 4 — Authentication
- [ ] JWT generation + verification
- [ ] bcrypt hashing
- [ ] Middleware (route protection)
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] Logout endpoint
- [ ] /auth/me endpoint
- [ ] Refresh token rotation
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Rate limiting on auth routes

### PHASE 5 — Public Website
- [ ] Layout + navigation
- [ ] Homepage
- [ ] Portuguese lessons page
- [ ] English lessons page
- [ ] Pricing page (DB-driven)
- [ ] Free assessment page + form
- [ ] Login page
- [ ] Register page
- [ ] Contact page
- [ ] Privacy policy
- [ ] Terms and conditions
- [ ] Cookie policy
- [ ] Cookie consent banner
- [ ] WhatsApp floating button
- [ ] SEO metadata
- [ ] Sitemap + robots.txt

### PHASE 6 — Student Dashboard
- [ ] Dashboard layout + navigation
- [ ] Overview page
- [ ] Booking flow (multi-step)
- [ ] My bookings
- [ ] Lesson packages
- [ ] Lesson history
- [ ] Learning materials
- [ ] Homework
- [ ] Progress tracking
- [ ] Payment history
- [ ] Profile settings

### PHASE 7 — Management Dashboard
- [ ] Management layout + navigation
- [ ] Admin overview dashboard
- [ ] Assessment management
- [ ] Student directory
- [ ] Student profile detail
- [ ] Availability management
- [ ] Booking calendar
- [ ] Attendance
- [ ] Lesson management
- [ ] Materials + homework management
- [ ] Payments
- [ ] Reports
- [ ] Business settings

### PHASE 8 — Booking Engine
- [ ] Availability calculation (server-side)
- [ ] Slot generation
- [ ] Concurrency-safe booking creation
- [ ] Temporary booking + expiry
- [ ] Double-booking prevention
- [ ] Cancellation logic + rules
- [ ] Rescheduling logic
- [ ] Timezone handling (Europe/Lisbon)
- [ ] DST-safe comparisons

### PHASE 9 — Payments
- [ ] Stripe Checkout session creation
- [ ] Stripe webhook handler
- [ ] Webhook signature verification
- [ ] Idempotent event processing
- [ ] checkout.session.completed
- [ ] checkout.session.expired
- [ ] payment_intent.payment_failed
- [ ] charge.refunded
- [ ] Package purchase flow
- [ ] Payment reconciliation

### PHASE 10 — Email + Notifications
- [ ] Resend integration
- [ ] Welcome email
- [ ] Email verification
- [ ] Password reset
- [ ] Assessment confirmation
- [ ] Booking confirmation
- [ ] Booking cancellation
- [ ] Payment confirmation
- [ ] Lesson reminder
- [ ] Homework notification
- [ ] In-app notification system

### PHASE 11 — File Storage
- [ ] StorageProvider interface
- [ ] Cloudflare R2 implementation
- [ ] File upload endpoint
- [ ] Signed URL generation
- [ ] File type + size validation
- [ ] Authorization on file access

### PHASE 12 — Testing
- [ ] Unit: validation schemas
- [ ] Unit: pricing logic
- [ ] Unit: booking rules
- [ ] Unit: permission checks
- [ ] Unit: date/timezone logic
- [ ] Integration: auth flow
- [ ] Integration: booking creation
- [ ] Integration: availability conflict
- [ ] Integration: webhook processing
- [ ] Integration: ownership enforcement
- [ ] E2E: assessment submission
- [ ] E2E: student registration + login
- [ ] E2E: booking + payment flow
- [ ] E2E: tutor attendance + notes
- [ ] Security: unauthorized access
- [ ] Security: IDOR
- [ ] Security: rate limiting
- [ ] Security: webhook replay

### PHASE 13 — Optimization + Deployment
- [ ] Production build passes
- [ ] TypeScript strict passes
- [ ] ESLint passes
- [ ] Lighthouse audit
- [ ] Database query optimization
- [ ] README (complete)
- [ ] Deployment guide (Vercel + Railway)
- [ ] Security checklist
