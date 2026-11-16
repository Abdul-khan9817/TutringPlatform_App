import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResetPasswordForm } from './reset-form'

export const metadata: Metadata = { title: 'Set New Password' }

export default function ResetPasswordPage() {
  return (
    <div className="section min-h-[70vh] flex items-center">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Set New Password</h1>
          <p className="text-slate-600 mt-2">Choose a strong new password for your account.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <Suspense fallback={<div className="py-8 text-center text-slate-500">Loading form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
