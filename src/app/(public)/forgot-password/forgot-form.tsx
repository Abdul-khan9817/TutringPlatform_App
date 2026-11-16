'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({ email: z.string().email('Please enter a valid email address') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await fetch('/api/v1/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setDone(true)
  }

  const EmailIcon = (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  if (done) return (
    <div className="text-center py-4">
      <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-900 mb-2">Check your email</p>
      <p className="text-sm text-slate-600">If that email exists in our system, you will receive a reset link shortly.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
        leftIcon={EmailIcon}
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Send Reset Link
      </Button>
    </form>
  )
}
