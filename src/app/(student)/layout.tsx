import { redirect } from 'next/navigation'
import { getSession, getAuthenticatedUser } from '@/lib/auth'
import { StudentSidebar } from '@/components/dashboard/student-sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'TUTOR') redirect('/management/dashboard')

  const user = await getAuthenticatedUser(session)

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar user={user} />
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
