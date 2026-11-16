import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from './forgot-form'

export const metadata: Metadata = { title: 'Reset Your Password' }

export default function ForgotPasswordPage() {
  return (
    <div className="section min-h-[70vh] flex items-center">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Reset Your Password</h1>
          <p className="text-slate-600 mt-2">Enter your email and we will send you a reset link.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
          <ForgotPasswordForm />
          <p className="mt-6 text-center text-sm"><Link href="/login" className="text-brand-700 font-semibold hover:text-brand-800 hover:underline transition-colors">Back to login</Link></p>
        </div>
      </div>
    </div>
  )
}
