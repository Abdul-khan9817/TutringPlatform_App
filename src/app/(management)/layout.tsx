import { redirect } from 'next/navigation'
import { getSession, getAuthenticatedUser } from '@/lib/auth'
import { ManagementShell } from '@/components/dashboard/management-shell'

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'STUDENT') redirect('/student/dashboard')

  const user = await getAuthenticatedUser(session)

  return <ManagementShell user={user}>{children}</ManagementShell>
}
