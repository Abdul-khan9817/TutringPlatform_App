import { getSession } from '@/lib/auth'
import { getAdminBookings } from '@/lib/admin-data'
import { BookingsClient } from './bookings-client'

export default async function ManagementBookingsPage() {
  const session = await getSession()
  if (!session) return null

  const bookings = await getAdminBookings()
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
              Class Scheduling & Attendance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lesson Bookings & Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule 1-on-1 language lessons, manage online meeting links, log lesson notes, and record student attendance.
          </p>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shadow-2xs">
          {confirmedCount} Confirmed {confirmedCount === 1 ? 'Lesson' : 'Lessons'}
        </div>
      </div>

      <BookingsClient initialBookings={bookings} />
    </div>
  )
}
