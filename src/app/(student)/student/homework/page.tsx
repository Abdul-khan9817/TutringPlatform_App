import { getSession } from '@/lib/auth'
import { getStudentHomeworkFromDatabase } from '@/lib/dashboard-data'
import { HomeworkClient } from './homework-client'

export const dynamic = 'force-dynamic'

export default async function StudentHomeworkPage() {
  const session = await getSession()
  if (!session) return null

  const homework = await getStudentHomeworkFromDatabase(session.sub)

  return (
    <div className="max-w-4xl mx-auto">
      <HomeworkClient initialHomework={homework} />
    </div>
  )
}
