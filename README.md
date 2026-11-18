# WorkSpeak Portugal — Tutoring Platform

Production-ready MERN/Next.js tutoring management platform for WorkSpeak Portugal.

---

## Stack

- **Frontend/Backend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (HTTP-only cookies), bcrypt
- **Payments**: Stripe Checkout + webhooks
- **Email**: Resend
- **Storage**: Cloudflare R2 (S3-compatible)

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Stripe account (test mode to start)
- A Resend account (or any SMTP provider)

---

## 1. Install

```bash
git clone <repo>
cd workspeak-portugal
npm install
```

---

## 2. Environment

```bash
cp .env.example .env
```

Edit `.env` with your values. Required minimum to run locally:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/workspeak
DIRECT_URL=postgresql://user:pass@localhost:5432/workspeak
JWT_SECRET=<run: openssl rand -base64 64>
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=WorkSpeak Portugal <hello@workspeakportugal.com>
```

---

## 3. Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed initial data (services, settings)
npm run db:seed
```

---

## 4. Create Admin Account

```bash
export ADMIN_EMAIL=your@email.com
export ADMIN_PASSWORD=YourStrongPassword123!
export ADMIN_NAME="Your Name"

npm run admin:create

# Unset immediately after
unset ADMIN_EMAIL ADMIN_PASSWORD ADMIN_NAME
```

---

## 5. Stripe Webhook (local dev)

Install [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe listen --forward-to localhost:3000/api/v1/payments/webhook
```

Copy the webhook signing secret it outputs into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 6. Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## 7. Tests

```bash
npm test                # run all unit tests
npm run test:coverage   # with coverage report
```

---

## 8. Production Build

```bash
npm run build
npm start
```

---

## Deployment

### Vercel + Railway

1. Push to GitHub
2. Create a Railway PostgreSQL database
3. Deploy to Vercel, set all environment variables
4. Set `DATABASE_URL` and `DIRECT_URL` from Railway
5. Run migrations: `npx prisma migrate deploy`
6. Run seed: `npm run db:seed`
7. Create the admin against the **production database**: set `DATABASE_URL` to the production database, provide `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`, then run `npm run admin:create`. Admin sign-in checks this database account, so creating it only in a local database will not provision production. Remove the one-time admin credential variables after provisioning.
8. Configure Stripe webhook endpoint: `https://yourdomain.com/api/v1/payments/webhook`

### VPS (Ubuntu)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Build and start
npm run build
pm2 start npm --name workspeak -- start
pm2 startup
pm2 save
```

---

## ⚠️ Before Going Live

- [ ] Set real service prices in the admin dashboard and activate them
- [ ] Review and legally approve Privacy Policy, Terms & Conditions
- [ ] Switch Stripe to live keys
- [ ] Configure production email domain in Resend
- [ ] Set up database backups
- [ ] Configure Redis for distributed rate limiting (`REDIS_URL`)
- [ ] Review and configure Stripe webhook for production endpoint
- [ ] Test full booking + payment flow in Stripe test mode
- [ ] Verify all email templates
- [ ] Configure `WHATSAPP_PHONE_NUMBER` and `NEXT_PUBLIC_WHATSAPP`

---

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT in HTTP-only, Secure, SameSite=Lax cookies
- [x] Origin verification on state-changing requests
- [x] Rate limiting on auth, booking, payment, assessment endpoints
- [x] Zod validation on all API inputs
- [x] Stripe webhook signature verification
- [x] Idempotent webhook event processing
- [x] Server-side availability recalculation (never trust client)
- [x] Serializable transactions for concurrent booking
- [x] Role-based access control enforced server-side
- [x] Students cannot access other students' data
- [x] Private tutor notes excluded from student API responses
- [x] No secrets in NEXT_PUBLIC_ env vars
- [x] Security headers (X-Frame-Options, CSP, HSTS in production)
- [ ] Redis rate limiting for multi-instance production
- [ ] File upload virus scanning (recommended for production)
