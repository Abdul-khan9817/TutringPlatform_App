'use client'

import { useState } from 'react'

interface StudentProfileView {
  name: string
  email: string
  isActive: boolean
  phone: string
  preferredLanguage: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  currentLevel: string
  learningGoals: string
  timezone: string
  companyName: string
  enrolledAt: string
}

interface Props {
  initialProfile: StudentProfileView
}

const languageLabel: Record<StudentProfileView['preferredLanguage'], string> = {
  PORTUGUESE: 'Portuguese',
  ENGLISH: 'English',
  BOTH: 'Portuguese & English',
}

export function ProfileClient({ initialProfile }: Props) {
  const [profile, setProfile] = useState<StudentProfileView>(initialProfile)
  const [form, setForm] = useState<StudentProfileView>(initialProfile)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          payload: {
            phone: form.phone,
            companyName: form.companyName,
            learningGoals: form.learningGoals,
            timezone: form.timezone,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Unable to save your profile. Please try again.')
      setProfile((current) => ({ ...current, ...json.data }))
      setEditing(false)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 4000)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in font-sans">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-800">
            Account
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My profile</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Keep your contact information and learning goals up to date.</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setForm(profile)
              setError('')
              setEditing(true)
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:self-auto"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m13.8 3.2 3 3M4 16l3.3-.7L16 6.6a2.1 2.1 0 0 0-3-3l-8.7 8.7L4 16Z" />
            </svg>
            Edit profile
          </button>
        )}
      </header>

      {saved && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-xs">
          <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4 10 4 4 8-8" />
          </svg>
          Your profile details have been saved.
        </div>
      )}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <section aria-label="Student account overview" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-extrabold shadow-sm sm:h-20 sm:w-20 sm:text-2xl">
            {initials || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-extrabold sm:text-2xl">{profile.name}</h2>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${profile.isActive ? 'border-emerald-200/40 bg-emerald-400/15 text-emerald-100' : 'border-amber-200/40 bg-amber-400/15 text-amber-100'}`}>
                {profile.isActive ? 'Active account' : 'Account inactive'}
              </span>
            </div>
            <p className="mt-1 break-all text-sm text-white/75">{profile.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-white/85">
              <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1">{languageLabel[profile.preferredLanguage]}</span>
              {profile.currentLevel && <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1">CEFR {profile.currentLevel}</span>}
              <span className="text-white/70">Joined {new Intl.DateTimeFormat('en-PT', { month: 'short', year: 'numeric' }).format(new Date(profile.enrolledAt))}</span>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="space-y-5 p-5 sm:p-8">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Contact &amp; learning details</h3>
              <p className="mt-1 text-sm text-slate-500">Your name and sign-in email are managed with your account.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-semibold text-slate-700">Phone number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Add a contact number"
                />
              </div>

              <div>
                <label htmlFor="profile-company" className="mb-1.5 block text-xs font-semibold text-slate-700">Company or organization <span className="font-normal text-slate-400">(optional)</span></label>
                <input
                  id="profile-company"
                  type="text"
                  autoComplete="organization"
                  maxLength={100}
                  value={form.companyName}
                  onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Your organization"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="profile-goals" className="mb-1.5 block text-xs font-semibold text-slate-700">Learning goals</label>
                <textarea
                  id="profile-goals"
                  rows={4}
                  maxLength={500}
                  value={form.learningGoals}
                  onChange={(event) => setForm((current) => ({ ...current, learningGoals: event.target.value }))}
                  className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="What would you like to achieve with your language learning?"
                />
                <p className="mt-1 text-right text-[11px] text-slate-400">{form.learningGoals.length}/500</p>
              </div>

              <div>
                <label htmlFor="profile-timezone" className="mb-1.5 block text-xs font-semibold text-slate-700">Time zone</label>
                <select
                  id="profile-timezone"
                  value={form.timezone}
                  onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Europe/Lisbon">Lisbon (Europe/Lisbon)</option>
                  <option value="Europe/London">London (Europe/London)</option>
                  <option value="Europe/Paris">Central Europe (Europe/Paris)</option>
                  <option value="Asia/Kolkata">India (Asia/Kolkata)</option>
                  <option value="America/New_York">Eastern US (America/New_York)</option>
                  <option value="America/Los_Angeles">Pacific US (America/Los_Angeles)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => { setForm(profile); setEditing(false); setError('') }}
                disabled={saving}
                className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="min-h-10 rounded-xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-8">
            <div className="mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Your details</h3>
              <p className="mt-1 text-sm text-slate-500">The information your tutor uses to support your learning.</p>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Phone number</dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-slate-900">{profile.phone || 'Not added'}</dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Company or organization</dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-slate-900">{profile.companyName || 'Not added'}</dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Learning track</dt>
                <dd className="mt-1.5 text-sm font-semibold text-slate-900">{languageLabel[profile.preferredLanguage]}</dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Time zone</dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-slate-900">{profile.timezone}</dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:col-span-2">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Learning goals</dt>
                <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{profile.learningGoals || 'Add your goals to help your tutor tailor lessons to you.'}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}
