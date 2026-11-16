import { z } from 'zod'

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  tutorId: z.string().uuid(),
  startAt: z.string().datetime(), // ISO 8601 UTC
  deliveryMode: z.enum(['ONLINE', 'IN_PERSON']),
  packagePurchaseId: z.string().uuid().optional(),
})

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
})

export const rescheduleBookingSchema = z.object({
  startAt: z.string().datetime(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
