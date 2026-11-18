import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import type { BookingRecord, AssessmentRecord } from '@/lib/admin-data'
import type { AvailablePackage, StudentBooking, StudentHomework, StudentMaterial, StudentPackage, StudentProgressEntry } from '@/lib/student-data'

export interface StudentServiceOption {
  id: string
  name: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  durationMinutes: number
  price: number
  deliveryMode: 'ONLINE' | 'IN_PERSON' | 'BOTH'
}

async function loadStudentServicesFromDatabase(): Promise<StudentServiceOption[]> {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    language: service.language,
    durationMinutes: service.durationMinutes,
    price: Number(service.price),
    deliveryMode: service.deliveryMode,
  }))
}

export const getStudentServicesFromDatabase = unstable_cache(loadStudentServicesFromDatabase, ['student-services-v1'], { revalidate: 30 })

export function toStudentBooking(booking: any): StudentBooking {
  const status: StudentBooking['status'] =
    booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT'
      ? booking.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING'
      : booking.status === 'COMPLETED' || booking.status === 'NO_SHOW'
        ? 'COMPLETED'
        : 'CANCELLED'

  return {
    id: booking.id,
    serviceName: booking.service.name,
    language: booking.service.language,
    durationMinutes: booking.service.durationMinutes,
    deliveryMode: booking.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE',
    tutorName: booking.tutor.name,
    startAt: booking.startAt.toISOString(),
    endAt: booking.endAt.toISOString(),
    status,
    amount: Number(booking.payment?.amount ?? booking.service.price),
    paymentStatus: booking.payment?.status === 'SUCCEEDED' ? 'PAID' : booking.payment?.status === 'PENDING' ? 'PENDING' : 'UNPAID',
    meetingLink: booking.meetingLink ?? undefined,
    attendanceStatus: booking.lesson?.attendanceStatus === 'PRESENT' || booking.lesson?.attendanceStatus === 'ABSENT' || booking.lesson?.attendanceStatus === 'LATE'
      ? booking.lesson.attendanceStatus
      : undefined,
    lessonNotes: booking.lesson?.topic ?? undefined,
    tutorFeedback: booking.lesson?.studentFeedback ?? undefined,
  }
}

async function loadStudentBookingsFromDatabase(userId: string): Promise<StudentBooking[]> {
  const rows = await prisma.booking.findMany({
    where: { studentId: userId },
    select: {
      id: true, status: true, deliveryMode: true, startAt: true, endAt: true, meetingLink: true,
      service: { select: { name: true, language: true, durationMinutes: true, price: true } },
      tutor: { select: { name: true } },
      lesson: { select: { attendanceStatus: true, topic: true, studentFeedback: true } },
      payment: { select: { amount: true, status: true } },
    },
    orderBy: { startAt: 'desc' },
  })
  return rows.map(toStudentBooking)
}

export const getStudentBookingsFromDatabase = unstable_cache(loadStudentBookingsFromDatabase, ['student-bookings-v1'], { revalidate: 5 })

async function loadStudentHomeworkFromDatabase(userId: string): Promise<StudentHomework[]> {
  const rows = await prisma.homework.findMany({
    where: { studentId: userId },
    select: {
      id: true, title: true, instructions: true, dueAt: true, status: true, createdAt: true,
      submission: { select: { feedback: true } },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
  })
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    instructions: row.instructions,
    dueDate: row.dueAt?.toISOString() ?? '',
    status: row.status === 'REVIEWED' ? 'GRADED' : row.status === 'SUBMITTED' || row.submission ? 'SUBMITTED' : 'ASSIGNED',
    assignedAt: row.createdAt.toISOString(),
    feedback: row.submission?.feedback ?? undefined,
  }))
}

export const getStudentHomeworkFromDatabase = unstable_cache(loadStudentHomeworkFromDatabase, ['student-homework-v1'], { revalidate: 5 })

async function loadStudentMaterialsFromDatabase(userId: string): Promise<StudentMaterial[]> {
  const rows = await prisma.learningMaterial.findMany({
    where: {
      OR: [
        { isPublic: true },
        { accessGrants: { some: { studentId: userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } } },
      ],
    },
    select: { id: true, title: true, mimeType: true, description: true, fileKey: true, language: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    type: row.mimeType.includes('pdf') ? 'PDF' : row.mimeType.startsWith('audio/') ? 'AUDIO' : row.mimeType.startsWith('video/') ? 'VIDEO' : row.mimeType === 'application/vnd.workspeak.worksheet' ? 'WORKSHEET' : 'LINK',
    description: row.description ?? '',
    url: /^https?:\/\//i.test(row.fileKey) ? row.fileKey : `/api/v1/materials/${row.id}`,
    language: row.language ?? 'BOTH',
    level: '',
    uploadedAt: row.createdAt.toISOString(),
  }))
}

