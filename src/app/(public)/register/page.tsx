import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './register-form'

export const metadata: Metadata = { title: 'Create Your Account' }

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center py-16 px-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">W</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">WorkSpeak Portugal</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Your Account</h1>
          <p className="text-slate-600 mt-1">Join WorkSpeak Portugal and start learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-700 font-semibold hover:text-brand-800 hover:underline transition-colors">Log in</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Not sure where to start?{' '}
          <Link href="/assessment" className="text-brand-700 font-semibold hover:text-brand-800 hover:underline transition-colors">
            Book a free assessment first
          </Link>
        </p>
      </div>
    </div>
  )
}
