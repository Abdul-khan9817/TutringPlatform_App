import { getSession, getAuthenticatedUser } from '@/lib/auth'
import { getStudentDashboardFromDatabase } from '@/lib/dashboard-data'
import { DashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const session = await getSession()
  if (!session) return null
  const user = await getAuthenticatedUser(session)

  const dashboard = await getStudentDashboardFromDatabase(user.id)

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardClient
        userName={user.name}
        upcoming={dashboard.upcoming}
        active={dashboard.active}
        pendingHw={dashboard.pendingHw}
        lastPaymentAmount={dashboard.lastPaymentAmount}
        currentLevel={dashboard.currentLevel}
        homework={dashboard.homework}
        materials={dashboard.materials}
        attendance={dashboard.attendance}
        services={dashboard.services}
      />
    </div>
  )
}
