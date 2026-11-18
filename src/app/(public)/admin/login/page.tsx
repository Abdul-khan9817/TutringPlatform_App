import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminLoginForm } from './admin-login-form'

export const metadata: Metadata = {
  title: 'Administrator Sign In | WorkSpeak Portugal',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[82vh] bg-slate-50/70 flex items-center justify-center pt-24 pb-12 sm:pt-28 px-4 sm:px-6">
      <div className="w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" aria-label="WorkSpeak Portugal home" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform border border-brand-500/20">
              <span className="text-white font-extrabold text-lg">W</span>
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">
              WorkSpeak<span className="text-brand-600"> Portugal</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administrator sign in</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your administrator credentials
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-7 sm:p-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
