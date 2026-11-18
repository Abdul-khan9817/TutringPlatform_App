import { getSession } from '@/lib/auth'
import { getAdminStudents } from '@/lib/admin-data'
import { StudentsClient } from './students-client'

export default async function ManagementStudentsPage() {
  const session = await getSession()
  if (!session) return null

  const students = await getAdminStudents()
  const activeCount = students.filter((s) => s.status === 'ACTIVE').length
  const inactiveCount = students.length - activeCount
  const portugueseCount = students.filter((s) => s.preferredLanguage === 'PORTUGUESE').length

  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-fade-in">
      <header className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
            Learner management
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Students</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Review learner accounts, manage language tracks and lesson credits, and keep each student?s learning record up to date.
          </p>
        </div>
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
          <span className="text-brand-800">{students.length}</span> learner{students.length === 1 ? '' : 's'} in the directory
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Student directory summary">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-brand-300 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total learners</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{students.length}</p>
          <p className="mt-1 text-sm text-slate-500">Student accounts in the directory</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active accounts</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-700">{activeCount}</p>
          <p className="mt-1 text-sm text-slate-500">Students with portal access</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Inactive accounts</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-amber-700">{inactiveCount}</p>
          <p className="mt-1 text-sm text-slate-500">{portugueseCount} on the Portuguese track</p>
        </div>
      </section>

      <StudentsClient initialStudents={students} />
    </div>
  )
}
