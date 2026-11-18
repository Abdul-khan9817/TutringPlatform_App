'use client'

import { useState } from 'react'
import { formatEuro } from '@/lib/money'
import { PortugalFlagIcon, UKFlagIcon, DualFlagIcon } from '@/components/ui/flags'
import type { StudentPackage, AvailablePackage } from '@/lib/student-data'

const WHATSAPP = 'https://wa.me/351916869857'

interface Props {
  purchased: StudentPackage[]
  available: AvailablePackage[]
}

export function PackagesClient({ purchased, available }: Props) {
  const now = new Date()
  const active = purchased.filter((p) => p.status === 'ACTIVE' && new Date(p.expiresAt) >= now)
  const history = purchased.filter((p) => !active.includes(p))

  const [enquiring, setEnquiring] = useState<string | null>(null)

  function handlePurchase(pkg: AvailablePackage) {
    const msg = encodeURIComponent(
      `Olá! I would like to purchase the "${pkg.name}" package (${pkg.lessonCount} lessons · €${pkg.price}) for WorkSpeak Portugal. Please send payment instructions.`
    )
    window.open(`${WHATSAPP}?text=${msg}`, '_blank')
    setEnquiring(pkg.id)
    setTimeout(() => setEnquiring(null), 3000)
  }

  const totalRemainingCredits = active.reduce((acc, p) => acc + (p.lessonCount - p.usedLessons), 0)

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
              Credit Balance & Multi-Lesson Bundles
            </span>
            <span className="text-xs font-medium text-slate-500">
              · Discounted Rates in EUR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lesson Packages & Credits
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor your available lesson allowance, track expiration dates, and explore discounted lesson packages.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 self-start sm:self-auto shadow-2xs">
          <span>{totalRemainingCredits} Active Lesson Credits</span>
        </div>
      </div>

      {/* ── Active Packages ── */}
      {active.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Active Packages in Use
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Auto-deducted upon confirmed lesson completion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((p) => {
              const remaining = Math.max(0, p.lessonCount - p.usedLessons)
              const pct = Math.min(100, Math.round((p.usedLessons / p.lessonCount) * 100))

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border-2 border-brand-200 p-6 shadow-sm space-y-4 hover:border-brand-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                          {p.language === 'PORTUGUESE' ? '🇵🇹 Portuguese' : p.language === 'ENGLISH' ? '🇬🇧 English' : '🇵🇹🇬🇧 Portuguese & English'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">{p.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black text-brand-700">{remaining}</div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Left</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{p.usedLessons} of {p.lessonCount} Lessons Completed</span>
                      <span>{pct}% Used</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Valid until{' '}
                      <strong className="text-slate-800">
                        {new Date(p.expiresAt).toLocaleDateString('en-PT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                    <span className="font-semibold text-slate-700">{formatEuro(p.price)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Available Packages Catalog ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Explore Lesson Discount Packages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discounted bundled lessons with full tutor flexibility and flexible rescheduling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {available.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-200 relative flex flex-col justify-between ${
                p.popular ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200 hover:border-brand-300'
              }`}
            >
              {p.popular && (
                <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  {p.language === 'PORTUGUESE' ? (
                    <PortugalFlagIcon className="h-3 w-4" />
                  ) : p.language === 'ENGLISH' ? (
                    <UKFlagIcon className="h-3 w-4" />
                  ) : (
                    <DualFlagIcon className="h-3 w-4" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {p.language === 'PORTUGUESE' ? 'Portuguese Curriculum' : p.language === 'ENGLISH' ? 'English Curriculum' : 'Portuguese & English Curriculum'}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>

                <div className="my-5 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {formatEuro(p.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (€{(p.price / p.lessonCount).toFixed(2)}/lesson)
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-medium pb-6 border-b border-slate-100">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{p.lessonCount} × 60-Minute One-on-One Lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Valid for {p.validityDays} Days with flexible booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Choice of Online Video or In-Person (Lisbon)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Includes Study Materials & Homework Feedback</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handlePurchase(p)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-2 ${
                    p.popular
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md hover:shadow-lg'
                      : 'bg-brand-900 hover:bg-brand-800 text-white shadow-xs'
                  }`}
                >
                  <span>💬</span>
                  <span>
                    {enquiring === p.id ? 'Connecting to WhatsApp…' : 'Enquire via WhatsApp'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Purchase History ── */}
      {history.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Package History
          </h2>
          <div className="space-y-3">
            {history.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 text-xs opacity-75"
              >
                <div>
                  <span className="font-extrabold text-slate-800">{p.name}</span>
                  <p className="text-[11px] text-slate-400">
                    Purchased on {new Date(p.purchasedAt).toLocaleDateString('en-PT')} · {p.usedLessons} lessons used
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
