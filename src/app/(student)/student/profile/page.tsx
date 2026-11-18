import { redirect } from 'next/navigation'
import { getAuthenticatedUser, getSession } from '@/lib/auth'
import { ProfileClient } from './profile-client'

export default async function StudentProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'STUDENT') redirect('/management/dashboard')

  const user = await getAuthenticatedUser(session)
  const profile = {
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    phone: user.studentProfile?.phone ?? '',
    preferredLanguage: user.studentProfile?.preferredLanguage ?? 'PORTUGUESE',
    currentLevel: user.studentProfile?.currentLevel ?? '',
    learningGoals: user.studentProfile?.learningGoals ?? '',
    timezone: user.studentProfile?.timezone ?? 'Europe/Lisbon',
    companyName: user.studentProfile?.companyName ?? '',
    enrolledAt: user.createdAt.toISOString(),
  }

  return <ProfileClient initialProfile={profile} />
}
