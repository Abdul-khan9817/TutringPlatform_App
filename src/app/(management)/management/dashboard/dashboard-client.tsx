'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BookingRecord, AssessmentRecord } from '@/lib/admin-data'

function PortugalFlagIcon() {
  return (
    <svg className="h-4 w-5 rounded shadow-2xs overflow-hidden flex-shrink-0" viewBox="0 0 600 400" aria-hidden="true">
      <rect width="240" height="400" fill="#046A38" />
      <rect x="240" width="360" height="400" fill="#DA291C" />
      <circle cx="240" cy="200" r="80" fill="#FFE900" />
      <circle cx="240" cy="200" r="50" fill="#DA291C" />
      <circle cx="240" cy="200" r="30" fill="#FFFFFF" />
    </svg>
  )
}

function UKFlagIcon() {
  return (
    <svg className="h-4 w-5 rounded shadow-2xs overflow-hidden flex-shrink-0" viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id="uk-flag-adm-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="uk-flag-adm-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#uk-flag-adm-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-adm-diag)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  )
}

interface DashboardProps {
  stats: {
    totalStudents: number
    newStudents: number
    upcomingLessons: number
    pendingActions: number
    monthlyRevenue: number
    totalRevenue: number
  }
  initialBookings: BookingRecord[]
  initialAssessments: AssessmentRecord[]
}

export function DashboardClient({ stats, initialBookings, initialAssessments }: DashboardProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings)
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(initialAssessments)
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ONLINE' | 'IN_PERSON'>('ALL')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)

  // Quick Booking Form State
  const [bStudentName, setBStudentName] = useState('')
  const [bStudentEmail, setBStudentEmail] = useState('')
  const [bService, setBService] = useState('European Portuguese for Workplace')
  const [bLanguage, setBLanguage] = useState<'PORTUGUESE' | 'ENGLISH'>('PORTUGUESE')
  const [bMode, setBMode] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE')
  const [bPrice, setBPrice] = useState(35)
  const [bMeetingLink, setBMeetingLink] = useState('https://meet.google.com/ws-pt-class')

  // Quick Student Form State
  const [sName, setSName] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sPhone, setSPhone] = useState('')
  const [sLanguage, setSLanguage] = useState<'PORTUGUESE' | 'ENGLISH' | 'BOTH'>('PORTUGUESE')
  const [sLevel, setSLevel] = useState('A1 — Beginner')

  const handleUpdateBooking = async (id: string, status: BookingRecord['status']) => {
    setActionLoadingId(id)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BOOKING_STATUS',
          payload: { id, status },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
      }
    } catch {
      alert('Failed to update booking status')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleUpdateAssessment = async (id: string, status: AssessmentRecord['status']) => {
    setActionLoadingId(id)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ASSESSMENT_STATUS',
          payload: { id, status },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      }
    } catch {
      alert('Failed to update assessment status')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bStudentName || !bStudentEmail) return
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_BOOKING',
          payload: {
            studentName: bStudentName,
            studentEmail: bStudentEmail,
            serviceName: bService,
            language: bLanguage,
            deliveryMode: bMode,
            durationMinutes: 60,
            price: bPrice,
            meetingLink: bMode === 'ONLINE' ? bMeetingLink : undefined,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setBookings((prev) => [json.data, ...prev])
        setShowBookingModal(false)
        setBStudentName('')
        setBStudentEmail('')
      }
    } catch {
      alert('Error creating booking')
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sName || !sEmail) return
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_STUDENT',
          payload: {
            name: sName,
            email: sEmail,
            phone: sPhone || '+351 900 000 000',
            preferredLanguage: sLanguage,
            currentLevel: sLevel,
            cefrLevel: 'A1',
            lessonBalance: 10,
            status: 'ACTIVE',
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setShowStudentModal(false)
        setSName('')
        setSEmail('')
        setSPhone('')
      }
    } catch {
      alert('Error adding student')
    }
  }

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return (
      d.toLocaleDateString('en-PT', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-PT', { hour: '2-digit', minute: '2-digit' })
    )
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const filteredBookings = confirmedBookings.filter(
    (b) => bookingFilter === 'ALL' || b.deliveryMode === bookingFilter
  )

  const newAssessments = assessments.filter((a) => a.status === 'NEW' || a.status === 'CONTACTED')

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* ── 1. Page Header (Consistent with Public Website Typography & Layout) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
              Platform Administration
            </span>
            <span className="text-xs font-medium text-slate-500">
              · Lisbon Executive Center (WET)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time academy performance, confirmed lessons, admissions pipeline, and student credits.
          </p>
        </div>

        {/* Primary & Secondary Action Buttons matching public site */}
        <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setShowBookingModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-semibold text-sm shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Schedule Lesson</span>
          </button>

          <button
            onClick={() => setShowStudentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-sm shadow-2xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* ── 2. Four Structured KPI Metric Cards (Matching Public Site Style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Monthly Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monthly Revenue
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold text-sm">
                €
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatEuro(stats.monthlyRevenue)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
              <span>↑ +14.2%</span>
              <span className="text-slate-400 font-normal">vs last cycle</span>
            </span>
            <span className="text-slate-400 font-medium">EUR Ledger</span>
          </div>
        </div>

        {/* Card 2: Enrolled Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Enrolled Students
              </span>
              <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-200/80 text-brand-700 flex items-center justify-center text-sm">
                👥
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalStudents}
              </span>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                +{stats.newStudents} this month
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Active across CEFR A1–C1</span>
            <Link href="/management/students" className="font-semibold text-brand-700 hover:underline">
              View All →
            </Link>
          </div>
        </div>

        {/* Card 3: Scheduled Lessons */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scheduled Lessons
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center text-sm">
                📅
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.upcomingLessons}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Confirmed
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Next starting in ~2h</span>
            <span className="text-slate-400">14 Online · 4 Lisbon</span>
          </div>
        </div>

        {/* Card 4: Action Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action Items
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center text-sm">
                ⚡
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.pendingActions}
              </span>
              <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                Action Required
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">New candidate assessments</span>
            <Link href="/management/assessments" className="font-semibold text-brand-700 hover:underline">
              Review Pipeline →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Operational Pulse Banner ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center text-sm flex-shrink-0">
            📊
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum Health</h3>
            <p className="text-sm font-extrabold text-slate-900">WorkSpeak Active Tracks & Attendance</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Portuguese Track (62%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>English Track (38%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-800">Attendance Rate: 97.4%</span>
          </div>
        </div>
      </div>

      {/* ── 4. Main Two-Column Operational Center ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (7 cols): Confirmed Lesson Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Confirmed Lesson Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active student sessions with meeting links and attendance confirmation
              </p>
            </div>

            {/* Delivery Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
              {(['ALL', 'ONLINE', 'IN_PERSON'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBookingFilter(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    bookingFilter === mode
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'ALL' ? 'All' : mode === 'ONLINE' ? 'Online' : 'In-Person'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
                <span className="text-3xl block mb-2">📅</span>
                <p className="font-bold text-sm text-slate-800">No scheduled lessons found</p>
                <p className="text-xs text-slate-400 mt-1">
                  There are no confirmed classes matching the selected delivery filter.
                </p>
              </div>
            ) : (
              filteredBookings.slice(0, 5).map((b) => {
                const initials = getInitials(b.studentName)
                const isPortuguese = b.language === 'PORTUGUESE'

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-brand-300 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Student Info & Details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                        {initials}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {b.studentName}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                            {isPortuguese ? <PortugalFlagIcon /> : <UKFlagIcon />}
                            <span>{isPortuguese ? 'Portuguese' : 'English'}</span>
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {b.deliveryMode === 'ONLINE' ? 'Online' : 'In-Person (Lisbon)'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 truncate">{b.serviceName}</p>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDateTime(b.startAt)}
                          </span>
                          <span>·</span>
                          <span>with {b.tutorName}</span>
                          <span>·</span>
                          <span className="font-bold text-slate-800">€{b.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons & Meeting Link */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 flex-wrap">
                      {b.deliveryMode === 'ONLINE' && b.meetingLink && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-semibold text-xs shadow-2xs transition-all"
                          title="Open Google Meet session"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Join Meet</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleUpdateBooking(b.id, 'COMPLETED')}
                        disabled={actionLoadingId === b.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
                        title="Mark session as completed"
                      >
                        ✓ Done
                      </button>

                      <button
                        onClick={() => handleUpdateBooking(b.id, 'CANCELLED')}
                        disabled={actionLoadingId === b.id}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Cancel class"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/management/bookings"
              className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
            >
              <span>View All Bookings & Schedules ({confirmedBookings.length})</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Admissions & Assessment Inquiries */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Admissions Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prospective students awaiting level evaluations
              </p>
            </div>

            <Link
              href="/management/assessments"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              All Inquiries →
            </Link>
          </div>

          <div className="space-y-3">
            {newAssessments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <span className="text-2xl block mb-1">🎉</span>
                <p className="font-bold text-sm text-slate-800">Admissions inbox is clear</p>
                <p className="text-xs text-slate-400 mt-1">No pending inquiries requiring evaluation right now.</p>
              </div>
            ) : (
              newAssessments.slice(0, 3).map((a) => {
                const cleanPhone = a.phone.replace(/[^0-9+]/g, '')

                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-xs transition-all duration-150 space-y-3"
                  >
                    {/* Top Row: Name, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{a.name}</h4>
                        <p className="text-xs text-slate-500">{a.email}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          a.status === 'NEW'
                            ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                            : 'bg-blue-50 text-blue-900 border-blue-200/80'
                        }`}
                      >
                        {a.status === 'NEW' ? 'New Inquiry' : 'Contacted'}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Track
                        </span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          {a.language === 'PORTUGUESE' ? <PortugalFlagIcon /> : <UKFlagIcon />}
                          <span>{a.language === 'PORTUGUESE' ? 'Portuguese' : 'English'}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Level
                        </span>
                        <span className="font-bold text-brand-700 mt-0.5 block">{a.currentLevel}</span>
                      </div>
                    </div>

                    {/* Candidate Goal Note */}
                    <div className="text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Learning Goal
                      </span>
                      <p className="line-clamp-2 leading-relaxed text-[11px] font-medium text-slate-600">{a.learningGoals}</p>
                    </div>

                    {/* Contact & Status Bar */}
                    <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs">
                        <a
                          href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                          title="Chat on WhatsApp"
                        >
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </a>
                        <span className="text-slate-300">·</span>
                        <a
                          href={`mailto:${a.email}`}
                          className="text-slate-500 hover:text-slate-800 font-semibold"
                          title="Send Email"
                        >
                          Email
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {a.status === 'NEW' && (
                          <button
                            onClick={() => handleUpdateAssessment(a.id, 'CONTACTED')}
                            disabled={actionLoadingId === a.id}
                            className="px-2.5 py-1 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-semibold transition-all disabled:opacity-50"
                          >
                            Mark Contacted
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateAssessment(a.id, 'SCHEDULED')}
                          disabled={actionLoadingId === a.id}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-all disabled:opacity-50"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── 5. Administrative Toolkit Shortcuts (Matching Public Site Quick Nav) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link
          href="/management/students"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 group flex items-center gap-3.5"
        >
          <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            👥
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors">
              Student Accounts
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">CEFR levels, profiles & credits</p>
          </div>
        </Link>

        <Link
          href="/management/materials"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 group flex items-center gap-3.5"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            📚
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Learning Materials
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">Upload PDFs, audios & exercises</p>
          </div>
        </Link>

        <Link
          href="/management/payments"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 group flex items-center gap-3.5"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            💳
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
              Invoices & Fees
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">EUR transactions & package sales</p>
          </div>
        </Link>

        <Link
          href="/management/settings"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-400 transition-all duration-200 group flex items-center gap-3.5"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            ⚙️
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-slate-700 transition-colors">
              Platform Settings
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">Admin profile & platform security</p>
          </div>
        </Link>
      </div>

      {/* ── Modal: Schedule New Class ── */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Schedule New Lesson</h3>
                <p className="text-xs text-slate-500 mt-0.5">Book an individual or workplace session</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={bStudentName}
                  onChange={(e) => setBStudentName(e.target.value)}
                  placeholder="e.g. Carlos Mendes"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={bStudentEmail}
                  onChange={(e) => setBStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Curriculum Track & Service</label>
                <select
                  value={bService}
                  onChange={(e) => setBService(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="European Portuguese for Workplace">European Portuguese for Workplace</option>
                  <option value="Portuguese Intensive A1">Portuguese Intensive A1</option>
                  <option value="Medical & Professional English">Medical & Professional English</option>
                  <option value="Executive Presentation Skills">Executive Presentation Skills</option>
                  <option value="Legal English & Contract Drafting">Legal English & Contract Drafting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Language</label>
                  <select
                    value={bLanguage}
                    onChange={(e) => setBLanguage(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="PORTUGUESE">🇵🇹 Portuguese</option>
                    <option value="ENGLISH">🇬🇧 English</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery</label>
                  <select
                    value={bMode}
                    onChange={(e) => setBMode(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="ONLINE">Online (Meet)</option>
                    <option value="IN_PERSON">In-Person (Lisbon)</option>
                  </select>
                </div>
              </div>

              {bMode === 'ONLINE' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Google Meet / Video Link</label>
                  <input
                    type="url"
                    value={bMeetingLink}
                    onChange={(e) => setBMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Fee (€ EUR)</label>
                <input
                  type="number"
                  value={bPrice}
                  onChange={(e) => setBPrice(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold shadow-xs"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Enroll New Student ── */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Enroll New Student</h3>
                <p className="text-xs text-slate-500 mt-0.5">Create learner account and assign curriculum track</p>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  placeholder="student@company.pt"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={sPhone}
                  onChange={(e) => setSPhone(e.target.value)}
                  placeholder="+351 925 987 654"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curriculum Track</label>
                  <select
                    value={sLanguage}
                    onChange={(e) => setSLanguage(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="PORTUGUESE">🇵🇹 Portuguese</option>
                    <option value="ENGLISH">🇬🇧 English</option>
                    <option value="BOTH">🌐 Dual Track</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CEFR Entry Level</label>
                  <select
                    value={sLevel}
                    onChange={(e) => setSLevel(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="A1 — Beginner">A1 Beginner</option>
                    <option value="A2 — Elementary">A2 Elementary</option>
                    <option value="B1 — Intermediate">B1 Intermediate</option>
                    <option value="B2 — Upper Intermediate">B2 Upper</option>
                    <option value="C1 — Advanced Business">C1 Advanced</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold shadow-xs"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
