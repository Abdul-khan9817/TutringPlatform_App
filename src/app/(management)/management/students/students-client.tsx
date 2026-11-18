'use client'

import { useState } from 'react'
import type { StudentRecord } from '@/lib/admin-data'
import { PortugalFlagIcon, UKFlagIcon, DualFlagIcon } from '@/components/ui/flags'
import { downloadProgressReportPdf } from '@/lib/pdf-generator'

export function StudentsClient({ initialStudents }: { initialStudents: StudentRecord[] }) {
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const unique = new Map<string, StudentRecord>()
    for (const student of initialStudents) {
      const key = student.email.trim().toLowerCase()
      if (!unique.has(key)) unique.set(key, student)
    }
    return [...unique.values()]
  })
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Active student for action modals
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null)
  const [modalType, setModalType] = useState<'COURSES' | 'INVITE' | 'RESET_PASS' | 'BALANCE' | 'EDIT' | null>(null)

  // Add Student Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'PORTUGUESE' | 'ENGLISH' | 'BOTH'>('PORTUGUESE')
  const [currentLevel, setCurrentLevel] = useState('A1 — Beginner')
  const [cefrLevel, setCefrLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1')
  const [initialBalance, setInitialBalance] = useState(10)
  const [initialPassword, setInitialPassword] = useState('')

  // Courses Modal Form State
  const [selectedCourses, setSelectedCourses] = useState<string>('')
  const [selectedCefr, setSelectedCefr] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1')

  // Balance Modal Form State
  const [balanceDelta, setBalanceDelta] = useState(5)
  const [balanceReason, setBalanceReason] = useState('Package top-up')

  // Reset Password Modal State
  const [credentialsMsg, setCredentialsMsg] = useState<{ inviteUrl?: string; tempPassword?: string } | null>(null)

  // Edit Student Modal State
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLang, setEditLang] = useState<'PORTUGUESE' | 'ENGLISH' | 'BOTH'>('PORTUGUESE')
  const [editCefr, setEditCefr] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1')
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'>('ACTIVE')

  // Reset Pass Modal State
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [resetResult, setResetResult] = useState<{ tempPassword: string; email: string; inviteUrl: string } | null>(null)

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchesLang = langFilter === 'ALL' || s.preferredLanguage === langFilter
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
    return matchesSearch && matchesLang && matchesStatus
  })

  const getInitials = (studentName: string) => {
    const parts = studentName.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return studentName.slice(0, 2).toUpperCase()
  }

  // 1. Enroll Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_STUDENT',
          payload: {
            name,
            email,
            phone: phone || '+351 900 000 000',
            preferredLanguage,
            currentLevel,
            cefrLevel,
            lessonBalance: initialBalance,
            status: 'ACTIVE',
            password: initialPassword || undefined,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        const emailKey = json.data.email.trim().toLowerCase()
        setStudents((current) => [json.data, ...current.filter((student) => student.email.trim().toLowerCase() !== emailKey)])
        setActiveStudent(json.data)
        setCredentialsMsg({
          tempPassword: json.data.tempPassword,
          inviteUrl: json.data.inviteUrl,
        })
        setShowAddModal(false)
        setModalType('INVITE')
        setName('')
        setEmail('')
        setPhone('')
        setInitialBalance(10)
        setInitialPassword('')
      } else {
        alert(json.error?.message || json.error || 'Failed to register student.')
      }
    } catch {
      alert('Failed to register student.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Open Reset Pass Modal (replaces old handleGenerateInvite for existing students)
  const handleOpenResetPass = (student: StudentRecord) => {
    setActiveStudent(student)
    setNewPasswordInput('')
    setResetResult(null)
    setModalType('RESET_PASS')
  }

  // 2b. Execute Reset Password
  const handleResetPassword = async () => {
    if (!activeStudent) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_STUDENT_PASSWORD',
          payload: {
            id: activeStudent.id,
            newPassword: newPasswordInput.trim() || undefined,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setResetResult({
          tempPassword: json.data.tempPassword,
          email: activeStudent.email,
          inviteUrl: json.data.inviteUrl || '/login',
        })
      } else {
        alert(json.error?.message || json.error || 'Failed to reset password.')
      }
    } catch {
      alert('Failed to reset student password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Assign Courses & CEFR
  const handleAssignCourses = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStudent) return
    setIsSubmitting(true)
    try {
      const coursesArray = selectedCourses
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean)

      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_COURSES',
          payload: {
            id: activeStudent.id,
            courses: coursesArray,
            cefrLevel: selectedCefr,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setStudents((prev) => prev.map((s) => (s.id === activeStudent.id ? json.data : s)))
        setModalType(null)
      }
    } catch {
      alert('Failed to assign curriculum.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Adjust Lesson Balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStudent) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADJUST_LESSON_BALANCE',
          payload: {
            id: activeStudent.id,
            delta: balanceDelta,
            reason: balanceReason,
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setStudents((prev) => prev.map((s) => (s.id === activeStudent.id ? json.data : s)))
        setModalType(null)
      }
    } catch {
      alert('Failed to adjust balance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 5. Toggle Status (Deactivate / Restore)
  const handleToggleStatus = async (student: StudentRecord) => {
    const newStatus = student.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE'
    const confirmMsg =
      newStatus === 'DEACTIVATED'
        ? `Deactivate ${student.name}? They will lose portal access until restored.`
        : `Restore ${student.name}'s account access?`
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newStatus === 'DEACTIVATED' ? 'DEACTIVATE_STUDENT' : 'RESTORE_STUDENT',
          payload: { id: student.id },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setStudents((prev) => prev.map((s) => (s.id === student.id ? json.data : s)))
      }
    } catch {
      alert('Failed to update student status.')
    }
  }

  // 6. Delete Student
  const handleDeleteStudent = async (student: StudentRecord) => {
    if (!confirm(`Permanently delete student ${student.name} (${student.email})? This action cannot be undone.`)) return
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_STUDENT', payload: { id: student.id } }),
      })
      const json = await res.json()
      if (json.success) {
        setStudents((prev) => prev.filter((s) => s.id !== student.id))
      }
    } catch {
      alert('Failed to delete student.')
    }
  }

  // 7. Update Student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStudent) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STUDENT',
          payload: {
            id: activeStudent.id,
            data: {
              name: editName,
              email: editEmail,
              phone: editPhone,
              preferredLanguage: editLang,
              cefrLevel: editCefr,
              currentLevel: `${editCefr} — Certified Track`,
              notes: editNotes,
              status: editStatus,
            },
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setStudents((prev) => prev.map((s) => (s.id === activeStudent.id ? json.data : s)))
        setModalType(null)
      } else {
        alert(json.error?.message || json.error || 'Failed to update student.')
      }
    } catch {
      alert('Failed to update student.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Student record filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              aria-label="Search students by name or email"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <select
            aria-label="Filter students by language track"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="ALL">All Curriculum Tracks</option>
            <option value="PORTUGUESE">Portuguese Track</option>
            <option value="ENGLISH">English Track</option>
            <option value="BOTH">Dual Track</option>
          </select>

          <select
            aria-label="Filter students by account status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Learners</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all duration-150 self-start lg:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add student</span>
        </button>
      </div>

      {/* Student records */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Student records</h2>
            <p className="mt-0.5 text-xs text-slate-500">Contact details, learning progress and account access</p>
          </div>
          <p className="text-xs font-semibold text-slate-500" aria-live="polite">Showing {filtered.length} of {students.length}</p>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Learning track</th>
                <th className="px-5 py-4">Lesson balance</th>
                <th className="px-5 py-4">Attendance</th>
                <th className="px-5 py-4">Account status</th>
                <th className="px-5 py-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-sm">
                      <p className="text-sm font-semibold text-slate-800">
                        {students.length === 0 ? 'No student records yet' : 'No students match these filters'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {students.length === 0
                          ? 'Add a student to start managing accounts and learning progress.'
                          : 'Try a different name, learning track or account status.'}
                      </p>
                      {students.length === 0 ? (
                        <button onClick={() => setShowAddModal(true)} className="mt-4 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                          Add first student
                        </button>
                      ) : (
                        <button onClick={() => { setSearch(''); setLangFilter('ALL'); setStatusFilter('ALL') }} className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {getInitials(s.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-sm truncate">{s.name}</div>
                          <div className="text-xs text-slate-500 truncate">{s.email}</div>
                          <div className="text-[11px] text-slate-400">{s.phone || 'Phone not provided'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Language & CEFR */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            s.preferredLanguage === 'PORTUGUESE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
                              : s.preferredLanguage === 'ENGLISH'
                              ? 'bg-blue-50 text-blue-800 border-blue-200/70'
                              : 'bg-purple-50 text-purple-800 border-purple-200/70'
                          }`}
                        >
                          {s.preferredLanguage === 'PORTUGUESE' ? (
                            <>
                              <PortugalFlagIcon className="h-2.5 w-3.5" />
                              <span>PT</span>
                            </>
                          ) : s.preferredLanguage === 'ENGLISH' ? (
                            <>
                              <UKFlagIcon className="h-2.5 w-3.5" />
                              <span>EN</span>
                            </>
                          ) : (
                            <>
                              <DualFlagIcon className="h-2.5 w-5" />
                              <span>DUAL</span>
                            </>
                          )}
                        </span>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                          CEFR {s.cefrLevel || 'A1'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1 truncate max-w-[200px]">
                        {s.assignedCourses?.[0] || s.currentLevel}
                      </div>
                    </td>

                    {/* Lesson Credits */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{s.lessonBalance}</span>
                          <span className="text-xs text-slate-400 ml-1">remaining</span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStudent(s)
                            setBalanceDelta(5)
                            setBalanceReason('Package top-up')
                            setModalType('BALANCE')
                          }}
                          title="Adjust lesson balance"
                          aria-label={`Adjust lesson balance for ${s.name}`}
                          className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors"
                        >
                          <span className="sr-only">Adjust lesson balance</span>
                          <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" d="M10 4v12M4 10h12" /></svg>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {s.lessonsCompleted} completed
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="px-5 py-4 text-xs font-semibold">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md" title="Lessons attended">
                          Attended {s.attendance?.attended ?? s.lessonsCompleted}
                        </span>
                        {(s.attendance?.absent ?? 0) > 0 && (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md" title="Absent">
                            Absent {s.attendance.absent}
                          </span>
                        )}
                        {(s.attendance?.late ?? 0) > 0 && (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md" title="Late">
                            Late {s.attendance.late}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                            : 'bg-red-50 text-red-800 border-red-200/80'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span>{s.status === 'ACTIVE' ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>

                    {/* Student management actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveStudent(s)
                            setEditName(s.name)
                            setEditEmail(s.email)
                            setEditPhone(s.phone || '')
                            setEditLang(s.preferredLanguage || 'PORTUGUESE')
                            setEditCefr(s.cefrLevel || 'A1')
                            setEditNotes((s as any).notes || '')
                            setEditStatus(s.status || 'ACTIVE')
                            setModalType('EDIT')
                          }}
                          aria-label={`Edit ${s.name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="m13.8 3.2 3 3M4 16l3.3-.7L16 6.6a2.1 2.1 0 0 0-3-3l-8.7 8.7L4 16Z" /></svg>
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setActiveStudent(s)
                            setSelectedCourses(s.assignedCourses?.join('\n') || '')
                            setSelectedCefr(s.cefrLevel || 'A1')
                            setModalType('COURSES')
                          }}
                          aria-label={`Manage curriculum for ${s.name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-2 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3.5h8l3 3V16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1ZM13 3.5v3h3M7 10h6M7 13h6" /></svg>
                          Curriculum
                        </button>

                        <button
                          onClick={() => handleOpenResetPass(s)}
                          aria-label={`Manage account access for ${s.name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}><rect x={4.5} y={8.5} width={11} height={8} rx={1.5} /><path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5V6a3 3 0 0 1 6 0v2.5M10 11.5v2" /></svg>
                          Access
                        </button>

                        <details className="relative">
                          <summary aria-label={`More actions for ${s.name}`} className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
                            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><circle cx={4} cy={10} r={1.5} /><circle cx={10} cy={10} r={1.5} /><circle cx={16} cy={10} r={1.5} /></svg>
                          </summary>
                          <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                            <button onClick={() => downloadProgressReportPdf(s)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">Download progress report</button>
                            <button onClick={() => handleToggleStatus(s)} className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 ${s.status === 'ACTIVE' ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {s.status === 'ACTIVE' ? 'Deactivate account' : 'Restore account'}
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button onClick={() => handleDeleteStudent(s)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">Delete student</button>
                          </div>
                        </details>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll student modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">Enroll New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                <span aria-hidden="true">×</span><span className="sr-only">Close</span>
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gonçalo Ramos"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="goncalo@example.pt"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Temporary Login Password <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={initialPassword}
                  minLength={8}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  placeholder="Leave blank to generate securely"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Use at least 8 characters with uppercase, lowercase, and a number.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Language Track</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="PORTUGUESE">Portuguese</option>
                    <option value="ENGLISH">English</option>
                    <option value="BOTH">Dual Track</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CEFR Level</label>
                  <select
                    value={cefrLevel}
                    onChange={(e) => {
                      const lvl = e.target.value as any
                      setCefrLevel(lvl)
                      setCurrentLevel(`${lvl} — Certified Track`)
                    }}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary (CIPLE)</option>
                    <option value="B1">B1 Intermediate (DIPLE)</option>
                    <option value="B2">B2 Upper Intermediate</option>
                    <option value="C1">C1 Advanced Business</option>
                    <option value="C2">C2 Mastery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Lesson Credits</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Manage Courses & CEFR ── */}
      {modalType === 'COURSES' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Curriculum &amp; CEFR for {activeStudent.name}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignCourses} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CEFR Language Level (A1–C2)</label>
                <select
                  value={selectedCefr}
                  onChange={(e) => setSelectedCefr(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="A1">A1 — Absolute Beginner (Breakthrough)</option>
                  <option value="A2">A2 — Elementary (CIPLE Portugal Residency)</option>
                  <option value="B1">B1 — Intermediate (DIPLE Autonomy)</option>
                  <option value="B2">B2 — Upper Intermediate (Workplace Fluency)</option>
                  <option value="C1">C1 — Advanced Professional (DEPLE)</option>
                  <option value="C2">C2 — Mastery &amp; Native Equivalence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Courses (one per line)
                </label>
                <textarea
                  rows={4}
                  value={selectedCourses}
                  onChange={(e) => setSelectedCourses(e.target.value)}
                  placeholder={'European Portuguese Intensive A2\nWorkplace Daily Communication'}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-brand-500 focus:border-brand-500 resize-none font-mono text-xs"
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Update Curriculum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Invite & Temporary Credentials ── */}
      {modalType === 'INVITE' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Credentials for {activeStudent.name}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Student Email</span>
                  <span className="font-bold text-slate-900">{activeStudent.email}</span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Temporary Password</span>
                  <span className="font-mono font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {credentialsMsg?.tempPassword || activeStudent.tempPassword || 'WorkSpeak@2026!'}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Direct Activation Link</span>
                  <input
                    type="text"
                    readOnly
                    value={credentialsMsg?.inviteUrl || activeStudent.inviteUrl || 'http://localhost:3000/login'}
                    className="w-full text-xs font-mono bg-white p-2 rounded border border-slate-300 select-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const text = `WorkSpeak Portugal Student Login:\nEmail: ${activeStudent.email}\nTemporary Password: ${credentialsMsg?.tempPassword || activeStudent.tempPassword}\nPortal Link: ${credentialsMsg?.inviteUrl || 'http://localhost:3000/login'}`
                    navigator.clipboard.writeText(text)
                    alert('Credentials copied to clipboard!')
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors"
                >
                  Copy Credentials
                </button>

                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Adjust Lesson Balance ── */}
      {modalType === 'BALANCE' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Adjust Lesson Credits
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Current balance for <strong>{activeStudent.name}</strong>: <strong>{activeStudent.lessonBalance} lessons</strong>
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credit Adjustment (+ or -)</label>
                <input
                  type="number"
                  required
                  value={balanceDelta}
                  onChange={(e) => setBalanceDelta(Number(e.target.value))}
                  placeholder="e.g. 10 or -1"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-bold focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="e.g. 10-pack purchased via bank transfer"
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {isSubmitting ? 'Updating...' : 'Save Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Student Profile ── */}
      {modalType === 'EDIT' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">Edit Student Profile</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Gonçalo Ramos"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="student@example.pt"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Language Track</label>
                  <select
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="PORTUGUESE">Portuguese</option>
                    <option value="ENGLISH">English</option>
                    <option value="BOTH">Dual Track</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CEFR Level</label>
                  <select
                    value={editCefr}
                    onChange={(e) => setEditCefr(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary</option>
                    <option value="B1">B1 Intermediate</option>
                    <option value="B2">B2 Upper Intermediate</option>
                    <option value="C1">C1 Advanced</option>
                    <option value="C2">C2 Mastery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal notes about this student..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Issue / Reset Student Credentials ── */}
      {modalType === 'RESET_PASS' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Issue / Reset Student Credentials
              </h3>
              <button
                onClick={() => {
                  setModalType(null)
                  setResetResult(null)
                  setNewPasswordInput('')
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {resetResult ? (
              /* ── Credentials Card ── */
              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Student Email</span>
                    <span className="font-bold text-slate-900">{resetResult.email}</span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Temporary Password</span>
                    <span className="font-mono font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {resetResult.tempPassword}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Login URL</span>
                    <span className="font-mono text-xs text-slate-700">
                      {resetResult.inviteUrl || 'http://localhost:3000/login'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const loginUrl = resetResult.inviteUrl || 'http://localhost:3000/login'
                      const text = `WorkSpeak Portugal – Student Portal Login\n\nEmail: ${resetResult.email}\nTemporary Password: ${resetResult.tempPassword}\nLogin URL: ${loginUrl}\n\nPlease log in and change your password on first sign-in.`
                      navigator.clipboard.writeText(text)
                      alert('Credentials copied to clipboard!')
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors"
                  >
                    Copy for WhatsApp / Email
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalType(null)
                      setResetResult(null)
                      setNewPasswordInput('')
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* ── Password Input Form ── */
              <div className="space-y-3.5">
                <p className="text-xs text-slate-500">
                  Resetting credentials for <strong>{activeStudent.name}</strong> ({activeStudent.email}).
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Leave blank to auto-generate secure password"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType(null)
                      setNewPasswordInput('')
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleResetPassword}
                    className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                  >
                    {isSubmitting ? 'Generating...' : 'Generate & Issue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
