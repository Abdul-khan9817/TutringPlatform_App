'use client'

import { EmptyStateIcon } from '@/components/ui/empty-state-icon'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/ui/badge'
import { PortugalFlagIcon, UKFlagIcon, DualFlagIcon } from '@/components/ui/flags'
import type { StudentBooking } from '@/lib/student-data'
import type { StudentServiceOption } from '@/lib/dashboard-data'
import { formatEuro } from '@/lib/money'


function formatDate(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-PT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-PT', { hour: '2-digit', minute: '2-digit' })
  )
}

interface Props {
  initialBookings: StudentBooking[]
  services: StudentServiceOption[]
}

export function BookingsClient({ initialBookings, services }: Props) {
  const [bookings, setBookings] = useState<StudentBooking[]>(initialBookings)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY' | 'ALL'>('UPCOMING')

  // Form state
  const [serviceIdx, setServiceIdx] = useState(0)
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'IN_PERSON'>(services[0]?.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const selectedService = services[serviceIdx]
  const serviceModes: ('ONLINE' | 'IN_PERSON')[] = selectedService?.deliveryMode === 'BOTH'
    ? ['ONLINE', 'IN_PERSON']
    : [selectedService?.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE']

  useEffect(() => setBookings(initialBookings), [initialBookings])

  async function handleBook() {
    setError('')
    if (!date) {
      setError('Please select a lesson date.')
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
      setDate('')
      setSuccess('Class successfully scheduled! Your teacher will see you in class.')
      setTimeout(() => setSuccess(''), 6000)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this scheduled lesson?')) return
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL_BOOKING', payload: { id } }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
      )
    } catch (e: any) {
      alert(e.message ?? 'Failed to cancel booking')
    }
  }

  const upcoming = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.startAt) >= new Date()
  )
  const history = bookings.filter(
    (b) => b.status !== 'CONFIRMED' || new Date(b.startAt) < new Date()
  )

  const displayedList =
    activeTab === 'UPCOMING' ? upcoming : activeTab === 'HISTORY' ? history : bookings

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
              My learning
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Lessons
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View upcoming sessions, meeting details and past lesson notes.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          disabled={services.length === 0}
          className="self-start sm:self-auto gap-2 bg-brand-700 hover:bg-brand-800 text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>{services.length > 0 ? 'Schedule Lesson' : 'No services available'}</span>
        </Button>
      </div>

      {/* ── Success Alert ── */}
      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="text-lg">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Upcoming Sessions</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'UPCOMING' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Completed & History</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'HISTORY' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {history.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>All Records</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'ALL' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {bookings.length}
          </span>
        </button>
      </div>

      {/* ── Bookings Cards List ── */}
      <div className="space-y-3.5">
        {displayedList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
            <EmptyStateIcon name="calendar" />
            <p className="font-extrabold text-base text-slate-900">
              {activeTab === 'UPCOMING'
                ? 'No upcoming lessons scheduled'
                : 'No lesson records found in this view'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {services.length > 0 ? 'Choose a service and time to request your next lesson.' : 'The academy has not opened any classes for booking yet.'}
            </p>
            <Button onClick={() => setShowModal(true)} disabled={services.length === 0} className="mt-2 bg-brand-700 text-white disabled:cursor-not-allowed disabled:opacity-50">
              Schedule Lesson Now
            </Button>
          </div>
        ) : (
          displayedList.map((b) => {
            const isFuture = new Date(b.startAt) >= new Date()
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-brand-400/80 hover:shadow-md transition-all duration-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-base text-slate-900 truncate">
                      {b.serviceName}
                    </span>
                    <BookingStatusBadge status={b.status} />
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {b.language === 'PORTUGUESE' ? (
                        <>
                          <PortugalFlagIcon className="h-3 w-4" />
                          <span>Portuguese</span>
                        </>
                      ) : b.language === 'ENGLISH' ? (
                        <>
                          <UKFlagIcon className="h-3 w-4" />
                          <span>English</span>
                        </>
                      ) : (
                        <>
                          <DualFlagIcon className="h-3 w-4" />
                          <span>Portuguese &amp; English</span>
                        </>
                      )}
                    </span>
                    {b.attendanceStatus && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.attendanceStatus === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : b.attendanceStatus === 'ABSENT'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {b.attendanceStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-brand-800 font-extrabold">
                    <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(b.startAt)}</span>
                    <span className="text-slate-400 font-normal">({b.durationMinutes} min)</span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Teacher: <span className="font-semibold text-slate-700">{b.tutorName}</span> · Mode:{' '}
                    <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                      {b.deliveryMode === 'ONLINE' ? (
                        <>
                          <svg className="h-3.5 w-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Google Meet Video</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>In-Person (Lisbon Center)</span>
                        </>
                      )}
                    </span>
                  </p>

                  {b.lessonNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 font-medium">
                      <strong className="text-slate-800">Lesson Objective:</strong> {b.lessonNotes}
                    </p>
                  )}

                  {b.tutorFeedback && (
                    <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 mt-1.5 font-medium">
                      <strong className="text-emerald-950">Tutor Feedback:</strong> {b.tutorFeedback}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                  {b.deliveryMode === 'ONLINE' && b.meetingLink && b.status === 'CONFIRMED' && isFuture && (
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Join Class</span>
                    </a>
                  )}

                  {b.status === 'CONFIRMED' && isFuture && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-xs text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 font-medium transition-colors"
                      title="Cancel this lesson booking"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal: Schedule Class ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-4 border border-slate-200">
            {/* Tricolor accent bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400 mb-2 rounded-full" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Schedule Your Lesson</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select your program service and preferred slot</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError('')
                }}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Program & Curriculum Service</label>
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
                <label className="block font-bold text-slate-700 mb-1.5">Delivery Format</label>
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
                      {mode === 'ONLINE' ? '💻 Online Video' : '📍 Lisbon Studio'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Session Date</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Session Time (WET)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{error}</p>}
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
