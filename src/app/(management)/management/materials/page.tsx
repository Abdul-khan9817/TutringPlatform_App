import { getSession } from '@/lib/auth'
import { getAdminMaterials, getAdminStudents } from '@/lib/admin-data'
import { MaterialsClient } from './materials-client'

export const metadata = {
  title: 'Learning Materials · Admin Operations · WorkSpeak Portugal',
}

export default async function ManagementMaterialsPage() {
  const session = await getSession()
  if (!session) return null

  const [materials, students] = await Promise.all([getAdminMaterials(), getAdminStudents()])

  return <MaterialsClient initialMaterials={materials} students={students} />
}
