import { getSession } from '@/lib/auth'
import { getStudentProfile } from '@/lib/student-data'
import { ProfileClient } from './profile-client'

export default async function StudentProfilePage() {
  const session = await getSession()
  if (!session) return null

  const profile = getStudentProfile()

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileClient initialProfile={profile} />
    </div>
  )
}
