import { getSession } from '@/lib/auth'
import { getStudentPackagesFromDatabase } from '@/lib/dashboard-data'
import { PackagesClient } from './packages-client'

export const dynamic = 'force-dynamic'

export default async function StudentPackagesPage() {
  const session = await getSession()
  if (!session) return null

  const { purchased, available } = await getStudentPackagesFromDatabase(session.sub)

  return (
    <div className="max-w-4xl mx-auto">
      <PackagesClient purchased={purchased} available={available} />
    </div>
  )
}
