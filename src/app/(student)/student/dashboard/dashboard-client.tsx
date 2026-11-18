'use client'

import { EmptyStateIcon } from '@/components/ui/empty-state-icon'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookingStatusBadge } from '@/components/ui/badge'
import { PortugalFlagIcon, UKFlagIcon, DualFlagIcon } from '@/components/ui/flags'
import type {
  StudentBooking,
  StudentPackage,
  StudentProgressEntry,
  StudentHomework,
  StudentMaterial,
} from '@/lib/student-data'
import type { StudentServiceOption } from '@/lib/dashboard-data'
import { formatEuro } from '@/lib/money'


function formatBookingTime(startAt: string, endAt: string) {
  const s = new Date(startAt)
  const e = new Date(endAt)
  return (
    s.toLocaleDateString('en-PT', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    s.toLocaleTimeString('en-PT', { hour: '2-digit', minute: '2-digit' }) +
    '–' +
    e.toLocaleTimeString('en-PT', { hour: '2-digit', minute: '2-digit' })
  )
}

interface Props {
  userName: string
  upcoming: StudentBooking[]
  active: StudentPackage[]
  pendingHw: number
  lastPaymentAmount: number | null
  currentLevel: StudentProgressEntry | undefined
  homework?: StudentHomework[]
  materials?: StudentMaterial[]
  attendance?: { attended: number; absent: number; late: number }
  services: StudentServiceOption[]
}

export function DashboardClient({
  userName,
  upcoming,
  active,
  pendingHw,
  lastPaymentAmount,
  currentLevel,
  homework = [],
  materials = [],
  attendance = { attended: 0, absent: 0, late: 0 },
  services,
}: Props) {
  const [bookings, setBookings] = useState<StudentBooking[]>(upcoming)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [serviceIdx, setServiceIdx] = useState(0)
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'IN_PERSON'>(services[0]?.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const selectedService = services[serviceIdx]
  const serviceModes: ('ONLINE' | 'IN_PERSON')[] = selectedService?.deliveryMode === 'BOTH'
    ? ['ONLINE', 'IN_PERSON']
    : [selectedService?.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE']

  useEffect(() => setBookings(upcoming), [upcoming])

  const confirmedBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.startAt) >= new Date()
  )
  const nextLesson = confirmedBookings[0]

  const totalCreditsRemaining = active.reduce(
    (sum, p) => sum + Math.max(0, p.lessonCount - p.usedLessons),
    0
  )
  const totalCreditsAllocated = active.reduce((sum, p) => sum + p.lessonCount, 0)

  async function handleBook() {
    setError('')
    if (!date) {
      setError('Please select a preferred date.')
      return
    }
    const svc = services[serviceIdx]
    if (!svc) {
      setError('No class services are available right now. Please contact the academy.')
      return
    }
    const startAt = new Date(`${date}T${time}:00`).toISOString()
    setLoading(true)
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_BOOKING',
          payload: {
            serviceName: svc.name,
            language: svc.language,
            durationMinutes: svc.durationMinutes,
            deliveryMode,
            startAt,
          },
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBookings((prev) => [json.data, ...prev])
      setShowModal(false)
      setSuccess('Class successfully scheduled! Your teacher will see you in class.')
      setTimeout(() => setSuccess(''), 6000)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const firstName = userName.split(' ')[0]

  return (
    <div className="dashboard-page space-y-8">
      {/* ── 1. Student Hero Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-850 p-6 sm:p-8 text-white shadow-lg border border-brand-800/60">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-xs">
                <span>🇵🇹</span>
                <span>Olá, {firstName}! Bem-vindo de volta</span>
              </span>
              {currentLevel && (
                <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Track Level: {currentLevel.level} — {currentLevel.label}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Your Learning <span className="text-amber-400">Portal</span>
            </h1>

            <p className="text-xs sm:text-sm text-brand-200/90 leading-relaxed font-normal">
              Track your language progression, join live video classes with your tutor, complete assigned exercises, and monitor your lesson credit balance.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex items-center gap-3 flex-wrap self-start lg:self-center flex-shrink-0">
            {services.length > 0 && <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-brand-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Book Class</span>
            </button>}

            {nextLesson && nextLesson.deliveryMode === 'ONLINE' && nextLesson.meetingLink && (
              <a
                href={nextLesson.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/10 text-white font-extrabold text-xs sm:text-sm border border-white/25 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Join Classroom</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="text-lg">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* ── 2. Learning summary ── */}
      <div className="dashboard-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Card 1: Next Lesson */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Next Live Class</span>
            <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200/70">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {nextLesson ? (
              <>
                <div className="text-sm font-extrabold text-slate-900 leading-snug truncate">
                  {nextLesson.serviceName}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{formatBookingTime(nextLesson.startAt, nextLesson.endAt)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>with {nextLesson.tutorName}</span>
                  <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                    {nextLesson.deliveryMode === 'ONLINE' ? (
                      <>
                        <svg className="h-3 w-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Online Video</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>In-Person</span>
                      </>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-base font-bold text-slate-700">No class scheduled</div>
                <p className="text-xs text-slate-600 mt-1">Book a session to keep learning</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {services.length > 0 && <button
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
                  >
                    Schedule Now →
                  </button>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Lesson Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lesson Credits</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalCreditsRemaining}
              </span>
              <span className="text-xs font-bold text-slate-600">Remaining</span>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-600 truncate">
              {active.length > 0 ? active[0].name : 'No active packages'}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link href="/student/packages" className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
                Package Details →
              </Link>
              <span className="text-slate-600 text-[11px] font-medium">
                {totalCreditsAllocated > 0 ? `${totalCreditsRemaining}/${totalCreditsAllocated} left` : 'Add credits'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: CEFR Level Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">CEFR Roadmap</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/70">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {currentLevel ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentLevel.level}
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                    {currentLevel.label}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 truncate">
                  {currentLevel.completedLessons} lessons completed
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link href="/student/progress" className="font-bold text-purple-700 hover:text-purple-900 hover:underline">
                    View Progress →
                  </Link>
                  <span className="text-slate-600 text-[11px]">Current level</span>
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-slate-600">Level assessment pending</div>
            )}
          </div>
        </div>

        {/* Card 4: Assignments & Homework */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Homework Due</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {pendingHw}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                {pendingHw === 1 ? '1 Task' : `${pendingHw} Tasks`}
              </span>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-600 truncate">
              {homework.length > 0 ? homework[0].title : 'No homework has been assigned'}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link href="/student/homework" className="font-bold text-brand-700 hover:text-brand-900 hover:underline">
                Review Exercises →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-brand-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Recent payment</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 text-sm font-extrabold text-emerald-700">€</span>
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
            {lastPaymentAmount === null ? '—' : formatEuro(lastPaymentAmount)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-600">Most recent successful payment</p>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <Link href="/student/payments" className="text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline">View payment history →</Link>
          </div>
        </div>
      </div>

      {/* ── 3. Main Two-Column Student Center ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Attendance summary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Your attendance</h2>
            <p className="mt-1 text-xs text-slate-600">Recorded lesson attendance to date</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">{attendance.attended} attended</span>
            <span className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">{attendance.late} late</span>
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">{attendance.absent} missed</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (7 cols): Confirmed Schedule & Lesson History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                My Class Schedule
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Confirmed upcoming lessons with teacher meeting links
              </p>
            </div>

            <Link
              href="/student/bookings"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
            >
              All Bookings →
            </Link>
          </div>

          <div className="space-y-3.5">
            {confirmedBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-600 space-y-3">
                <EmptyStateIcon name="book" />
                <p className="font-bold text-sm text-slate-800">You have no upcoming lessons scheduled</p>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Book your next session to continue your learning plan.
                </p>
                {services.length > 0 && <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900 text-white font-bold text-xs shadow-xs hover:bg-brand-850 transition-all"
                >
                  <span>+</span>
                  <span>Book a Lesson Now</span>
                </button>}
              </div>
            ) : (
              confirmedBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-brand-400/70 hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 truncate">
                        {b.serviceName}
                      </span>
                      <BookingStatusBadge status={b.status} />
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full">
                        {b.language === 'PORTUGUESE' ? (
                          <>
                            <PortugalFlagIcon className="h-2.5 w-3.5" />
                            <span>Portuguese</span>
                          </>
                        ) : b.language === 'ENGLISH' ? (
                          <>
                            <UKFlagIcon className="h-2.5 w-3.5" />
                            <span>English</span>
                          </>
                        ) : (
                          <>
                            <DualFlagIcon className="h-2.5 w-3.5" />
                            <span>Portuguese &amp; English</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-brand-800 font-extrabold">
                      <svg className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatBookingTime(b.startAt, b.endAt)}</span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Teacher: <span className="font-semibold text-slate-700">{b.tutorName}</span> · Mode:{' '}
                      <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                        {b.deliveryMode === 'ONLINE' ? (
                          <>
                            <svg className="h-3 w-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Google Meet</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Lisbon Studio</span>
                          </>
                        )}
                      </span>
                    </p>

                    {b.lessonNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 font-medium">
                        <strong className="text-slate-800">Lesson Objective:</strong> {b.lessonNotes}
                      </p>
                    )}
                  </div>

                  {b.deliveryMode === 'ONLINE' && b.meetingLink && (
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all self-start sm:self-center flex-shrink-0"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Join Classroom</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Learning resources */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Handouts & Quick Study Materials */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Recent learning materials</h3>
              <Link href="/student/materials" className="text-xs font-bold text-brand-700 hover:underline">
                All Files →
              </Link>
            </div>

            <div className="space-y-2">
              {materials.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-600">
                  No learning materials have been shared yet.
                </p>
              ) : materials.slice(0, 3).map((m) => (
                <Link
                  key={m.id}
                  href={m.url}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-brand-300 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 px-1.5 text-[9px] font-extrabold uppercase text-brand-700">
                      {m.type === 'WORKSHEET' ? 'DOC' : m.type.slice(0, 3)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-brand-700 truncate">
                        {m.title}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate">{m.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand-600 font-bold flex-shrink-0 ml-2">Open ↗</span>
                </Link>
              ))}
            </div>
          </div>


        </div>
      </div>

      {/* ── Modal: Book a Class ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Schedule Your Next Lesson</h2>
                <p className="text-xs text-slate-600 mt-0.5">Pick your curriculum service and preferred time</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError('')
                }}
                className="text-slate-600 hover:text-slate-600 rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Curriculum Service</label>
                <select
                  value={serviceIdx}
                  onChange={(e) => {
                    const index = Number(e.target.value)
                    setServiceIdx(index)
                    const mode = services[index]?.deliveryMode
                    if (mode === 'ONLINE' || mode === 'IN_PERSON') setDeliveryMode(mode)
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  {services.map((s, i) => (
                    <option key={i} value={i}>
                      {s.name} - {formatEuro(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Delivery Mode</label>
                <div className="flex gap-2">
                  {serviceModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDeliveryMode(mode)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        deliveryMode === mode
                          ? 'bg-brand-900 text-white border-brand-900 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-brand-300 bg-white'
                      }`}
                    >
                      {mode === 'ONLINE' ? '💻 Online (Google Meet)' : '📍 In-Person (Lisbon)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Select Date</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Select Time (Lisbon WET)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-600">{error}</p>}
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setError('')
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBook}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors"
              >
                {loading ? 'Confirming…' : 'Confirm Class Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
