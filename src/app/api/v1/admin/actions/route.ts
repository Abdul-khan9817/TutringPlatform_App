import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import {
  updateAdminBookingStatus,
  updateAdminAssessmentStatus,
  addAdminStudent,
  updateAdminStudent,
  deactivateAdminStudent,
  restoreAdminStudent,
  deleteAdminStudent,
  generateStudentInvite,
  resetStudentPassword,
  assignStudentCourses,
  adjustStudentLessonBalance,
  createAdminBooking,
  updateAdminBooking,
  updateMeetingLink,
  recordAttendance,
  deleteAdminBooking,
  getAdminMaterials,
  addAdminMaterial,
  updateAdminMaterial,
  deleteAdminMaterial,
  getAdminHomework,
  createAdminHomework,
  gradeAdminHomework,
  deleteAdminHomework,
  updateAdminSettings,
  getSeoSettings,
  updateSeoSettings,
  getAdminProfile,
  updateAdminProfile,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  clearAdminNotifications,
  getAuditLogs,
} from '@/lib/admin-data'

export async function POST(req: NextRequest) {
  try {
    // Strictly require single ADMIN role for all actions on this route
    await requireRole(['ADMIN'], req)
    const body = await req.json()
    const { action, payload } = body

    // ── Student Account Management ──
    if (action === 'ADD_STUDENT') {
      const created = await addAdminStudent(payload)
      return NextResponse.json({ success: true, data: created })
    }

    if (action === 'UPDATE_STUDENT') {
      const updated = await updateAdminStudent(payload.id, payload.data)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'DEACTIVATE_STUDENT') {
      const deactivated = await deactivateAdminStudent(payload.id)
      return NextResponse.json({ success: true, data: deactivated })
    }

    if (action === 'RESTORE_STUDENT') {
      const restored = await restoreAdminStudent(payload.id)
      return NextResponse.json({ success: true, data: restored })
    }

    if (action === 'DELETE_STUDENT') {
      const deleted = await deleteAdminStudent(payload.id)
      return NextResponse.json({ success: true, data: deleted })
    }

    if (action === 'GENERATE_STUDENT_INVITE') {
      const invite = await generateStudentInvite(payload.id)
      return NextResponse.json({ success: true, data: invite })
    }

    if (action === 'RESET_STUDENT_PASSWORD') {
      const reset = await resetStudentPassword(payload.id, payload.newPassword)
      return NextResponse.json({ success: true, data: reset })
    }

    if (action === 'ASSIGN_COURSES') {
      const updated = await assignStudentCourses(payload.id, payload.courses, payload.cefrLevel)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'ADJUST_LESSON_BALANCE') {
      const updated = await adjustStudentLessonBalance(payload.id, payload.delta, payload.reason)
      return NextResponse.json({ success: true, data: updated })
    }

    // ── Bookings & Classes Management ──
    if (action === 'CREATE_BOOKING') {
      const created = await createAdminBooking(payload)
      return NextResponse.json({ success: true, data: created })
    }

    if (action === 'UPDATE_BOOKING') {
      const updated = await updateAdminBooking(payload.id, payload.data)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'UPDATE_BOOKING_STATUS') {
      const updated = await updateAdminBookingStatus(payload.id, payload.status)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'UPDATE_MEETING_LINK') {
      const updated = await updateMeetingLink(payload.id, payload.meetingLink)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'RECORD_ATTENDANCE') {
      const updated = await recordAttendance(
        payload.id,
        payload.attendanceStatus,
        payload.lessonNotes,
        payload.tutorFeedback
      )
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'DELETE_BOOKING') {
      const deleted = await deleteAdminBooking(payload.id)
      return NextResponse.json({ success: true, data: deleted })
    }

    // ── Assessments Management ──
    if (action === 'UPDATE_ASSESSMENT_STATUS') {
      const updated = await updateAdminAssessmentStatus(
        payload.id,
        payload.status,
        payload.recommendedLevel,
        payload.evaluationNotes
      )
      return NextResponse.json({ success: true, data: updated })
    }

    // ── Learning Materials Management ──
    if (action === 'GET_MATERIALS') {
      const materials = await getAdminMaterials()
      return NextResponse.json({ success: true, data: materials })
    }

    if (action === 'ADD_MATERIAL') {
      const created = await addAdminMaterial(payload)
      return NextResponse.json({ success: true, data: created })
    }

    if (action === 'UPDATE_MATERIAL') {
      const updated = await updateAdminMaterial(payload.id, payload.data)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'DELETE_MATERIAL') {
      const deleted = await deleteAdminMaterial(payload.id)
      return NextResponse.json({ success: true, data: deleted })
    }

    // ── Homework & Assignments Management ──
    if (action === 'GET_HOMEWORK') {
      const hw = await getAdminHomework()
      return NextResponse.json({ success: true, data: hw })
    }

    if (action === 'CREATE_HOMEWORK') {
      const created = await createAdminHomework(payload)
      return NextResponse.json({ success: true, data: created })
    }

    if (action === 'GRADE_HOMEWORK') {
      const graded = await gradeAdminHomework(payload.id, payload.grade, payload.feedback)
      return NextResponse.json({ success: true, data: graded })
    }

    if (action === 'DELETE_HOMEWORK') {
      const deleted = await deleteAdminHomework(payload.id)
      return NextResponse.json({ success: true, data: deleted })
    }

    // ── Settings, SEO & Audit Logs ──
    if (action === 'UPDATE_SETTINGS') {
      const updated = await updateAdminSettings(payload)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'GET_SEO_SETTINGS') {
      const seo = await getSeoSettings()
      return NextResponse.json({ success: true, data: seo })
    }

    if (action === 'UPDATE_SEO_SETTINGS') {
      const updated = await updateSeoSettings(payload)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'GET_AUDIT_LOGS') {
      const logs = await getAuditLogs()
      return NextResponse.json({ success: true, data: logs })
    }

    // ── Admin Profile & Notifications ──
    if (action === 'GET_ADMIN_PROFILE') {
      const profile = await getAdminProfile()
      return NextResponse.json({ success: true, data: profile })
    }

    if (action === 'UPDATE_ADMIN_PROFILE') {
      const updated = await updateAdminProfile(payload)
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'GET_NOTIFICATIONS') {
      const notifications = await getAdminNotifications()
      return NextResponse.json({ success: true, data: notifications })
    }

    if (action === 'MARK_NOTIFICATION_READ') {
      const success = await markAdminNotificationAsRead(payload.id)
      return NextResponse.json({ success })
    }

    if (action === 'MARK_ALL_NOTIFICATIONS_READ') {
      const success = await markAllAdminNotificationsAsRead()
      return NextResponse.json({ success })
    }

    if (action === 'CLEAR_NOTIFICATIONS') {
      const success = await clearAdminNotifications()
      return NextResponse.json({ success })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? 'Server error' },
      { status: err.statusCode ?? 500 }
    )
  }
}
