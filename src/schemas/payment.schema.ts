import { z } from 'zod'

export const checkoutSchema = z.object({
  type: z.enum(['booking', 'package']),
  bookingId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
}).refine(
  (data) => (data.type === 'booking' ? !!data.bookingId : !!data.packageId),
  { message: 'Must provide bookingId for booking checkout or packageId for package checkout' }
)

export type CheckoutInput = z.infer<typeof checkoutSchema>
