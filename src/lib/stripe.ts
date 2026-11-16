import Stripe from 'stripe'

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')

  return new Stripe(key, {
    apiVersion: '2024-06-20',
    typescript: true,
  })
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

// ─── Webhook verification ─────────────────────────────────────────────────────

export async function constructStripeEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret)
}

// ─── Price helpers ────────────────────────────────────────────────────────────

/** Convert EUR decimal to Stripe cents integer */
export function toStripeCents(eur: number | string): number {
  return Math.round(parseFloat(String(eur)) * 100)
}

/** Convert Stripe cents to EUR decimal */
export function fromStripeCents(cents: number): number {
  return cents / 100
}
