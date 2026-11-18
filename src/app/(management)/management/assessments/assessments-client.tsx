'use client'

import { useState } from 'react'
import type { AssessmentRecord } from '@/lib/admin-data'
import { PortugalFlagIcon, UKFlagIcon, DualFlagIcon } from '@/components/ui/flags'

const LEVEL_OPTIONS = [
  'A0 — Total Beginner',
  'A1 — Beginner',
  'A2 — Elementary',
  'B1 — Intermediate',
  'B2 — Upper Intermediate',
  'C1 — Advanced',
  'C2 — Mastery',
]

export function AssessmentsClient({ initialAssessments }: { initialAssessments: AssessmentRecord[] }) {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(initialAssessments)
  const [filter, setFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeAssessment, setActiveAssessment] = useState<AssessmentRecord | null>(null)
  const [asmName, setAsmName] = useState('')
  const [asmEmail, setAsmEmail] = useState('')
  const [asmPhone, setAsmPhone] = useState('')
  const [asmLanguage, setAsmLanguage] = useState<'PORTUGUESE' | 'ENGLISH' | 'BOTH'>('PORTUGUESE')
  const [asmDeliveryMode, setAsmDeliveryMode] = useState<'ONLINE' | 'IN_PERSON' | 'BOTH'>('ONLINE')
  const [asmCurrentLevel, setAsmCurrentLevel] = useState('A1 — Beginner')
  const [asmGoals, setAsmGoals] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = assessments.filter((a) => filter === 'ALL' || a.status === filter)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const openEditModal = (a: AssessmentRecord) => {
    setActiveAssessment(a)
    setAsmName(a.name)
    setAsmEmail(a.email)
    setAsmPhone(a.phone ?? '')
    setAsmLanguage((a.language as 'PORTUGUESE' | 'ENGLISH' | 'BOTH') ?? 'PORTUGUESE')
    setAsmDeliveryMode((a.deliveryMode as 'ONLINE' | 'IN_PERSON' | 'BOTH') ?? 'ONLINE')
    setAsmCurrentLevel(a.currentLevel ?? 'A1 — Beginner')
    setAsmGoals(a.learningGoals ?? '')
    setShowEditModal(true)
  }

  const handleStatusChange = async (id: string, newStatus: AssessmentRecord['status']) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ASSESSMENT_STATUS',
          payload: { id, status: newStatus },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
      }
    } catch {
      alert('Failed to update assessment status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAssessment || !asmName.trim() || !asmEmail.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ASSESSMENT',
          payload: {
            id: activeAssessment.id,
            data: {
              name: asmName.trim(),
              email: asmEmail.trim(),
              phone: asmPhone.trim(),
              language: asmLanguage,
              deliveryMode: asmDeliveryMode,
              currentLevel: asmCurrentLevel,
              learningGoals: asmGoals.trim(),
            },
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setAssessments((prev) =>
          prev.map((a) =>
            a.id === activeAssessment.id
              ? {
                  ...a,
                  name: asmName.trim(),
                  email: asmEmail.trim(),
                  phone: asmPhone.trim(),
                  language: asmLanguage,
                  deliveryMode: asmDeliveryMode,
                  currentLevel: asmCurrentLevel,
                  learningGoals: asmGoals.trim(),
                }
              : a
          )
        )
        setShowEditModal(false)
        setActiveAssessment(null)
      } else {
        alert('Failed to update assessment. Please try again.')
      }
    } catch {
      alert('Failed to update assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (a: AssessmentRecord) => {
    if (!window.confirm(`Delete assessment inquiry for ${a.name}? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_ASSESSMENT',
          payload: { id: a.id },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setAssessments((prev) => prev.filter((x) => x.id !== a.id))
      } else {
        alert('Failed to delete assessment. Please try again.')
      }
    } catch {
      alert('Failed to delete assessment. Please try again.')
    }
  }

  const getStatusBadge = (status: AssessmentRecord['status']) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New Inquiry',
          className: 'bg-amber-50 text-amber-900 border-amber-200/90',
          dot: 'bg-amber-500 animate-pulse',
        }
      case 'CONTACTED':
        return {
          label: 'Contacted',
          className: 'bg-blue-50 text-blue-900 border-blue-200/90',
          dot: 'bg-blue-500',
        }
      case 'SCHEDULED':
        return {
          label: 'Call Scheduled',
          className: 'bg-purple-50 text-purple-900 border-purple-200/90',
          dot: 'bg-purple-500',
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
          dot: 'bg-emerald-500',
        }
      default:
        return {
          label: status,
          className: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-400',
        }
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const formatSubmissionDate = (iso: string) => {
    try {
      const date = new Date(iso)
      return date.toLocaleDateString('en-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return 'Recently'
    }
  }

  // ── Shared modal form fields ──────────────────────────────────────────────

  const AssessmentFormFields = () => (
    <>
      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          required
          value={asmName}
          onChange={(e) => setAsmName(e.target.value)}
          placeholder="e.g. Maria Silva"
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
        <input
          type="email"
          required
          value={asmEmail}
          onChange={(e) => setAsmEmail(e.target.value)}
          placeholder="e.g. maria@example.com"
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
        <input
          type="text"
          value={asmPhone}
          onChange={(e) => setAsmPhone(e.target.value)}
          placeholder="e.g. +351 912 345 678"
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Language + Delivery Mode row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
          <select
            value={asmLanguage}
            onChange={(e) => setAsmLanguage(e.target.value as 'PORTUGUESE' | 'ENGLISH' | 'BOTH')}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
          >
            <option value="PORTUGUESE">Portuguese</option>
            <option value="ENGLISH">English</option>
            <option value="BOTH">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
          <select
            value={asmDeliveryMode}
            onChange={(e) => setAsmDeliveryMode(e.target.value as 'ONLINE' | 'IN_PERSON' | 'BOTH')}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
          >
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In-Person</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
      </div>

      {/* Current Level */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Current Self-Assessed Level</label>
        <select
          value={asmCurrentLevel}
          onChange={(e) => setAsmCurrentLevel(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
        >
          {LEVEL_OPTIONS.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {/* Learning Goals */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Learning Goals / Notes</label>
        <textarea
          rows={4}
          value={asmGoals}
          onChange={(e) => setAsmGoals(e.target.value)}
          placeholder="Describe learning goals, timeline, or any other notes..."
          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
        />
      </div>
    </>
  )

  return (
    <div className="space-y-6">

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        {[
          { key: 'ALL', label: 'All Inquiries' },
          { key: 'NEW', label: 'New Inquiries' },
          { key: 'CONTACTED', label: 'Contacted' },
          { key: 'SCHEDULED', label: 'Scheduled' },
          { key: 'COMPLETED', label: 'Completed' },
        ].map((tab) => {
          const isActive = filter === tab.key
          const count = assessments.filter(
            (a) => tab.key === 'ALL' || a.status === tab.key
          ).length

          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
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

      {/* ── Structured Assessment Cards Grid ── */}
      <div className="grid gap-5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-bold text-slate-800 text-sm">No assessment inquiries found</p>
            <p className="text-xs text-slate-400 mt-1">
              There are no submissions matching the selected filter criteria.
            </p>
          </div>
        ) : (
          filtered.map((a) => {
            const statusConfig = getStatusBadge(a.status)
            const cleanPhone = a.phone.replace(/[^0-9+]/g, '')
            const initials = getInitials(a.name)

            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200 p-5 sm:p-6 space-y-4"
              >
                {/* 1. Header: Candidate Identity & Stage Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    {/* Initials Avatar */}
                    <div className="h-11 w-11 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-900 font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                          {a.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">
                          · Received {formatSubmissionDate(a.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Free 15-Minute Level Assessment Inquiry
                      </p>
                    </div>
                  </div>

                  {/* Status & Language Track Pills + Edit button */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                      <span>{statusConfig.label}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        a.language === 'PORTUGUESE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                          : a.language === 'ENGLISH'
                          ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                          : 'bg-purple-50 text-purple-800 border-purple-200/80'
                      }`}
                    >
                      {a.language === 'PORTUGUESE' ? (
                        <>
                          <PortugalFlagIcon className="h-3 w-4" />
                          <span>Portuguese</span>
                        </>
                      ) : a.language === 'ENGLISH' ? (
                        <>
                          <UKFlagIcon className="h-3 w-4" />
                          <span>English</span>
                        </>
                      ) : (
                        <>
                          <DualFlagIcon className="h-3 w-6" />
                          <span>Dual Track</span>
                        </>
                      )}
                    </span>

                    {/* Edit Icon Button */}
                    <button
                      onClick={() => openEditModal(a)}
                      title="Edit assessment"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 2. Structured Key-Value Profile Grid (4 Clean Sub-Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  {/* Email */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${a.email}`}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1.5 truncate"
                      title={a.email}
                    >
                      <svg className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{a.email}</span>
                    </a>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phone / WhatsApp
                    </span>
                    <a
                      href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 hover:text-emerald-700 flex items-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{a.phone}</span>
                    </a>
                  </div>

                  {/* Assessed Level */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Self-Assessed Level
                    </span>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>{a.currentLevel}</span>
                    </div>
                  </div>

                  {/* Preferred Delivery */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Preferred Mode
                    </span>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {a.deliveryMode === 'ONLINE'
                          ? 'Online Video (Meet/Zoom)'
                          : a.deliveryMode === 'IN_PERSON'
                          ? 'In-Person (Lisbon)'
                          : 'Flexible / Hybrid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Objective & Candidate Note Block */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <svg className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Target Learning Goal &amp; Timeline</span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed pl-5">
                      {a.learningGoals}
                    </p>
                  </div>

                  {a.message && (
                    <div className="pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <svg className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Candidate Note / Inquiry Details</span>
                      </div>
                      <p className="text-xs text-slate-600 italic bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed ml-5">
                        &ldquo;{a.message}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Footer Action Bar (Quick Contact Links + Workflow Buttons) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  {/* Quick external contact actions */}
                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={`mailto:${a.email}?subject=WorkSpeak Portugal Assessment Scheduling`}
                      className="text-slate-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Draft Email</span>
                    </a>
                    <span className="text-slate-200">·</span>
                    <a
                      href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
                        `Olá ${a.name}, thank you for requesting an assessment with WorkSpeak Portugal! When would be a good time for your 15-minute level evaluation?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.761.78 2.79.78 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.767-5.766zm3.374 8.163c-.144.405-.837.774-1.17.823-.312.045-.694.074-2.128-.521-1.637-.678-2.684-2.355-2.766-2.464-.082-.109-.669-.89-.669-1.698 0-.807.423-1.205.574-1.368.151-.163.33-.204.44-.204.11 0 .22.001.316.006.103.005.241-.039.377.288.144.348.494 1.205.536 1.292.042.087.07.189.012.305-.058.116-.088.188-.174.29-.086.101-.182.227-.26.305-.088.087-.18.182-.077.359.103.176.458.756.983 1.224.676.602 1.246.788 1.423.875.176.088.279.073.383-.046.103-.118.441-.513.559-.689.117-.176.235-.147.396-.088.161.059 1.02.481 1.196.569.176.088.293.132.337.206.044.073.044.425-.1 1.83z" />
                      </svg>
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>

                  {/* Workflow Pipeline Action Buttons + Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {a.status === 'NEW' && (
                      <button
                        disabled={updatingId === a.id}
                        onClick={() => handleStatusChange(a.id, 'CONTACTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all disabled:opacity-50 shadow-2xs"
                      >
                        {updatingId === a.id ? 'Updating...' : 'Mark Contacted'}
                      </button>
                    )}

                    {a.status !== 'SCHEDULED' && a.status !== 'COMPLETED' && (
                      <button
                        disabled={updatingId === a.id}
                        onClick={() => handleStatusChange(a.id, 'SCHEDULED')}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition-all disabled:opacity-50 shadow-2xs"
                      >
                        Schedule Call
                      </button>
                    )}

                    {a.status !== 'COMPLETED' && (
                      <button
                        disabled={updatingId === a.id}
                        onClick={() => handleStatusChange(a.id, 'COMPLETED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all disabled:opacity-50 shadow-2xs"
                      >
                        Mark Completed
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(a)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200/80 transition-colors"
                    >
                      Delete Inquiry
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Edit Assessment Modal ── */}
      {showEditModal && activeAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Edit Assessment Inquiry</h2>
              <button
                onClick={() => { setShowEditModal(false); setActiveAssessment(null) }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <AssessmentFormFields />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setActiveAssessment(null) }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
