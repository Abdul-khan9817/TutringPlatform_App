'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  language: z.enum(['PORTUGUESE', 'ENGLISH', 'BOTH'], { required_error: 'Please select a language' }),
  currentLevel: z.string().optional(),
  learningGoals: z.string().max(1000).optional(),
  deliveryMode: z.enum(['ONLINE', 'IN_PERSON', 'BOTH'], { required_error: 'Please select a preference' }),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().max(2000).optional(),
  privacyConsent: z.literal(true, { errorMap: () => ({ message: 'You must accept the privacy policy' }) }),
})

type FormData = z.infer<typeof schema>

type State = 'idle' | 'submitting' | 'success' | 'error'

export function AssessmentForm() {
  const [state, setState] = useState<State>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setState('submitting')
    try {
      const res = await fetch('/api/v1/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      setState('success')
      reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4" aria-hidden="true">✅</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Request Received!</h2>
        <p className="text-slate-600 leading-relaxed">
          Thank you for your interest. We will contact you within 1 business day to confirm your free assessment.
          Please check your email for a confirmation message.
        </p>
        <Button className="mt-6" onClick={() => setState('idle')}>Submit Another Request</Button>
      </div>
    )
  }

  const fieldClass = 'flex flex-col gap-1.5'
  const labelClass = 'text-sm font-medium text-slate-700'
  const selectClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-all duration-150 hover:border-brand-400 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent'
  const errorClass = 'text-xs text-red-600'
  const textareaClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all duration-150 hover:border-brand-400 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent resize-y min-h-[80px]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <Input
          label="Full Name"
          required
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Input
        label="Phone Number"
        type="tel"
        hint="Optional — include country code e.g. +351"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div className="grid sm:grid-cols-2 gap-5">
        <div className={fieldClass}>
          <label className={labelClass}>
            Language <span className="text-red-500">*</span>
          </label>
          <select className={selectClass} {...register('language')} aria-required="true">
            <option value="">Select a language</option>
            <option value="PORTUGUESE">Portuguese</option>
            <option value="ENGLISH">English</option>
            <option value="BOTH">Both</option>
          </select>
          {errors.language && <p className={errorClass}>{errors.language.message}</p>}
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Current Level</label>
          <select className={selectClass} {...register('currentLevel')}>
            <option value="">Select your level</option>
            <option value="complete-beginner">Complete Beginner</option>
            <option value="A1">A1 — Beginner</option>
            <option value="A2">A2 — Elementary</option>
            <option value="B1">B1 — Intermediate</option>
            <option value="B2">B2 — Upper Intermediate</option>
            <option value="C1">C1 — Advanced</option>
            <option value="C2">C2 — Proficient</option>
            <option value="unsure">Not Sure</option>
          </select>
        </div>
      </div>

      <div className={fieldClass}>
        <label className={labelClass}>
          Format Preference <span className="text-red-500">*</span>
        </label>
        <select className={selectClass} {...register('deliveryMode')} aria-required="true">
          <option value="">Select a preference</option>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In-Person</option>
          <option value="BOTH">Either / No Preference</option>
        </select>
        {errors.deliveryMode && <p className={errorClass}>{errors.deliveryMode.message}</p>}
      </div>

      <div className={fieldClass}>
        <label className={labelClass}>Learning Goals</label>
        <textarea
          className={textareaClass}
          placeholder="Tell us what you want to achieve. E.g. communicate at work, pass an exam, prepare for daily life in Portugal..."
          {...register('learningGoals')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Input
          label="Preferred Date"
          type="date"
          {...register('preferredDate')}
        />
        <div className={fieldClass}>
          <label className={labelClass}>Preferred Time</label>
          <select className={selectClass} {...register('preferredTime')}>
            <option value="">Any time</option>
            <option value="morning">Morning (9:00–12:00)</option>
            <option value="afternoon">Afternoon (12:00–17:00)</option>
            <option value="evening">Evening (17:00–20:00)</option>
          </select>
        </div>
      </div>

      <div className={fieldClass}>
        <label className={labelClass}>Additional Message</label>
        <textarea
          className={textareaClass}
          placeholder="Anything else you would like us to know?"
          {...register('message')}
        />
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 hover:border-brand-300 hover:shadow-xs transition-all duration-150">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            {...register('privacyConsent')}
            aria-required="true"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            I agree to the{' '}
            <a href="/privacy" className="text-brand-700 font-medium underline" target="_blank">Privacy Policy</a>
            {' '}and consent to WorkSpeak Portugal contacting me about this request.
            <span className="text-red-500"> *</span>
          </span>
        </label>
        {errors.privacyConsent && <p className={`${errorClass} mt-2`}>{errors.privacyConsent.message}</p>}
      </div>

      {state === 'error' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
          Something went wrong. Please try again or contact us directly via WhatsApp.
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={state === 'submitting'}
        className="w-full"
      >
        Submit Assessment Request
      </Button>
    </form>
  )
}
