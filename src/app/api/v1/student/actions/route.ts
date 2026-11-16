import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import {
  createStudentBooking,
  cancelStudentBooking,
  submitHomework,
  updateStudentProfile,
} from '@/lib/student-data'

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['STUDENT', 'ADMIN'], req)
    const body = await req.json()
    const { action, payload } = body

    // ── Student Bookings ──
    if (action === 'CREATE_BOOKING') {
      const booking = createStudentBooking(payload)
      return NextResponse.json({ success: true, data: booking })
    }

    if (action === 'CANCEL_BOOKING') {
      const booking = cancelStudentBooking(payload.id)
      if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: booking })
    }

    // ── Homework Submission ──
    if (action === 'SUBMIT_HOMEWORK') {
      const hw = submitHomework(payload.id)
      if (!hw) return NextResponse.json({ success: false, error: 'Homework not found or already submitted' }, { status: 404 })
      return NextResponse.json({ success: true, data: hw })
    }

    // ── Profile Updates (Strictly Permitted Fields Only - Zero Role Escalation) ──
    if (action === 'UPDATE_PROFILE') {
      const allowedData = {
        phone: typeof payload?.phone === 'string' ? payload.phone.slice(0, 30) : undefined,
        nationality: typeof payload?.nationality === 'string' ? payload.nationality.slice(0, 50) : undefined,
        learningGoal: typeof payload?.learningGoal === 'string' ? payload.learningGoal.slice(0, 200) : undefined,
        preferredSchedule: typeof payload?.preferredSchedule === 'string' ? payload.preferredSchedule.slice(0, 100) : undefined,
      }
      const profile = updateStudentProfile(allowedData)
      return NextResponse.json({ success: true, data: profile })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? 'Server error' },
      { status: err.statusCode ?? 500 }
    )
  }
}
