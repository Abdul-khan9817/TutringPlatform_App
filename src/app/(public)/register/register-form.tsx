'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['PORTUGUESE', 'ENGLISH', 'BOTH']),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  privacyConsent: z.literal(true, { errorMap: () => ({ message: 'You must accept the privacy policy' }) }),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLanguage: 'PORTUGUESE' },
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'Registration failed')
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  const UserIcon = (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const EmailIcon = (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  const PhoneIcon = (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )

  const PasswordIcon = (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )

  const ViewPwToggle = (
    <button
      type="button"
      onClick={() => setShowPw(!showPw)}
      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
      aria-label={showPw ? 'Hide password' : 'Show password'}
    >
      {showPw ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  const ViewConfirmPwToggle = (
    <button
      type="button"
      onClick={() => setShowConfirmPw(!showConfirmPw)}
      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
      aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
    >
      {showConfirmPw ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  const selectClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Input
        label="Full Name"
        required
        placeholder="Maria Silva"
        autoComplete="name"
        leftIcon={UserIcon}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email Address"
        type="email"
        required
        placeholder="you@example.com"
        autoComplete="email"
        leftIcon={EmailIcon}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Phone Number"
        type="tel"
        hint="Optional — include country code e.g. +351"
        placeholder="+351 912 345 678"
        autoComplete="tel"
        leftIcon={PhoneIcon}
        error={errors.phone?.message}
        {...register('phone')}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Preferred Language</label>
        <select className={selectClass} {...register('preferredLanguage')}>
          <option value="PORTUGUESE">Portuguese</option>
          <option value="ENGLISH">English</option>
          <option value="BOTH">Both</option>
        </select>
      </div>
      <Input
        label="Password"
        type={showPw ? 'text' : 'password'}
        required
        placeholder="••••••••"
        autoComplete="new-password"
        hint="Min 8 chars, uppercase, lowercase, number"
        leftIcon={PasswordIcon}
        rightElement={ViewPwToggle}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm Password"
        type={showConfirmPw ? 'text' : 'password'}
        required
        placeholder="••••••••"
        autoComplete="new-password"
        leftIcon={PasswordIcon}
        rightElement={ViewConfirmPwToggle}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            {...register('privacyConsent')}
          />
          <span className="text-sm text-slate-600">
            I agree to the <a href="/privacy" className="text-brand-700 underline font-medium" target="_blank">Privacy Policy</a> and <a href="/terms" className="text-brand-700 underline font-medium" target="_blank">Terms & Conditions</a>.<span className="text-red-500"> *</span>
          </span>
        </label>
        {errors.privacyConsent && <p className="text-xs text-red-600 mt-1">{errors.privacyConsent.message}</p>}
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Create Account
      </Button>
    </form>
  )
}
