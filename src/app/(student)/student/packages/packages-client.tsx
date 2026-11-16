'use client'

import { useState } from 'react'
import { formatEuro } from '@/lib/money'
import type { StudentPackage, AvailablePackage } from '@/lib/student-data'

const WHATSAPP = 'https://wa.me/351916869857'

interface Props {
  purchased: StudentPackage[]
  available: AvailablePackage[]
}

export function PackagesClient({ purchased, available }: Props) {
  const now = new Date()
  const active = purchased.filter(p => p.status === 'ACTIVE' && new Date(p.expiresAt) >= now)
  const history = purchased.filter(p => !active.includes(p))

  const [enquiring, setEnquiring] = useState<string | null>(null)

  function handlePurchase(pkg: AvailablePackage) {
    const msg = encodeURIComponent(
      `Hi! I'd like to purchase the "${pkg.name}" package (${pkg.lessonCount} lessons · €${pkg.price}). Please let me know the next steps.`
    )
    window.open(`${WHATSAPP}?text=${msg}`, '_blank')
    setEnquiring(pkg.id)
    setTimeout(() => setEnquiring(null), 3000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Lesson Packages</h1>
        <p className="text-slate-500 mt-1">Your active packages and available options</p>
      </div>

      {/* Active packages */}
      {active.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Active Packages</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {active.map(p => {
              const remaining = p.lessonCount - p.usedLessons
              const pct = Math.round((p.usedLessons / p.lessonCount) * 100)
              return (
                <div key={p.id} className="bg-white rounded-xl border-2 border-brand-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{p.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                    <span className="font-semibold text-brand-700">{remaining} lessons remaining</span>
                    <span className="text-xs">Expires {new Date(p.expiresAt).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-1" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">{pct}% used · {p.usedLessons} of {p.lessonCount} lessons</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available packages */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Available Packages</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {available.map(p => (
            <div key={p.id} className={`bg-white rounded-xl border p-6 hover:shadow-sm transition-shadow relative ${p.popular ? 'border-brand-400' : 'border-slate-200'}`}>
              {p.popular && (
                <span className="absolute top-4 right-4 text-xs font-semibold bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {p.language === 'PORTUGUESE' ? '🇵🇹 Portuguese' : '🇬🇧 English'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{p.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{p.description}</p>
              <div className="text-2xl font-extrabold text-brand-700 mb-1">{formatEuro(p.price)}</div>
              <ul className="text-xs text-slate-600 space-y-1 mb-5">
                <li>✓ {p.lessonCount} × 60-min lessons</li>
                <li>✓ Valid for {p.validityDays} days</li>
                <li>✓ Online or in-person</li>
              </ul>
              <button
                onClick={() => handlePurchase(p)}
                className="w-full py-2.5 rounded-lg bg-brand-900 text-white text-sm font-semibold hover:bg-brand-800 transition-colors"
              >
                {enquiring === p.id ? 'Opening WhatsApp…' : 'Enquire via WhatsApp'}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">Packages are purchased via WhatsApp. Our team will confirm payment and activate your package within 24 hours.</p>
      </div>

      {/* Purchase history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Package History</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Package</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Purchased</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Used</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-5 py-3 text-slate-600">{new Date(p.purchasedAt).toLocaleDateString('en-PT')}</td>
                    <td className="px-5 py-3 text-slate-600">{p.usedLessons} / {p.lessonCount}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'EXPIRED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
