'use client'

import { EmptyStateIcon } from '@/components/ui/empty-state-icon'

import { useEffect, useState } from 'react'
import type { StudentHomework } from '@/lib/student-data'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date()
}

interface Props {
  initialHomework: StudentHomework[]
}

export function HomeworkClient({ initialHomework }: Props) {
  const [homework, setHomework] = useState<StudentHomework[]>(initialHomework)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'ASSIGNED' | 'SUBMITTED' | 'GRADED'>('ALL')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => setHomework(initialHomework), [initialHomework])

  async function handleSubmit(id: string) {
    setSubmitting(id)
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_HOMEWORK', payload: { id } }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setHomework((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: 'SUBMITTED' } : h))
      )
      setSuccessMsg('Assignment submitted successfully! Your tutor will review and provide feedback.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (e: any) {
      alert(e.message ?? 'Failed to submit homework')
    } finally {
      setSubmitting(null)
    }
  }

  const pending = homework.filter((h) => h.status === 'ASSIGNED')
  const submitted = homework.filter((h) => h.status === 'SUBMITTED')
  const graded = homework.filter((h) => h.status === 'GRADED')

  const filtered =
    filter === 'ALL'
      ? homework
      : homework.filter((h) => h.status === filter)

  const statusConfig = {
    ASSIGNED: { label: 'Due for Review', badge: 'bg-amber-50 text-amber-900 border-amber-200' },
    SUBMITTED: { label: 'Submitted · Awaiting Review', badge: 'bg-blue-50 text-blue-900 border-blue-200' },
    GRADED: { label: 'Reviewed & Graded', badge: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
              Learning
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Homework
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View assigned work, submit exercises and review tutor feedback.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold self-start sm:self-auto">
          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {pending.length} Pending {pending.length === 1 ? 'Task' : 'Tasks'}
          </span>
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {graded.length} Completed
          </span>
        </div>
      </div>

      {/* ── Success Alert ── */}
      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-xs animate-fade-in">
          <span className="text-lg">✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>All Assignments</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {homework.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('ASSIGNED')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'ASSIGNED'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Pending Due</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold">
            {pending.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('SUBMITTED')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'SUBMITTED'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Under Review</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
            {submitted.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('GRADED')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'GRADED'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>Graded & Completed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {graded.length}
          </span>
        </button>
      </div>

      {/* ── Homework Cards List ── */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
            <EmptyStateIcon name="clipboard" />
            <p className="font-extrabold text-base text-slate-900">No assignments found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your tutor will assign exercises following your live classroom sessions.
            </p>
          </div>
        ) : (
          filtered.map((hw) => {
            const cfg = statusConfig[hw.status]
            const overdue = hw.status === 'ASSIGNED' && isOverdue(hw.dueDate)

            return (
              <div
                key={hw.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-brand-400/80 hover:shadow-md transition-all duration-200 p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-extrabold text-slate-900">{hw.title}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                    {overdue && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    <span className={overdue ? 'text-red-600 font-bold' : ''}>
                      Due: {formatDate(hw.dueDate)}
                    </span>
                    <span className="mx-2">·</span>
                    <span>Assigned: {formatDate(hw.assignedAt)}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {hw.instructions}
                </p>

                {/* Tutor Feedback Block */}
                {hw.feedback && (
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>💬</span>
                        <span>Tutor Feedback</span>
                      </span>
                      {hw.grade && (
                        <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                          Grade: {hw.grade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
                      {hw.feedback}
                    </p>
                  </div>
                )}

                {/* Card footer / submit action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
                  <span className="text-xs text-slate-400">
                    Submit when finished so your teacher can review it before the next session.
                  </span>

                  {hw.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleSubmit(hw.id)}
                      disabled={submitting === hw.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{submitting === hw.id ? 'Submitting…' : 'Mark as Completed & Submit'}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
