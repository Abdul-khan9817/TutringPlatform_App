import { getSession, getAuthenticatedUser } from '@/lib/auth'
import {
  getStudentDashboardData,
  getStudentProgress,
  getStudentHomework,
  getStudentMaterials,
} from '@/lib/student-data'
import { DashboardClient } from './dashboard-client'

export default async function StudentDashboardPage() {
  const session = await getSession()
  if (!session) return null
  const user = await getAuthenticatedUser(session)

  const { upcoming, active, pendingHw, lastPayment } = getStudentDashboardData()
  const progress = getStudentProgress()
  const homework = getStudentHomework()
  const materials = getStudentMaterials()
  const currentLevel = progress.find((p) => p.current)

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardClient
        userName={user.name}
        upcoming={upcoming}
        active={active}
        pendingHw={pendingHw}
        lastPaymentAmount={lastPayment?.amount ?? null}
        currentLevel={currentLevel}
        homework={homework}
        materials={materials}
      />
    </div>
  )
}
