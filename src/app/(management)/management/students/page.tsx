import { getSession } from '@/lib/auth'
import { getAdminStudents } from '@/lib/admin-data'
import { StudentsClient } from './students-client'

export default async function ManagementStudentsPage() {
  const session = await getSession()
  if (!session) return null

  const students = await getAdminStudents()
  const activeCount = students.filter((s) => s.status === 'ACTIVE').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
              Student Directory & Enrollment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enrolled Students
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage individual student accounts, assign CEFR language tracks, issue credentials, and track progress.
          </p>
        </div>
        <div className="text-xs font-bold text-brand-900 bg-brand-50 px-3.5 py-1.5 rounded-xl border border-brand-200 self-start sm:self-auto shadow-2xs">
          {activeCount} Active Learners · {students.length} Total
        </div>
      </div>

      <StudentsClient initialStudents={students} />
    </div>
  )
}
