'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch('/api/v1/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(r => setStatus(r.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="mx-auto max-w-md px-4 text-center">
      {status === 'verifying' && (
        <>
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Verifying your email...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Email Verified!</h1>
          <p className="text-slate-600 mb-6">Your email has been verified. You can now log in to your account.</p>
          <Link href="/login"><Button size="lg" className="w-full">Log In</Button></Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Verification Failed</h1>
          <p className="text-slate-600 mb-6">This link is invalid or has expired. Please request a new verification email.</p>
          <Link href="/login"><Button variant="outline" size="lg" className="w-full">Back to Login</Button></Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="section min-h-[70vh] flex items-center">
      <Suspense fallback={<div className="mx-auto text-center text-slate-500">Loading verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
