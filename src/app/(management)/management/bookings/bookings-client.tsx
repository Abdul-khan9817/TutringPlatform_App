'use client'

import { useState } from 'react'
import type { BookingRecord } from '@/lib/admin-data'
import { PortugalFlagIcon, UKFlagIcon } from '@/components/ui/flags'

export function BookingsClient({ initialBookings }: { initialBookings: BookingRecord[] }) {
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings)
  const [filter, setFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null)
  const [modalType, setModalType] = useState<'ATTENDANCE' | 'MEETING_LINK' | null>(null)

  // Attendance Form State
  const [attendanceStatus, setAttendanceStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT')
  const [lessonNotes, setLessonNotes] = useState('')
  const [tutorFeedback, setTutorFeedback] = useState('')

  // Meeting Link State
  const [meetingLinkInput, setMeetingLinkInput] = useState('')

  // New Booking State
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [newService, setNewService] = useState('European Portuguese for Workplace')
  const [newLanguage, setNewLanguage] = useState<'PORTUGUESE' | 'ENGLISH'>('PORTUGUESE')
  const [newDeliveryMode, setNewDeliveryMode] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE')
  const [newDateTime, setNewDateTime] = useState('')
  const [newPrice, setNewPrice] = useState(32)

  const filtered = bookings.filter((b) => filter === 'ALL' || b.status === filter)

  const handleStatusChange = async (id: string, newStatus: BookingRecord['status']) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BOOKING_STATUS',
          payload: { id, status: newStatus },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)))
      }
    } catch {
      alert('Failed to update booking status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Record Attendance & Notes
  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBooking) return
    setUpdatingId(activeBooking.id)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_ATTENDANCE',
          payload: {
            id: activeBooking.id,
            attendanceStatus,
            lessonNotes,
            tutorFeedback,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setBookings((prev) => prev.map((b) => (b.id === activeBooking.id ? json.data : b)))
        setModalType(null)
      }
    } catch {
      alert('Failed to record attendance.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Update Meeting Link
  const handleUpdateMeetingLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBooking) return
    setUpdatingId(activeBooking.id)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MEETING_LINK',
          payload: { id: activeBooking.id, meetingLink: meetingLinkInput },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setBookings((prev) => prev.map((b) => (b.id === activeBooking.id ? json.data : b)))
        setModalType(null)
      }
    } catch {
      alert('Failed to update meeting link.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Schedule New Class
  const handleScheduleNewClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName || !newStudentEmail) return
    setUpdatingId('new')
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_BOOKING',
          payload: {
            studentName: newStudentName,
            studentEmail: newStudentEmail,
            serviceName: newService,
            language: newLanguage,
            deliveryMode: newDeliveryMode,
            durationMinutes: 60,
            price: newPrice,
            startAt: newDateTime ? new Date(newDateTime).toISOString() : undefined,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setBookings((prev) => [json.data, ...prev])
        setShowScheduleModal(false)
        setNewStudentName('')
        setNewStudentEmail('')
      }
    } catch {
      alert('Failed to schedule class.')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: BookingRecord['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
      case 'PENDING_PAYMENT':
        return 'bg-amber-50 text-amber-900 border-amber-200/80'
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-200/80'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return (
      d.toLocaleDateString('en-PT', { day: 'numeric', month: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-PT', { hour: '2-digit', minute: '2-digit' })
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Controls & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-2 sm:p-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { key: 'ALL', label: 'All Classes' },
            { key: 'CONFIRMED', label: 'Confirmed' },
            { key: 'PENDING_PAYMENT', label: 'Pending Payment' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => {
            const isActive = filter === tab.key
            const count = bookings.filter((b) => tab.key === 'ALL' || b.status === tab.key).length

            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150 self-start sm:self-auto flex-shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Schedule New Lesson</span>
        </button>
      </div>

      {/* ── Bookings Table (Horizontally contained) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Student & Lesson</th>
                <th className="px-5 py-4">Schedule & Delivery</th>
                <th className="px-5 py-4">Online Meeting Link</th>
                <th className="px-5 py-4">Attendance</th>
                <th className="px-5 py-4">Status & Fee</th>
                <th className="px-5 py-4 text-right">Class Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No classes found for the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student & Service */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900 text-sm">{b.studentName}</div>
                      <div className="text-xs text-slate-500 truncate">{b.studentEmail}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            b.language === 'PORTUGUESE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                              : 'bg-blue-50 text-blue-800 border-blue-200/60'
                          }`}
                        >
                          {b.language === 'PORTUGUESE' ? (
                            <>
                              <PortugalFlagIcon className="h-2.5 w-3.5" />
                              <span>Portuguese</span>
                            </>
                          ) : (
                            <>
                              <UKFlagIcon className="h-2.5 w-3.5" />
                              <span>English</span>
                            </>
                          )}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">{b.serviceName}</span>
                      </div>
                    </td>

                    {/* Schedule & Mode */}
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-slate-900">{formatDateTime(b.startAt)}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        {b.deliveryMode === 'ONLINE' ? (
                          <svg className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        <span>{b.deliveryMode === 'ONLINE' ? 'Online Video' : 'In-Person (Lisbon)'}</span>
                        <span>· {b.durationMinutes}m</span>
                      </div>
                    </td>

                    {/* Online Meeting Link */}
                    <td className="px-5 py-4">
                      {b.deliveryMode === 'ONLINE' ? (
                        <div className="flex items-center gap-2">
                          {b.meetingLink ? (
                            <a
                              href={b.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold transition-colors"
                              title={b.meetingLink}
                            >
                              <span>Join Meet</span>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No link set</span>
                          )}

                          <button
                            onClick={() => {
                              setActiveBooking(b)
                              setMeetingLinkInput(b.meetingLink || 'https://meet.google.com/ws-pt-class')
                              setModalType('MEETING_LINK')
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit meeting link"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Lisbon In-Person</span>
                      )}
                    </td>

                    {/* Attendance */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            b.attendanceStatus === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : b.attendanceStatus === 'ABSENT'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : b.attendanceStatus === 'LATE'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {b.attendanceStatus || 'PENDING'}
                        </span>

                        <button
                          onClick={() => {
                            setActiveBooking(b)
                            setAttendanceStatus(
                              b.attendanceStatus === 'PRESENT' || b.attendanceStatus === 'ABSENT' || b.attendanceStatus === 'LATE'
                                ? b.attendanceStatus
                                : 'PRESENT'
                            )
                            setLessonNotes(b.lessonNotes || '')
                            setTutorFeedback(b.tutorFeedback || '')
                            setModalType('ATTENDANCE')
                          }}
                          className="text-xs font-bold text-brand-700 hover:underline"
                        >
                          Record
                        </button>
                      </div>
                    </td>

                    {/* Status & Fee */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(b.status)}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                      <div className="font-extrabold text-slate-900 text-xs mt-1">{formatEuro(b.price)}</div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {b.status !== 'CONFIRMED' && (
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
                          >
                            Confirm
                          </button>
                        )}

                        {b.status !== 'COMPLETED' && (
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {b.status !== 'CANCELLED' && (
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Record Attendance & Notes ── */}
      {modalType === 'ATTENDANCE' && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Attendance & Feedback: {activeBooking.studentName}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordAttendance} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PRESENT', 'LATE', 'ABSENT'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendanceStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        attendanceStatus === st
                          ? 'bg-brand-900 text-white border-brand-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'PRESENT' ? '✓ Present' : st === 'LATE' ? '⏱ Late' : '✕ Absent'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Notes (Administrative / Internal)</label>
                <textarea
                  rows={2}
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                  placeholder="Topics covered, grammar rules practiced, homework assigned..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tutor Feedback (Visible to Student)</label>
                <textarea
                  rows={2}
                  value={tutorFeedback}
                  onChange={(e) => setTutorFeedback(e.target.value)}
                  placeholder="Great progress today! Remember to review nasal vowels..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === activeBooking.id}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Meeting Link ── */}
      {modalType === 'MEETING_LINK' && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Online Meeting Link: {activeBooking.studentName}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMeetingLink} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Meet / Zoom URL</label>
                <input
                  type="url"
                  required
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === activeBooking.id}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Schedule New Lesson ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">Schedule New Class</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleNewClass} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Student Full Name"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Email</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@example.pt"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Language Track</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="PORTUGUESE">Portuguese</option>
                    <option value="ENGLISH">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
                  <select
                    value={newDeliveryMode}
                    onChange={(e) => setNewDeliveryMode(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="ONLINE">Online Video</option>
                    <option value="IN_PERSON">In-Person (Lisbon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Service</label>
                <input
                  type="text"
                  required
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="e.g. European Portuguese for Workplace"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (€)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === 'new'}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