export const getStudentMaterialsFromDatabase = unstable_cache(loadStudentMaterialsFromDatabase, ['student-materials-v1'], { revalidate: 5 })

async function loadStudentPackagesFromDatabase(userId: string): Promise<{ purchased: StudentPackage[]; available: AvailablePackage[] }> {
  const [purchases, packages] = await Promise.all([
    prisma.packagePurchase.findMany({
      where: { studentId: userId },
      select: { id: true, totalLessons: true, usedLessons: true, status: true, purchasedAt: true, expiresAt: true, package: { select: { name: true, language: true, validityDays: true, price: true, description: true } } },
      orderBy: { purchasedAt: 'desc' },
    }),
    prisma.package.findMany({ where: { isActive: true }, select: { id: true, name: true, language: true, lessonCount: true, validityDays: true, price: true, description: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  return {
    purchased: purchases.map((purchase) => ({
      id: purchase.id,
      name: purchase.package.name,
      language: purchase.package.language,
      lessonCount: purchase.totalLessons,
      usedLessons: purchase.usedLessons,
      validityDays: purchase.package.validityDays,
      price: Number(purchase.package.price),
      status: purchase.status === 'ACTIVE' ? 'ACTIVE' : purchase.status === 'EXHAUSTED' ? 'USED' : 'EXPIRED',
      purchasedAt: purchase.purchasedAt.toISOString(),
      expiresAt: purchase.expiresAt.toISOString(),
      description: purchase.package.description ?? '',
    })),
    available: packages.map((item) => ({
      id: item.id,
      name: item.name,
      language: item.language,
      lessonCount: item.lessonCount,
      validityDays: item.validityDays,
      price: Number(item.price),
      description: item.description ?? '',
      popular: false,
    })),
  }
}

export const getStudentPackagesFromDatabase = unstable_cache(loadStudentPackagesFromDatabase, ['student-packages-v1'], { revalidate: 5 })

async function loadStudentProgressFromDatabase(userId: string): Promise<StudentProgressEntry[]> {
  const [rows, completedLessons, profile] = await Promise.all([
    prisma.studentProgress.findMany({ where: { studentId: userId }, select: { currentLevel: true, previousLevel: true, createdAt: true }, orderBy: { createdAt: 'asc' } }),
    prisma.lesson.count({ where: { studentId: userId, completedAt: { not: null } } }),
    prisma.studentProfile.findUnique({ where: { userId }, select: { currentLevel: true } }),
  ])
  const progress = rows.map((row, index) => ({
    level: row.currentLevel.split(/\s|—|-/)[0],
    label: row.currentLevel,
    completedLessons: index === rows.length - 1 ? completedLessons : 0,
    targetLessons: 0,
    achievedAt: row.previousLevel ? row.createdAt.toISOString() : undefined,
    current: index === rows.length - 1,
  }))
  if (progress.length === 0 && profile?.currentLevel) {
    progress.push({
      level: profile.currentLevel.split(/\s|—|-/)[0],
      label: profile.currentLevel,
      completedLessons,
      targetLessons: 0,
      achievedAt: undefined,
      current: true,
    })
  }
  return progress
}

export const getStudentProgressFromDatabase = unstable_cache(loadStudentProgressFromDatabase, ['student-progress-v1'], { revalidate: 5 })

async function loadManagementDashboardData() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  try {
  const [totalStudents, newStudents, upcomingLessons, pendingAssessments, pendingBookings, monthlyPayments, allPayments, bookings, assessments] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true, createdAt: { gte: monthStart } } }),
    prisma.booking.count({ where: { status: 'CONFIRMED', startAt: { gte: now } } }),
    prisma.assessmentRequest.count({ where: { status: 'NEW' } }),
    prisma.booking.count({ where: { status: 'PENDING_PAYMENT' } }),
    prisma.payment.aggregate({ where: { status: 'SUCCEEDED', paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'SUCCEEDED' }, _sum: { amount: true } }),
    prisma.booking.findMany({
      where: { status: 'CONFIRMED', startAt: { gte: now } },
      select: {
        id: true, deliveryMode: true, startAt: true, meetingLink: true,
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true } },
        service: { select: { name: true, language: true, durationMinutes: true, price: true } },
        lesson: { select: { attendanceStatus: true, topic: true, studentFeedback: true } },
      },
      orderBy: { startAt: 'asc' }, take: 20,
    }),
    prisma.assessmentRequest.findMany({
      where: { status: { in: ['NEW', 'CONTACTED'] } },
      select: { id: true, name: true, email: true, phone: true, language: true, deliveryMode: true, currentLevel: true, learningGoals: true, message: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }, take: 10,
    }),
  ])
  const initialBookings: BookingRecord[] = bookings.map((b) => ({
    id: b.id, studentName: b.student.name, studentEmail: b.student.email, tutorName: b.tutor.name,
    serviceName: b.service.name, language: b.service.language === 'ENGLISH' ? 'ENGLISH' : 'PORTUGUESE',
    deliveryMode: b.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE', startAt: b.startAt.toISOString(), durationMinutes: b.service.durationMinutes,
    price: Number(b.service.price), status: 'CONFIRMED', meetingLink: b.meetingLink ?? undefined,
    attendanceStatus: b.lesson?.attendanceStatus === 'PRESENT' || b.lesson?.attendanceStatus === 'ABSENT' || b.lesson?.attendanceStatus === 'LATE' ? b.lesson.attendanceStatus : undefined, lessonNotes: b.lesson?.topic ?? undefined,
    tutorFeedback: b.lesson?.studentFeedback ?? undefined,
  }))
  const initialAssessments: AssessmentRecord[] = assessments.map((a) => ({
    id: a.id, name: a.name, email: a.email, phone: a.phone ?? '', language: a.language,
    deliveryMode: a.deliveryMode, currentLevel: a.currentLevel ?? '', learningGoals: a.learningGoals ?? '',
    message: a.message ?? undefined, status: a.status === 'CONVERTED' ? 'COMPLETED' : a.status === 'NO_SHOW' ? 'CANCELLED' : a.status, createdAt: a.createdAt.toISOString(),
  }))
  return {
    stats: { totalStudents, newStudents, upcomingLessons, pendingActions: pendingAssessments + pendingBookings,
      monthlyRevenue: Number(monthlyPayments._sum.amount ?? 0), totalRevenue: Number(allPayments._sum.amount ?? 0) },
    initialBookings, initialAssessments,
  }
  } catch {
    const { getAdminOverviewData } = await import('@/lib/admin-data')
    const overview = await getAdminOverviewData()
    return {
      stats: {
        totalStudents: overview.totalStudents,
        newStudents: overview.newStudents,
        upcomingLessons: overview.upcomingLessons,
        pendingActions: overview.pendingActions,
        monthlyRevenue: overview.monthlyRevenue,
        totalRevenue: overview.totalRevenue,
      },
      initialBookings: overview.upcomingBookings,
      initialAssessments: overview.recentAssessments,
    }
  }
}

