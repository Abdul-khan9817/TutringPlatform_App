import { getSession } from '@/lib/auth'
import { getStudentHomework } from '@/lib/student-data'
import { HomeworkClient } from './homework-client'

export default async function StudentHomeworkPage() {
  const session = await getSession()
  if (!session) return null

  const homework = getStudentHomework()

  return (
    <div className="max-w-4xl mx-auto">
      <HomeworkClient initialHomework={homework} />
    </div>
  )
}
