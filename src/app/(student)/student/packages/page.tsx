import { getSession } from '@/lib/auth'
import { getStudentPackages } from '@/lib/student-data'
import { PackagesClient } from './packages-client'

export default async function StudentPackagesPage() {
  const session = await getSession()
  if (!session) return null

  const { purchased, available } = getStudentPackages()

  return (
    <div className="max-w-4xl mx-auto">
      <PackagesClient purchased={purchased} available={available} />
    </div>
  )
}
