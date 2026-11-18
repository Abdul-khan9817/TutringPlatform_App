import { redirect } from 'next/navigation'
import { getSession, getAuthenticatedUser } from '@/lib/auth'
import { StudentShell } from '@/components/dashboard/student-shell'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'STUDENT') redirect('/management/dashboard')

  const user = await getAuthenticatedUser(session)

  return (
    <StudentShell user={user}>
      {children}
    </StudentShell>
  )
}
