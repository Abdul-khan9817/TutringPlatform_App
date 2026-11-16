import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { formatEuro } from '@/lib/money'

export const metadata: Metadata = {
  title: 'Pricing & Lesson Packages',
  description: 'Transparent pricing for Portuguese and English lessons. Individual lessons and multi-lesson packages available. Prices in EUR.',
}

export const revalidate = 300

interface ServiceItem {
  id: string
  name: string
  slug: string
  language: string
  deliveryMode: string
  durationMinutes: number
  price: any
  description: string | null
}

interface PackageItem {
  id: string
  name: string
  slug: string
  language: string
  description: string | null
  price: any
  lessonCount: number
  validityDays: number
}

const defaultFallbackServices: ServiceItem[] = [
  {
    id: 'fallback-pt-60',
    name: 'Portuguese Lesson (60 min)',
    slug: 'portuguese-60',
    language: 'PORTUGUESE',
    deliveryMode: 'BOTH',
    durationMinutes: 60,
    price: 35,
    description: 'Individual 1-on-1 Portuguese lesson focused on everyday conversation, workplace communication, and grammar.',
  },
  {
    id: 'fallback-en-60',
    name: 'English Lesson (60 min)',
    slug: 'english-60',
    language: 'ENGLISH',
    deliveryMode: 'BOTH',
    durationMinutes: 60,
    price: 40,
    description: 'Professional 1-on-1 English lesson for meetings, presentations, email writing, and workplace confidence.',
  },
  {
    id: 'fallback-pt-90',
    name: 'Portuguese Intensive (90 min)',
    slug: 'portuguese-90',
    language: 'PORTUGUESE',
    deliveryMode: 'BOTH',
    durationMinutes: 90,
    price: 50,
    description: 'Extended 90-minute session for rapid fluency, deep practice, and conversational immersion.',
  },
]

const defaultFallbackPackages: PackageItem[] = [
  {
    id: 'fallback-pkg-5',
    name: '5-Lesson Starter Pack',
    slug: 'portuguese-5-pack',
    language: 'PORTUGUESE',
    description: 'Ideal for building initial confidence and establishing a regular language routine.',
    price: { toNumber: () => 160 },
    lessonCount: 5,
    validityDays: 60,
  },
  {
    id: 'fallback-pkg-10',
    name: '10-Lesson Fluency Pack',
    slug: 'portuguese-10-pack',
    language: 'PORTUGUESE',
    description: 'Our most popular option. Structured progress for work, daily life, and permanent integration in Portugal.',
    price: { toNumber: () => 300 },
    lessonCount: 10,
    validityDays: 120,
  },
  {
    id: 'fallback-pkg-en-10',
    name: '10-Lesson Career English Pack',
    slug: 'english-10-pack',
    language: 'ENGLISH',
    description: 'Targeted executive English for career advancement, international meetings, and presentations.',
    price: { toNumber: () => 360 },
    lessonCount: 10,
    validityDays: 120,
  },
]

async function getServicesAndPackages(): Promise<{ services: ServiceItem[]; packages: PackageItem[] }> {
  try {
    const [services, packages] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, orderBy: [{ language: 'asc' }, { sortOrder: 'asc' }] }),
      prisma.package.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] }),
    ])
    if (services.length === 0 && packages.length === 0) {
      return { services: defaultFallbackServices, packages: defaultFallbackPackages }
    }
    return { services: services as any, packages: packages as any }
  } catch {
    return { services: defaultFallbackServices, packages: defaultFallbackPackages }
  }
}

