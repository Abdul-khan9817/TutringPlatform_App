import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toStudentBooking } from '@/lib/dashboard-data'

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['STUDENT', 'ADMIN'], req)
    const body = await req.json()
    const { action, payload } = body

    // ── Student Notifications ──
    if (action === 'GET_NOTIFICATIONS') {
      const rows = await prisma.notification.findMany({
        where: { userId: session.sub },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      const notifs = rows.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.body,
        type: row.type.includes('HOMEWORK') ? 'HOMEWORK' : row.type.includes('PACKAGE') ? 'PACKAGE' : row.type.startsWith('BOOKING') || row.type.includes('LESSON') ? 'LESSON' : 'SYSTEM',
        timestamp: row.createdAt.toISOString(),
        read: row.isRead,
        link: row.type.includes('HOMEWORK') ? '/student/homework' : row.type.includes('PACKAGE') ? '/student/packages' : '/student/bookings',
      }))
      return NextResponse.json({ success: true, data: notifs })
    }

    if (action === 'MARK_NOTIFICATION_READ') {
      const result = await prisma.notification.updateMany({
        where: { id: payload?.id, userId: session.sub },
        data: { isRead: true },
      })
      return NextResponse.json({ success: result.count > 0 })
    }

    if (action === 'MARK_ALL_NOTIFICATIONS_READ') {
      await prisma.notification.updateMany({ where: { userId: session.sub, isRead: false }, data: { isRead: true } })
      return NextResponse.json({ success: true })
    }

    if (action === 'CLEAR_NOTIFICATIONS') {
      await prisma.notification.deleteMany({ where: { userId: session.sub } })
      return NextResponse.json({ success: true })
    }

    // ── Student Bookings ──
    if (action === 'CREATE_BOOKING') {
      if (session.role !== 'STUDENT') {
        return NextResponse.json({ success: false, error: 'Only students can create bookings.' }, { status: 403 })
      }
      const startAt = new Date(payload?.startAt)
      const deliveryMode = payload?.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE'
      const language = payload?.language
      const durationMinutes = Number(payload?.durationMinutes)
      if (!Number.isFinite(startAt.getTime()) || startAt <= new Date() || !Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 240 || !['PORTUGUESE', 'ENGLISH', 'BOTH'].includes(language)) {
        return NextResponse.json({ success: false, error: 'Choose a valid future class time.' }, { status: 400 })
      }
      const [service, tutor] = await Promise.all([
        prisma.service.findFirst({
          where: {
            language: language === 'BOTH' ? 'BOTH' : { in: [language, 'BOTH'] },
            durationMinutes,
            isActive: true,
            deliveryMode: { in: [deliveryMode, 'BOTH'] },
          },
          orderBy: { sortOrder: 'asc' },
        }),
        prisma.user.findFirst({ where: { role: 'TUTOR', isActive: true }, orderBy: { createdAt: 'asc' } }),
      ])
      if (!service || !tutor) {
        return NextResponse.json({ success: false, error: 'Bookings are not available yet. Please contact the academy.' }, { status: 409 })
      }
      const booking = await prisma.booking.create({
        data: {
          studentId: session.sub,
          tutorId: tutor.id,
          serviceId: service.id,
          startAt,
          endAt: new Date(startAt.getTime() + service.durationMinutes * 60_000),
          deliveryMode,
          status: 'PENDING_PAYMENT',
        },
        include: { service: true, tutor: true, lesson: true, payment: true },
      })
      return NextResponse.json({ success: true, data: toStudentBooking(booking) }, { status: 201 })
    }

    if (action === 'CANCEL_BOOKING') {
      if (session.role !== 'STUDENT') {
        return NextResponse.json({ success: false, error: 'Only students can cancel their own bookings.' }, { status: 403 })
      }
      const updated = await prisma.booking.updateMany({
        where: { id: payload?.id, studentId: session.sub, status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] } },
        data: { status: 'CANCELLED', cancelledBy: session.sub, cancelledAt: new Date() },
      })
      if (!updated.count) return NextResponse.json({ success: false, error: 'Booking not found or cannot be cancelled.' }, { status: 404 })
      const booking = await prisma.booking.findFirst({
        where: { id: payload.id, studentId: session.sub },
        include: { service: true, tutor: true, lesson: true, payment: true },
      })
      return NextResponse.json({ success: true, data: booking ? toStudentBooking(booking) : null })
    }

    // ── Homework Submission ──
    if (action === 'SUBMIT_HOMEWORK') {
      if (session.role !== 'STUDENT') {
        return NextResponse.json({ success: false, error: 'Only students can submit homework.' }, { status: 403 })
      }
      const homework = await prisma.homework.findFirst({
        where: { id: payload?.id, studentId: session.sub, status: { in: ['ASSIGNED', 'OVERDUE'] } },
        include: { submission: true },
      })
      if (!homework || homework.submission) {
        return NextResponse.json({ success: false, error: 'Homework not found or already submitted.' }, { status: 404 })
      }
      await prisma.$transaction([
        prisma.homeworkSubmission.create({ data: { homeworkId: homework.id, studentId: session.sub } }),
        prisma.homework.update({ where: { id: homework.id }, data: { status: 'SUBMITTED' } }),
      ])
      return NextResponse.json({ success: true, data: { id: homework.id, status: 'SUBMITTED' } })
    }

    // ── Profile Updates (Strictly Permitted Fields Only - Zero Role Escalation) ──
    if (action === 'UPDATE_PROFILE') {
      if (session.role !== 'STUDENT') {
        return NextResponse.json({ success: false, error: 'Only students can update their own profile' }, { status: 403 })
      }

      const timezone = typeof payload?.timezone === 'string' ? payload.timezone.slice(0, 80) : 'Europe/Lisbon'
      try {
        new Intl.DateTimeFormat('en', { timeZone: timezone })
      } catch {
        return NextResponse.json({ success: false, error: 'Please choose a valid time zone' }, { status: 400 })
      }

      const allowedData = {
        phone: typeof payload?.phone === 'string' ? payload.phone.trim().slice(0, 30) || null : undefined,
        companyName: typeof payload?.companyName === 'string' ? payload.companyName.trim().slice(0, 100) || null : undefined,
        learningGoals: typeof payload?.learningGoals === 'string' ? payload.learningGoals.trim().slice(0, 500) || null : undefined,
        timezone,
      }

      const profile = await prisma.studentProfile.upsert({
        where: { userId: session.sub },
        create: { userId: session.sub, ...allowedData },
        update: allowedData,
        select: { phone: true, companyName: true, learningGoals: true, timezone: true },
      })
      return NextResponse.json({
        success: true,
        data: {
          phone: profile.phone ?? '',
          companyName: profile.companyName ?? '',
          learningGoals: profile.learningGoals ?? '',
          timezone: profile.timezone,
        },
      })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? 'Server error' },
      { status: err.statusCode ?? 500 }
    )
  }
}
