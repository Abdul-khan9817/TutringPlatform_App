import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/services/payment.service'
import { logger } from '@/lib/logger'

// Stripe requires the raw body for signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    logger.warn('Webhook received without signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let payload: Buffer
  try {
    const ab = await req.arrayBuffer()
    payload = Buffer.from(ab)
  } catch {
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 })
  }

  try {
    await paymentService.handleWebhook(payload, signature)
    return NextResponse.json({ received: true })
  } catch (err) {
    const anyErr = err as { statusCode?: number; message?: string }
    if (anyErr?.statusCode === 400) {
      return NextResponse.json({ error: anyErr.message }, { status: 400 })
    }
    logger.error('Webhook processing error', { error: String(err) })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
