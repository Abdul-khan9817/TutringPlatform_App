'use client'

import { useState } from 'react'
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
      setHomework(prev => prev.map(h => h.id === id ? { ...h, status: 'SUBMITTED' } : h))
    } catch (e: any) {
      alert(e.message ?? 'Failed to submit')
    } finally {
      setSubmitting(null)
    }
  }

  const pending = homework.filter(h => h.status === 'ASSIGNED')
  const submitted = homework.filter(h => h.status === 'SUBMITTED')
  const graded = homework.filter(h => h.status === 'GRADED')

  const statusConfig = {
    ASSIGNED: { label: 'Due', color: 'bg-amber-100 text-amber-800' },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    GRADED: { label: 'Graded', color: 'bg-green-100 text-green-800' },
  }

  function HwCard({ hw }: { hw: StudentHomework }) {
    const cfg = statusConfig[hw.status]
    const overdue = hw.status === 'ASSIGNED' && isOverdue(hw.dueDate)
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-slate-900">{hw.title}</h3>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{hw.instructions}</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            <span className={overdue ? 'text-red-600 font-semibold' : ''}>
              {overdue ? 'Overdue · ' : 'Due '}{formatDate(hw.dueDate)}
            </span>
            <span className="mx-2">·</span>
            <span>Assigned {formatDate(hw.assignedAt)}</span>
          </div>
          {hw.status === 'ASSIGNED' && (
            <button
              onClick={() => handleSubmit(hw.id)}
              disabled={submitting === hw.id}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-brand-900 text-white hover:bg-brand-800 disabled:opacity-50 transition-colors"
            >
              {submitting === hw.id ? 'Submitting…' : 'Mark as Submitted'}
            </button>
          )}
        </div>
        {hw.feedback && (
          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Tutor Feedback{hw.grade ? ` · Grade: ${hw.grade}` : ''}
            </p>
            <p className="text-sm text-slate-700">{hw.feedback}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Homework</h1>
        <p className="text-slate-500 mt-1">Assignments from your tutor</p>
      </div>

      {homework.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-3" aria-hidden="true">📝</p>
          <p className="font-semibold text-slate-700">No assignments yet</p>
          <p className="text-sm text-slate-500 mt-1">Your tutor will assign homework after your lessons.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Pending <span className="ml-1.5 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{pending.length}</span>
          </h2>
          <div className="space-y-4">{pending.map(hw => <HwCard key={hw.id} hw={hw} />)}</div>
        </div>
      )}

      {submitted.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">Awaiting Review</h2>
          <div className="space-y-4">{submitted.map(hw => <HwCard key={hw.id} hw={hw} />)}</div>
        </div>
      )}

      {graded.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">Graded</h2>
          <div className="space-y-4">{graded.map(hw => <HwCard key={hw.id} hw={hw} />)}</div>
        </div>
      )}
    </div>
  )
}
