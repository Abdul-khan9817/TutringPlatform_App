import { getSession } from '@/lib/auth'
import {
  getAdminSettings,
  getAdminProfile,
  getSeoSettings,
  getAuditLogs,
} from '@/lib/admin-data'
import { SettingsClient } from './settings-client'

export const metadata = {
  title: 'Settings & Security · Admin Operations · WorkSpeak Portugal',
}

export default async function ManagementSettingsPage() {
  const session = await getSession()
  if (!session) return null

  const [settings, profile, seo, auditLogs] = await Promise.all([
    getAdminSettings(),
    getAdminProfile(),
    getSeoSettings(),
    getAuditLogs(),
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your account, academy operations, website details, and admin activity.
        </p>
      </header>

      <SettingsClient
        initialSettings={settings}
        initialProfile={profile}
        initialSeo={seo}
        initialAuditLogs={auditLogs}
      />
    </div>
  )
}
