import { getSession } from '@/lib/auth'
import { getStudentBookings } from '@/lib/student-data'
import { BookingsClient } from './bookings-client'

export default async function StudentBookingsPage() {
  const session = await getSession()
  if (!session) return null

  const bookings = getStudentBookings()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BookingsClient initialBookings={bookings} />
    </div>
  )
}