export default async function PricingPage() {
  const { services, packages } = await getServicesAndPackages()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white py-20">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          aria-hidden="true"
        />
        <div className="container-wide relative text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Pricing & Packages</h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. All prices in EUR. Start with a free 15-minute assessment.
          </p>
        </div>
      </section>

      {/* Free assessment callout */}
      <section className="bg-emerald-50 border-b border-emerald-200 py-5">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-emerald-950 text-sm sm:text-base">Free 15-Minute Level Assessment</p>
              <p className="text-xs sm:text-sm text-emerald-800">Start with a complimentary assessment — no commitment required.</p>
            </div>
          </div>
          <Link href="/assessment" className="flex-shrink-0 w-full sm:w-auto">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto">Book Free Assessment</Button>
          </Link>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section">
          <div className="container-wide">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Individual Lessons</h2>
              <p className="text-slate-600">Pay per lesson, no commitment required.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-400 hover:shadow-xl transition-all duration-200 cursor-default"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors text-lg">{s.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.language.charAt(0) + s.language.slice(1).toLowerCase()} ·{' '}
                        {s.deliveryMode === 'BOTH' ? 'Online or In-Person' : s.deliveryMode === 'ONLINE' ? 'Online' : 'In-Person'} ·{' '}
                        {s.durationMinutes} min
                      </p>
                    </div>
                    <span className="text-2xl font-extrabold text-brand-700 transition-colors">{formatEuro(s.price)}</span>
                  </div>
                  {s.description && <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link href="/assessment">
                      <Button variant="secondary" size="sm" className="w-full">Book a Lesson</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {packages.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container-wide">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Lesson Packages</h2>
              <p className="text-slate-600">Save more by purchasing a package. Lessons can be used flexibly within the validity period.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((p, i) => {
                const isFeatured = i === Math.floor(packages.length / 2)
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border-2 bg-white p-7 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-xl cursor-default group ${
                      isFeatured
                        ? 'border-brand-600 shadow-brand-100 shadow-lg scale-[1.02] hover:border-brand-700'
                        : 'border-brand-200 hover:border-brand-400'
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute top-0 left-0 right-0 bg-brand-600 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
                        MOST POPULAR
                      </div>
                    )}
                    <div className={`absolute top-0 right-0 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg ${isFeatured ? 'top-7' : ''}`}>
                      {p.language.charAt(0) + p.language.slice(1).toLowerCase()}
                    </div>
                    <h3 className={`font-bold text-slate-900 group-hover:text-brand-700 transition-colors text-lg mb-1 pr-16 ${isFeatured ? 'mt-5' : ''}`}>{p.name}</h3>
                    {p.description && <p className="text-sm text-slate-600 mb-4">{p.description}</p>}
                    <div className="text-3xl font-extrabold text-brand-700 transition-colors mb-5">{formatEuro(p.price)}</div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm text-slate-700 hover:translate-x-1 transition-transform">
                        <span className="text-brand-600 font-bold">✓</span> {p.lessonCount} lessons included
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-700 hover:translate-x-1 transition-transform">
                        <span className="text-brand-600 font-bold">✓</span> Valid for {p.validityDays} days
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-500 hover:translate-x-1 transition-transform">
                        <span aria-hidden="true">ℹ️</span> Per lesson: {formatEuro(p.price.toNumber() / p.lessonCount)}
                      </li>
                    </ul>
                    <Link href="/register">
                      <Button
                        className="w-full"
                        variant={isFeatured ? 'primary' : 'secondary'}
                      >
                        Get This Package
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {services.length === 0 && packages.length === 0 && (
        <section className="section">
          <div className="container-wide text-center">
            <p className="text-slate-600 text-lg mb-6">Pricing information will be available shortly. Contact us for current rates.</p>
            <Link href="/contact"><Button>Contact Us</Button></Link>
          </div>
        </section>
      )}

      {/* Corporate */}
      <section className="section bg-gradient-to-br from-brand-50/70 via-white to-blue-50/60 border-y border-slate-200">
        <div className="container-wide max-w-3xl text-center rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 hover:border-brand-300 hover:shadow-xl transition-all duration-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-800 mb-5 border border-brand-200 shadow-xs">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            For Teams & Businesses
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Corporate Training</h2>
          <p className="text-slate-600 mb-8 leading-relaxed text-base sm:text-lg">
            Customised language programmes for teams and businesses. Group rates and tailored curricula available. Contact us to discuss your requirements.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-brand-700 hover:bg-brand-800 text-white shadow-md font-bold">
              Enquire About Corporate Training
            </Button>
          </Link>
        </div>
      </section>

      {/* Notes */}
      <section className="section bg-slate-50">
        <div className="container-wide max-w-2xl">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Pricing Notes</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            {[
              'All prices are in EUR and include VAT where applicable.',
              'Package lessons must be used within the stated validity period.',
              'Lessons are non-refundable once a package expires.',
              'Bookings cancelled in advance may be eligible for rescheduling — see Terms & Conditions.',
              'Corporate pricing is discussed on a per-agreement basis.',
              'Prices are subject to change. Confirmed bookings are charged at the price at time of booking.',
            ].map((note) => (
              <div key={note} className="group flex items-start gap-3 text-sm text-slate-600 hover:text-slate-950 transition-colors py-0.5">
                <span className="text-brand-500 font-bold mt-0.5 flex-shrink-0 group-hover:scale-150 group-hover:text-amber-500 transition-all duration-200">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
