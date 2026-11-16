'use client'

import { useState } from 'react'
import type { StudentProfile } from '@/lib/student-data'

interface Props {
  initialProfile: StudentProfile
}

export function ProfileClient({ initialProfile }: Props) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<StudentProfile>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_PROFILE', payload: form }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProfile(json.data)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (e: any) {
      alert(e.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Your personal and learning information</p>
        </div>
        {!editing && (
          <button
            onClick={() => { setForm(profile); setEditing(true) }}
            className="text-sm font-semibold text-brand-700 hover:text-brand-900 hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-green-800 text-sm font-medium">
          ✓ Profile updated successfully.
        </div>
      )}

      {/* Avatar + name */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
          {profile.name.charAt(0)}
        </div>
        <div>
          <p className="text-xl font-extrabold text-slate-900">{profile.name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <span className="mt-1 inline-block text-xs font-semibold bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full">
            Level {profile.currentLevel}
          </span>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">Edit Profile</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {([
              ['Full Name', 'name'],
              ['Phone', 'phone'],
              ['Nationality', 'nationality'],
              ['Current Level', 'currentLevel'],
              ['Learning Goal', 'learningGoal'],
              ['Preferred Schedule', 'preferredSchedule'],
            ] as [string, keyof StudentProfile][]).map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={form[key] as string}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-brand-900 text-white text-sm font-semibold hover:bg-brand-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5">Details</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Phone" value={profile.phone} />
            <Field label="Nationality" value={profile.nationality} />
            <Field label="Current Level" value={profile.currentLevel} />
            <Field label="Learning Goal" value={profile.learningGoal} />
            <Field label="Preferred Schedule" value={profile.preferredSchedule} />
            <Field label="Enrolled" value={new Date(profile.enrolledAt).toLocaleDateString('en-PT', { day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>
        </div>
      )}
    </div>
  )
}
