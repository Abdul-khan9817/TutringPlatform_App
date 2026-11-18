'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const isBusy = isSubmitting || isNavigating
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (!isBusy) {
      setShowSpinner(false)
      return
    }
    const timer = window.setTimeout(() => setShowSpinner(true), 140)
    return () => window.clearTimeout(timer)
  }, [isBusy])

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'Invalid email or password')
        return
      }
      const role = json.data?.role
      if (role !== 'STUDENT') {
        setError('This sign-in is for student accounts only.')
        return
      }
      setIsNavigating(true)
      router.replace('/student/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-slate-900 transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent ${
              errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 hover:border-brand-400'
            }`}
            aria-invalid={errors.email ? 'true' : undefined}
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className={`h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-900 transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
              errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 hover:border-brand-400'
            }`}
            aria-invalid={errors.password ? 'true' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2" role="alert">
          <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isBusy}
          aria-busy={isBusy}
          className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-colors text-sm hover:translate-y-0 active:translate-y-0 disabled:opacity-100"
        >
          <span className="inline-flex items-center justify-center gap-2.5">
            <svg
              className={`h-4 w-4 shrink-0 transition-opacity duration-200 ${showSpinner ? 'animate-spin opacity-100' : 'opacity-0'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Sign in</span>
          </span>
        </Button>
      </div>
    </form>
  )
}