export const getManagementDashboardData = unstable_cache(loadManagementDashboardData, ['management-dashboard-v1'], { revalidate: 5 })

async function loadStudentDashboardFromDatabase(userId: string) {
  const now = new Date()
  try {
  const [bookings, packages, homeworkRows, materialsRows, progressRows, attendance, lastPayment, completedLessons, pendingHomework, studentProfile, services] = await Promise.all([
    prisma.booking.findMany({
      where: { studentId: userId, status: 'CONFIRMED', startAt: { gte: now } },
      select: {
        id: true, deliveryMode: true, startAt: true, endAt: true, meetingLink: true,
        service: { select: { name: true, language: true, durationMinutes: true, price: true } },
        tutor: { select: { name: true } },
        lesson: { select: { attendanceStatus: true, topic: true, studentFeedback: true } },
        payment: { select: { status: true } },
      },
      orderBy: { startAt: 'asc' }, take: 5,
    }),
    prisma.packagePurchase.findMany({
      where: { studentId: userId, status: 'ACTIVE', expiresAt: { gte: now } },
      select: { id: true, totalLessons: true, usedLessons: true, purchasedAt: true, expiresAt: true, package: { select: { name: true, language: true, validityDays: true, price: true, description: true } } },
      orderBy: { expiresAt: 'asc' },
    }),
    prisma.homework.findMany({ where: { studentId: userId }, select: { id: true, title: true, instructions: true, dueAt: true, status: true, createdAt: true }, orderBy: { dueAt: 'asc' }, take: 5 }),
    prisma.learningMaterial.findMany({
      where: { OR: [{ isPublic: true }, { accessGrants: { some: { studentId: userId, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } } }] },
      select: { id: true, title: true, mimeType: true, description: true, fileKey: true, language: true, createdAt: true },
      orderBy: { createdAt: 'desc' }, take: 5,
    }),
    prisma.studentProgress.findMany({ where: { studentId: userId }, select: { currentLevel: true, previousLevel: true, createdAt: true }, orderBy: { createdAt: 'asc' } }),
    prisma.lesson.groupBy({ by: ['attendanceStatus'], where: { studentId: userId, attendanceStatus: { not: null } }, _count: { _all: true } }),
    prisma.payment.findFirst({ where: { studentId: userId, status: 'SUCCEEDED' }, orderBy: { paidAt: 'desc' } }),
    prisma.lesson.count({ where: { studentId: userId, completedAt: { not: null } } }),
    prisma.homework.count({ where: { studentId: userId, status: { in: ['ASSIGNED', 'OVERDUE'] } } }),
    prisma.studentProfile.findUnique({ where: { userId }, select: { currentLevel: true } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  const upcoming: StudentBooking[] = bookings.map((b) => ({ id: b.id, serviceName: b.service.name, language: b.service.language, durationMinutes: b.service.durationMinutes, deliveryMode: b.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE', tutorName: b.tutor.name, startAt: b.startAt.toISOString(), endAt: b.endAt.toISOString(), status: 'CONFIRMED', amount: Number(b.service.price), paymentStatus: b.payment?.status === 'SUCCEEDED' ? 'PAID' : 'PENDING', meetingLink: b.meetingLink ?? undefined, attendanceStatus: b.lesson?.attendanceStatus === 'PRESENT' || b.lesson?.attendanceStatus === 'ABSENT' || b.lesson?.attendanceStatus === 'LATE' ? b.lesson.attendanceStatus : undefined, lessonNotes: b.lesson?.topic ?? undefined, tutorFeedback: b.lesson?.studentFeedback ?? undefined }))
  const active: StudentPackage[] = packages.map((p) => ({ id: p.id, name: p.package.name, language: p.package.language, lessonCount: p.totalLessons, usedLessons: p.usedLessons, validityDays: p.package.validityDays, price: Number(p.package.price), status: 'ACTIVE', purchasedAt: p.purchasedAt.toISOString(), expiresAt: p.expiresAt.toISOString(), description: p.package.description ?? '' }))
  const homework: StudentHomework[] = homeworkRows.map((h) => ({ id: h.id, title: h.title, instructions: h.instructions, dueDate: h.dueAt?.toISOString() ?? '', status: h.status === 'REVIEWED' ? 'GRADED' : h.status === 'OVERDUE' ? 'ASSIGNED' : h.status, assignedAt: h.createdAt.toISOString(), feedback: undefined }))
  const materials: StudentMaterial[] = materialsRows.map((m) => ({ id: m.id, title: m.title, type: m.mimeType.includes('pdf') ? 'PDF' : m.mimeType.startsWith('audio/') ? 'AUDIO' : m.mimeType.startsWith('video/') ? 'VIDEO' : m.mimeType === 'application/vnd.workspeak.worksheet' ? 'WORKSHEET' : 'LINK', description: m.description ?? '', url: /^https?:\/\//i.test(m.fileKey) ? m.fileKey : `/api/v1/materials/${m.id}`, language: m.language ?? 'BOTH', level: '', uploadedAt: m.createdAt.toISOString() }))
  const progress: StudentProgressEntry[] = progressRows.map((p, i) => ({ level: p.currentLevel.split(/\s|—|-/)[0], label: p.currentLevel, completedLessons: i === progressRows.length - 1 ? completedLessons : 0, targetLessons: 0, achievedAt: p.previousLevel ? p.createdAt.toISOString() : undefined, current: i === progressRows.length - 1 }))
  const counts = { attended: 0, absent: 0, late: 0 }
  for (const row of attendance) {
    if (row.attendanceStatus === 'PRESENT') counts.attended = row._count._all
    if (row.attendanceStatus === 'ABSENT') counts.absent = row._count._all
    if (row.attendanceStatus === 'LATE') counts.late = row._count._all
  }
  const profileLevel = studentProfile?.currentLevel
  const currentLevel = progress.find((p) => p.current) ?? (profileLevel ? { level: profileLevel.split(/\s|—|-/)[0], label: profileLevel, completedLessons, targetLessons: 0, current: true } : undefined)
  const availableServices: StudentServiceOption[] = services.map((service) => ({ id: service.id, name: service.name, language: service.language, durationMinutes: service.durationMinutes, price: Number(service.price), deliveryMode: service.deliveryMode }))
  return { upcoming, active, pendingHw: pendingHomework, lastPaymentAmount: lastPayment ? Number(lastPayment.amount) : null, currentLevel, homework, materials, progress, attendance: counts, services: availableServices }
  } catch {
    const { findStudentById } = await import('@/lib/admin-data')
    const student = await findStudentById(userId)
    const currentLevel = student ? {
      level: student.cefrLevel,
      label: student.currentLevel,
      completedLessons: student.lessonsCompleted,
      targetLessons: 0,
      current: true,
    } : undefined
    return {
      upcoming: [],
      active: [],
      pendingHw: 0,
      lastPaymentAmount: null,
      currentLevel,
      homework: [],
      materials: [],
      progress: currentLevel ? [currentLevel] : [],
      attendance: student?.attendance ?? { attended: 0, absent: 0, late: 0 },
      services: [],
    }
  }
}

export const getStudentDashboardFromDatabase = unstable_cache(loadStudentDashboardFromDatabase, ['student-dashboard-v1'], { revalidate: 5 })
