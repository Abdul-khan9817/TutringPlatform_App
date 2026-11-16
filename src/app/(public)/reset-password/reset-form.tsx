'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[a-z]/, 'Needs lowercase').regex(/[0-9]/, 'Needs number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
type FormData = z.infer<typeof schema>

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [error, setError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const res = await fetch('/api/v1/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...data }) })
    const json = await res.json()
    if (!res.ok) { setError(json.error?.message ?? 'Reset failed'); return }
    router.push('/login?reset=true')
  }

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

  if (!token) return <p className="text-sm text-red-600">Invalid or missing reset token. Please request a new password reset link.</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Input
        label="New Password"
        type={showPw ? 'text' : 'password'}
        required
        placeholder="••••••••"
        hint="Min 8 chars, uppercase, lowercase, number"
        leftIcon={PasswordIcon}
        rightElement={ViewPwToggle}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm New Password"
        type={showConfirmPw ? 'text' : 'password'}
        required
        placeholder="••••••••"
        leftIcon={PasswordIcon}
        rightElement={ViewConfirmPwToggle}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">{error}</div>}
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">Set New Password</Button>
    </form>
  )
}
