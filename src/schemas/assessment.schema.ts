import { z } from 'zod'
import { emailSchema, phoneSchema } from '@/lib/validation'

export const createAssessmentSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: emailSchema,
  phone: phoneSchema,
  language: z.enum(['PORTUGUESE', 'ENGLISH', 'BOTH']),
  currentLevel: z.string().max(50).optional(),
  learningGoals: z.string().max(1000).optional(),
  deliveryMode: z.enum(['ONLINE', 'IN_PERSON', 'BOTH']),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().max(2000).optional(),
  privacyConsent: z.literal(true, { errorMap: () => ({ message: 'Privacy consent is required' }) }),
})

export const updateAssessmentSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CONVERTED', 'NO_SHOW', 'CANCELLED']).optional(),
  assignedTutorId: z.string().uuid().optional().nullable(),
  internalNotes: z.string().max(5000).optional(),
})

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
