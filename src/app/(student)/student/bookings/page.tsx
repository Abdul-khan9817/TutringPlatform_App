import { getSession } from '@/lib/auth'
import { getStudentBookingsFromDatabase, getStudentServicesFromDatabase } from '@/lib/dashboard-data'
import { BookingsClient } from './bookings-client'

export const dynamic = 'force-dynamic'

export default async function StudentBookingsPage() {
  const session = await getSession()
  if (!session) return null

  const [bookings, services] = await Promise.all([
    getStudentBookingsFromDatabase(session.sub),
    getStudentServicesFromDatabase(),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BookingsClient initialBookings={bookings} services={services} />
    </div>
  )
}
