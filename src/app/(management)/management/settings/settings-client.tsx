'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AcademySettings, AdminProfile, SeoSettings, AuditLogRecord } from '@/lib/admin-data'

interface SettingsClientProps {
  initialSettings: AcademySettings
  initialProfile: AdminProfile
  initialSeo: SeoSettings
  initialAuditLogs: AuditLogRecord[]
}

export function SettingsClient({
  initialSettings,
  initialProfile,
  initialSeo,
  initialAuditLogs,
}: SettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ACADEMY' | 'SEO' | 'AUDIT'>('PROFILE')

  // Profile Form State
  const [profile, setProfile] = useState<AdminProfile>(initialProfile)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  // Academy Settings Form State
  const [settings, setSettings] = useState<AcademySettings>(initialSettings)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('')

  // SEO & Content Settings Form State
  const [seo, setSeo] = useState<SeoSettings>(initialSeo)
  const [isSavingSeo, setIsSavingSeo] = useState(false)
  const [seoSuccessMsg, setSeoSuccessMsg] = useState('')

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(initialAuditLogs)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileErrorMsg('Image size should be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }))
        setProfileErrorMsg('')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 1. Save Admin Profile & Password
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrorMsg('')
    setProfileSuccessMsg('')

    if (newPassword && newPassword.length < 8) {
      setProfileErrorMsg('New password must be at least 8 characters.')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setProfileErrorMsg('New password and confirm password do not match.')
      return
    }

    setIsSavingProfile(true)
    try {
      const payload: Partial<AdminProfile> = {
        name: profile.name,
        email: profile.email,
        title: profile.title,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      }

      if (newPassword) {
        payload.password = newPassword
      }

      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ADMIN_PROFILE',
          payload,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setProfile(json.data)
        setNewPassword('')
        setConfirmPassword('')
        setProfileSuccessMsg('Admin credentials and profile successfully updated!')
        router.refresh()
      } else {
        setProfileErrorMsg(json.error || 'Failed to update admin profile.')
      }
    } catch {
      setProfileErrorMsg('Network error while saving profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // 2. Save Academy Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setSettingsSuccessMsg('')

    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          payload: settings,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setSettings(json.data)
        setSettingsSuccessMsg('Academy configuration saved!')
        router.refresh()
      }
    } catch {
      alert('Failed to update academy settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // 3. Save SEO Settings
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSeo(true)
    setSeoSuccessMsg('')

    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SEO_SETTINGS',
          payload: seo,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setSeo(json.data)
        setSeoSuccessMsg('Website content and SEO settings updated!')
        router.refresh()
      }
    } catch {
      alert('Failed to update SEO settings.')
    } finally {
      setIsSavingSeo(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === 'PROFILE'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Lead Teacher Profile & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('ACADEMY')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === 'ACADEMY'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Academy Operations</span>
        </button>

        <button
          onClick={() => setActiveTab('SEO')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === 'SEO'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>Website Content & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-150 whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'border-brand-700 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Audit Logs & Security</span>
        </button>
      </div>

      {/* ── Tab 1: Profile & Credentials ── */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span className="text-base">✓</span>
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span className="text-base">✕</span>
              <span>{profileErrorMsg}</span>
            </div>
          )}

          {/* Profile Photo Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900">Administrator Avatar & Photo</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This photo is displayed in the top navbar, lesson confirmations, and student dashboards.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 mt-5">
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 text-white font-extrabold text-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-700/50 overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <span>
                    {profile.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Upload New Photo
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
                <span className="text-[11px] text-slate-400">PNG, JPG or WebP. Max 2MB.</span>
              </div>
            </div>
          </div>

          {/* Admin Identity & Authority Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Platform Owner Authority</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Single authorized administrator account for WorkSpeak Portugal.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-900 border border-brand-200">
                1 OF 1 ADMIN ACCOUNT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher / Academic Title</label>
                <input
                  type="text"
                  required
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email Address</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Update Administrator Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leave blank if you do not wish to change your sign-in password.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Secure Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-700 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all duration-150 disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving Changes...' : 'Save Profile & Credentials'}
            </button>
          </div>
        </form>
      )}

      {/* ── Tab 2: Academy Operations ── */}
      {activeTab === 'ACADEMY' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {settingsSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span className="text-base">✓</span>
              <span>{settingsSuccessMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Operations & Tuition Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academy Brand Name</label>
                <input
                  type="text"
                  required
                  value={settings.academyName}
                  onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Hourly Rate (€ / 60m)</label>
                <input
                  type="number"
                  required
                  value={settings.standardHourlyRate}
                  onChange={(e) => setSettings({ ...settings, standardHourlyRate: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operational Timezone</label>
                <input
                  type="text"
                  required
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Online Video Platform</label>
                <input
                  type="text"
                  required
                  value={settings.onlineMeetingPlatform}
                  onChange={(e) => setSettings({ ...settings, onlineMeetingPlatform: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all duration-150 disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Academy Settings'}
            </button>
          </div>
        </form>
      )}

      {/* ── Tab 3: Website Content & SEO ── */}
      {activeTab === 'SEO' && (
        <form onSubmit={handleSaveSeo} className="space-y-6">
          {seoSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <span className="text-base">✓</span>
              <span>{seoSuccessMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Website Header Announcement Banner</h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bannerActive"
                checked={seo.bannerActive}
                onChange={(e) => setSeo({ ...seo, bannerActive: e.target.checked })}
                className="h-4 w-4 text-brand-900 rounded border-slate-300"
              />
              <label htmlFor="bannerActive" className="text-xs font-bold text-slate-800">
                Display top banner across all public pages
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Announcement Text</label>
              <input
                type="text"
                value={seo.announcementBanner}
                onChange={(e) => setSeo({ ...seo, announcementBanner: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Search Engine Optimization (SEO)</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Global Site Meta Title</label>
              <input
                type="text"
                value={seo.siteTitle}
                onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Global Meta Description</label>
              <textarea
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-700 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Keywords</label>
              <input
                type="text"
                value={seo.targetKeywords}
                onChange={(e) => setSeo({ ...seo, targetKeywords: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSeo}
              className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all duration-150 disabled:opacity-50"
            >
              {isSavingSeo ? 'Saving...' : 'Save SEO & Content Settings'}
            </button>
          </div>
        </form>
      )}

      {/* ── Tab 4: Audit Logs & Security ── */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Administrative Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time security log capturing every administrative mutation, credential change, and student interaction.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              AUDIT ACTIVE
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Admin Email</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Entity</th>
                    <th className="px-5 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3 text-slate-500 font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-PT')}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          {log.adminEmail}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-brand-800 whitespace-nowrap">
                          {log.entityType} ({log.entityId})
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
