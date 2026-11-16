'use client'

import { useState } from 'react'
import type { LearningMaterialRecord, StudentRecord } from '@/lib/admin-data'
import { PortugalFlagIcon, UKFlagIcon, DualFlagIcon } from '@/components/ui/flags'

interface Props {
  initialMaterials: LearningMaterialRecord[]
  students: StudentRecord[]
}

const TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
  PDF: { label: 'PDF Document', badge: 'bg-red-50 text-red-800 border-red-200' },
  AUDIO: { label: 'Audio Recording', badge: 'bg-purple-50 text-purple-800 border-purple-200' },
  VIDEO: { label: 'Video Lesson', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
  WORKSHEET: { label: 'Worksheet', badge: 'bg-amber-50 text-amber-900 border-amber-200' },
  LINK: { label: 'Web Link', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
}

export function MaterialsClient({ initialMaterials, students }: Props) {
  const [materials, setMaterials] = useState<LearningMaterialRecord[]>(initialMaterials)
  const [langFilter, setLangFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterialRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<LearningMaterialRecord['type']>('PDF')
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState<'PORTUGUESE' | 'ENGLISH' | 'BOTH'>('PORTUGUESE')
  const [level, setLevel] = useState('A1-B1')
  const [assignedStudentId, setAssignedStudentId] = useState('ALL')

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
    const matchesLang = langFilter === 'ALL' || m.language === langFilter || m.language === 'BOTH'
    const matchesType = typeFilter === 'ALL' || m.type === typeFilter
    return matchesSearch && matchesLang && matchesType
  })

  const openCreateModal = () => {
    setEditingMaterial(null)
    setTitle('')
    setDescription('')
    setType('PDF')
    setUrl('')
    setLanguage('PORTUGUESE')
    setLevel('A1-B1')
    setAssignedStudentId('ALL')
    setShowModal(true)
  }

  const openEditModal = (m: LearningMaterialRecord) => {
    setEditingMaterial(m)
    setTitle(m.title)
    setDescription(m.description)
    setType(m.type)
    setUrl(m.url)
    setLanguage(m.language)
    setLevel(m.level)
    setAssignedStudentId(m.assignedStudentId || 'ALL')
    setShowModal(true)
  }

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !url) return
    setIsSubmitting(true)

    try {
      if (editingMaterial) {
        const res = await fetch('/api/v1/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE_MATERIAL',
            payload: {
              id: editingMaterial.id,
              data: { title, description, type, url, language, level, assignedStudentId },
            },
          }),
        })
        const json = await res.json()
        if (json.success && json.data) {
          setMaterials((prev) => prev.map((m) => (m.id === editingMaterial.id ? json.data : m)))
          setShowModal(false)
        }
      } else {
        const res = await fetch('/api/v1/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_MATERIAL',
            payload: { title, description, type, url, language, level, assignedStudentId },
          }),
        })
        const json = await res.json()
        if (json.success && json.data) {
          setMaterials([json.data, ...materials])
          setShowModal(false)
        }
      }
    } catch {
      alert('Failed to save learning material.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMaterial = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_MATERIAL', payload: { id } }),
      })
      const json = await res.json()
      if (json.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id))
      }
    } catch {
      alert('Failed to delete material.')
    }
  }

  const renderTypeIcon = (t: string) => {
    switch (t) {
      case 'PDF':
        return (
          <svg className="h-3.5 w-3.5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'AUDIO':
        return (
          <svg className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        )
      case 'VIDEO':
        return (
          <svg className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'WORKSHEET':
        return (
          <svg className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        )
      default:
        return (
          <svg className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
              Pedagogical Repository
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Materials Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curate, upload, and assign pedagogical resources to students and curriculum tracks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all duration-150 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Upload Material</span>
        </button>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search materials by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="ALL">All Languages</option>
            <option value="PORTUGUESE">Portuguese</option>
            <option value="ENGLISH">English</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="ALL">All Media Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="AUDIO">Audio Recordings</option>
            <option value="VIDEO">Video Lessons</option>
            <option value="WORKSHEET">Worksheets</option>
            <option value="LINK">Web Links</option>
          </select>
        </div>
      </div>

      {/* ── Materials Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-bold text-slate-800 text-sm">No learning materials found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting search filters or upload a new resource.</p>
          </div>
        ) : (
          filtered.map((m) => {
            const conf = TYPE_CONFIG[m.type] || TYPE_CONFIG.LINK
            const assignedStudent = students.find((s) => s.id === m.assignedStudentId)

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${conf.badge}`}>
                      {renderTypeIcon(m.type)}
                      <span>{conf.label}</span>
                    </span>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      Level: {m.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug hover:text-brand-800 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span>Track:</span>
                      {m.language === 'PORTUGUESE' ? (
                        <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <PortugalFlagIcon className="h-2.5 w-3.5" />
                          <span>Portuguese</span>
                        </span>
                      ) : m.language === 'ENGLISH' ? (
                        <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <UKFlagIcon className="h-2.5 w-3.5" />
                          <span>English</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <DualFlagIcon className="h-2.5 w-5" />
                          <span>Dual</span>
                        </span>
                      )}
                    </span>
                    <span>
                      Access:{' '}
                      <strong className="text-slate-700 font-bold">
                        {m.assignedStudentId === 'ALL' || !m.assignedStudentId
                          ? 'All Students'
                          : assignedStudent
                          ? assignedStudent.name.split(' ')[0]
                          : 'Assigned'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
                  >
                    <span>Open Resource</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(m)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(m.id, m.title)}
                      className="px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Upload / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingMaterial ? 'Edit Learning Resource' : 'Upload Learning Resource'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. European Portuguese Email Etiquette"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts, practice exercises, or instructions..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="AUDIO">Audio Recording</option>
                    <option value="VIDEO">Video Lesson</option>
                    <option value="WORKSHEET">Worksheet</option>
                    <option value="LINK">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Track</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="PORTUGUESE">Portuguese</option>
                    <option value="ENGLISH">English</option>
                    <option value="BOTH">Dual Track</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CEFR Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary (CIPLE)</option>
                    <option value="A1-B1">A1-B1 Core</option>
                    <option value="B1">B1 Intermediate</option>
                    <option value="B2">B2 Upper Intermediate</option>
                    <option value="C1-C2">C1-C2 Advanced / Mastery</option>
                    <option value="ALL">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Access</label>
                  <select
                    value={assignedStudentId}
                    onChange={(e) => setAssignedStudentId(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="ALL">All Enrolled Students</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.preferredLanguage})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">File or Drive URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingMaterial ? 'Save Changes' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
