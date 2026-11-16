import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { getAdminOverviewData, getAdminBookings, getAdminAssessments } from '@/lib/admin-data'
import { DashboardClient } from './dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard | WorkSpeak Portugal Admin',
  description: 'WorkSpeak Portugal administrative dashboard',
}

export default async function ManagementDashboardPage() {
  const session = await getSession()
  if (!session) return null

  const [stats, bookings, assessments] = await Promise.all([
    getAdminOverviewData(),
    getAdminBookings(),
    getAdminAssessments(),
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardClient
        stats={stats}
        initialBookings={bookings}
        initialAssessments={assessments}
      />
    </div>
  )
}
