'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/ui/badge'
import type { StudentBooking } from '@/lib/student-data'

const SERVICES = [
  { label: 'Portuguese — 60 min Individual', value: 'Portuguese — 60 min Individual', language: 'PORTUGUESE' as const, duration: 60, price: 35 },
  { label: 'Portuguese — 90 min Individual', value: 'Portuguese — 90 min Individual', language: 'PORTUGUESE' as const, duration: 90, price: 50 },
  { label: 'English — 60 min Individual', value: 'English — 60 min Individual', language: 'ENGLISH' as const, duration: 60, price: 35 },
  { label: 'English — 90 min Individual', value: 'English — 90 min Individual', language: 'ENGLISH' as const, duration: 90, price: 50 },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-PT', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  initialBookings: StudentBooking[]
}

export function BookingsClient({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<StudentBooking[]>(initialBookings)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [serviceIdx, setServiceIdx] = useState(0)
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')

  async function handleBook() {
    setError('')
    if (!date) { setError('Please select a date.'); return }
    const svc = SERVICES[serviceIdx]
    const startAt = new Date(`${date}T${time}:00`).toISOString()
    setLoading(true)
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_BOOKING',
          payload: {
            serviceName: svc.value,
            language: svc.language,
            durationMinutes: svc.duration,
            deliveryMode,
            startAt,
          },
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBookings(prev => [json.data, ...prev])
      setShowModal(false)
      setSuccess('Booking confirmed! Your tutor will be in touch shortly.')
      setTimeout(() => setSuccess(''), 6000)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL_BOOKING', payload: { id } }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
    } catch (e: any) {
      alert(e.message ?? 'Failed to cancel booking')
    }
  }

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.startAt) >= new Date())
  const history = bookings.filter(b => b.status !== 'CONFIRMED' || new Date(b.startAt) < new Date())

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">Your lesson schedule and history</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Book a Lesson</Button>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-green-800 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">Upcoming Lessons</h2>
          <div className="space-y-3">
            {upcoming.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-slate-900">{b.serviceName}</span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-slate-600">{formatDate(b.startAt)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      with {b.tutorName} · {b.deliveryMode === 'ONLINE' ? 'Online' : 'In-Person'} · {b.durationMinutes} min
                    </p>
                    {b.lessonNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                        <strong>Focus:</strong> {b.lessonNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {b.deliveryMode === 'ONLINE' && b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-900 hover:bg-brand-850 text-white font-bold text-xs shadow-2xs transition-all"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Join Class</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {upcoming.length === 0 && history.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-3" aria-hidden="true">📅</p>
          <p className="font-semibold text-slate-700 mb-2">No bookings yet</p>
          <p className="text-sm text-slate-500 mb-6">Book your first lesson to get started.</p>
          <Button onClick={() => setShowModal(true)}>Book a Lesson</Button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">Lesson History</h2>
          <div className="space-y-3">
            {history.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{b.serviceName}</span>
                      <BookingStatusBadge status={b.status} />
                      {b.attendanceStatus && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.attendanceStatus === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : b.attendanceStatus === 'ABSENT'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {b.attendanceStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{formatDate(b.startAt)}</p>
                    <p className="text-xs text-slate-500">
                      with {b.tutorName} · {b.deliveryMode === 'ONLINE' ? 'Online' : 'In-Person'} · {b.durationMinutes} min
                    </p>
                    {b.lessonNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                        <strong>Lesson Notes:</strong> {b.lessonNotes}
                      </p>
                    )}
                    {b.tutorFeedback && (
                      <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg mt-1 border border-emerald-200/60">
                        <strong>Tutor Feedback:</strong> {b.tutorFeedback}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">€{b.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7">
            <h2 className="text-lg font-extrabold text-slate-900 mb-5">Book a Lesson</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service</label>
                <select
                  value={serviceIdx}
                  onChange={e => setServiceIdx(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {SERVICES.map((s, i) => (
                    <option key={i} value={i}>{s.label} — €{s.price}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Delivery Mode</label>
                <div className="flex gap-3">
                  {(['ONLINE', 'IN_PERSON'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setDeliveryMode(mode)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        deliveryMode === mode
                          ? 'bg-brand-900 text-white border-brand-900'
                          : 'border-slate-200 text-slate-700 hover:border-brand-300'
                      }`}
                    >
                      {mode === 'ONLINE' ? 'Online' : 'In-Person'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setError('') }}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-brand-900 text-white text-sm font-semibold hover:bg-brand-800 disabled:opacity-50"
              >
                {loading ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
