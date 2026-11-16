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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
            Admin Authority & Security
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Settings & Security Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage teacher credentials, academy operational parameters, website SEO & content, and inspect audit logs.
        </p>
      </div>

      <SettingsClient
        initialSettings={settings}
        initialProfile={profile}
        initialSeo={seo}
        initialAuditLogs={auditLogs}
      />
    </div>
  )
}
