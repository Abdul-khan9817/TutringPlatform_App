import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { getManagementDashboardData } from '@/lib/dashboard-data'
import { DashboardClient } from './dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard | WorkSpeak Portugal Admin',
  description: 'WorkSpeak Portugal administrative dashboard',
}

export default async function ManagementDashboardPage() {
  const session = await getSession()
  if (!session) return null

  const { stats, initialBookings, initialAssessments } = await getManagementDashboardData()

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardClient
        stats={stats}
        initialBookings={initialBookings}
        initialAssessments={initialAssessments}
      />
    </div>
  )
}
