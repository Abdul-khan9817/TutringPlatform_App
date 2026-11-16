import { prisma } from '@/lib/prisma'
import { stripe, constructStripeEvent, toStripeCents } from '@/lib/stripe'
import { sendEmail, paymentConfirmationEmail } from '@/lib/email'
import { bookingService } from './booking.service'
import { logger } from '@/lib/logger'
import { formatEuro } from '@/lib/money'
import type { JWTPayload } from '@/lib/auth'
import type { CheckoutInput } from '@/schemas/payment.schema'

export const paymentService = {
  async createCheckoutSession(input: CheckoutInput, session: JWTPayload) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'

    if (input.type === 'booking' && input.bookingId) {
      // Fetch booking with service price from DB — NEVER trust client amount
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId, studentId: session.sub, status: 'PENDING_PAYMENT' },
        include: { service: true, student: { select: { name: true, email: true } } },
      })

      if (!booking) {
        throw Object.assign(new Error('Booking not found or no longer pending payment'), { statusCode: 404 })
      }

      if (booking.expiresAt && booking.expiresAt < new Date()) {
        throw Object.assign(new Error('This booking has expired. Please book again.'), { statusCode: 410 })
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        currency: 'eur',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: toStripeCents(booking.service.price.toString()),
              product_data: {
                name: booking.service.name,
                description: `${booking.service.durationMinutes}-minute lesson`,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: booking.student.email,
        metadata: {
          bookingId: booking.id,
          studentId: session.sub,
          type: 'booking',
        },
        success_url: `${appUrl}/student/bookings/${booking.id}?payment=success`,
        cancel_url: `${appUrl}/student/bookings/${booking.id}?payment=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          studentId: session.sub,
          bookingId: booking.id,
          stripeSessionId: stripeSession.id,
          amount: booking.service.price,
          currency: 'EUR',
          status: 'PENDING',
        },
      })

      return { url: stripeSession.url, sessionId: stripeSession.id }
    }

    if (input.type === 'package' && input.packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: input.packageId, isActive: true },
      })

      if (!pkg) throw Object.assign(new Error('Package not found'), { statusCode: 404 })

      const student = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { email: true, name: true },
      })

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        currency: 'eur',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: toStripeCents(pkg.price.toString()),
              product_data: {
                name: pkg.name,
                description: `${pkg.lessonCount} lessons · valid ${pkg.validityDays} days`,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: student?.email,
        metadata: {
          packageId: pkg.id,
          studentId: session.sub,
          type: 'package',
        },
        success_url: `${appUrl}/student/packages?payment=success`,
        cancel_url: `${appUrl}/student/packages?payment=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      })

      await prisma.payment.create({
        data: {
          studentId: session.sub,
          stripeSessionId: stripeSession.id,
          amount: pkg.price,
          currency: 'EUR',
          status: 'PENDING',
          metadata: { packageId: pkg.id },
        },
      })

      return { url: stripeSession.url, sessionId: stripeSession.id }
    }

    throw Object.assign(new Error('Invalid checkout request'), { statusCode: 400 })
  },

  async handleWebhook(payload: Buffer, signature: string) {
    let event
    try {
      event = await constructStripeEvent(payload, signature)
    } catch (err) {
      logger.error('Webhook signature verification failed', { error: String(err) })
      throw Object.assign(new Error('Invalid webhook signature'), { statusCode: 400 })
    }

    // ── Idempotency: check if already processed ──
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    })

    if (existing?.processedAt) {
      logger.info('Duplicate webhook ignored', { eventId: event.id, type: event.type })
      return
    }

    // Record event (upsert to handle concurrent delivery)
    await prisma.webhookEvent.upsert({
      where: { eventId: event.id },
      create: { provider: 'stripe', eventId: event.id, type: event.type, payload: event as never },
      update: {},
    })

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as never)
          break
        case 'checkout.session.expired':
          await this.handleCheckoutExpired(event.data.object as never)
          break
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as never)
          break
        default:
          logger.debug('Unhandled webhook event', { type: event.type })
      }

      await prisma.webhookEvent.update({
        where: { eventId: event.id },
        data: { processedAt: new Date() },
      })
    } catch (err) {
      await prisma.webhookEvent.update({
        where: { eventId: event.id },
        data: { error: err instanceof Error ? err.message : String(err) },
      })
      throw err
    }
  },

  async handleCheckoutCompleted(session: { id: string; metadata?: Record<string, string> | null; payment_intent?: string | null; amount_total?: number | null }) {
    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: session.id },
    })

    if (!payment) {
      logger.error('Payment record not found for completed checkout', { sessionId: session.id })
      return
    }

    const type = session.metadata?.type
    const now = new Date()

    if (type === 'booking' && payment.bookingId) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            stripePaymentIntentId: session.payment_intent ?? undefined,
            paidAt: now,
          },
        }),
      ])

      await bookingService.confirmBooking(payment.bookingId)

      const student = await prisma.user.findUnique({
        where: { id: payment.studentId },
        select: { name: true, email: true },
      })

      if (student) {
        sendEmail({
          to: student.email,
          ...paymentConfirmationEmail({
            studentName: student.name,
            amount: formatEuro(payment.amount),
            description: 'Lesson booking',
          }),
        }).catch((e) => logger.error('Payment email failed', { error: String(e) }))
      }
    } else if (type === 'package') {
      const packageId = session.metadata?.packageId
      if (!packageId) return

      const pkg = await prisma.package.findUnique({ where: { id: packageId } })
      if (!pkg) return

      const expiresAt = new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000)

      const purchase = await prisma.packagePurchase.create({
        data: {
          studentId: payment.studentId,
          packageId,
          expiresAt,
          totalLessons: pkg.lessonCount,
          usedLessons: 0,
        },
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          stripePaymentIntentId: session.payment_intent ?? undefined,
          paidAt: now,
          packagePurchaseId: purchase.id,
        },
      })
    }

    logger.info('Checkout completed', { sessionId: session.id, type })
  },

  async handleCheckoutExpired(session: { id: string }) {
    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id, status: 'PENDING' },
      data: { status: 'EXPIRED' },
    })
    logger.info('Checkout session expired', { sessionId: session.id })
  },

  async handleChargeRefunded(charge: { payment_intent: string; amount_refunded: number; refunds?: { data: { reason?: string | null }[] } }) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent },
    })
    if (!payment) return

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount: charge.amount_refunded / 100,
        refundReason: charge.refunds?.data[0]?.reason ?? undefined,
      },
    })

    // If it was a booking, update that too
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'REFUNDED' },
      })
    }

    logger.info('Charge refunded', { paymentIntentId: charge.payment_intent })
  },
}
