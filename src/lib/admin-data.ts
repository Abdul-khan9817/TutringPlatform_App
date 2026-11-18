// Unified backend data provider for Admin Management
// Queries Prisma database when connected, and maintains consistent in-memory state during development
import { prisma } from './prisma'
import { hashPassword, invalidateAllUserSessions } from './auth'

export interface StudentRecord {
  id: string
  name: string
  email: string
  phone: string
  preferredLanguage: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  currentLevel: string
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  lessonsCompleted: number
  lessonBalance: number
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'
  joinedAt: string
  assignedCourses: string[]
  inviteToken?: string
  inviteUrl?: string
  tempPassword?: string
  passwordHash?: string
  notes?: string
  attendance: {
    attended: number
    absent: number
    late: number
  }
}

export interface BookingRecord {
  id: string
  studentName: string
  studentEmail: string
  tutorName: string
  serviceName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  deliveryMode: 'ONLINE' | 'IN_PERSON'
  startAt: string
  durationMinutes: number
  price: number
  status: 'CONFIRMED' | 'PENDING_PAYMENT' | 'COMPLETED' | 'CANCELLED'
  meetingLink?: string
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'PENDING'
  lessonNotes?: string
  tutorFeedback?: string
}

export interface AssessmentRecord {
  id: string
  name: string
  email: string
  phone: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  deliveryMode: 'ONLINE' | 'IN_PERSON' | 'BOTH'
  currentLevel: string
  learningGoals: string
  message?: string
  status: 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  recommendedLevel?: string
  evaluationNotes?: string
}

export interface PaymentRecord {
  id: string
  studentName: string
  studentEmail: string
  description: string
  amount: number
  currency: string
  status: 'SUCCEEDED' | 'PENDING' | 'REFUNDED' | 'FAILED'
  paidAt: string
  method: string
  invoiceNumber?: string
}

export interface AcademySettings {
  academyName: string
  contactEmail: string
  supportPhone: string
  standardHourlyRate: number
  timezone: string
  currency: string
  onlineMeetingPlatform: string
}

export interface SeoSettings {
  siteTitle: string
  metaDescription: string
  canonicalUrl: string
  targetKeywords: string
  announcementBanner: string
  bannerActive: boolean
  contactPhone: string
  contactEmail: string
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  password?: string
  role: 'ADMIN'
  title: string
  avatarUrl: string
  phone: string
}

export interface AdminNotification {
  id: string
  title: string
  message: string
  type: 'ASSESSMENT' | 'BOOKING' | 'PAYMENT' | 'SYSTEM'
  timestamp: string
  read: boolean
  link?: string
}

export interface LearningMaterialRecord {
  id: string
  title: string
  description: string
  type: 'PDF' | 'AUDIO' | 'VIDEO' | 'WORKSHEET' | 'LINK'
  url: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  level: string
  assignedStudentId?: string // 'ALL' or specific student id
  uploadedAt: string
}

export interface AdminHomeworkRecord {
  id: string
  title: string
  instructions: string
  studentId: string
  studentName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  dueDate: string
  status: 'ASSIGNED' | 'SUBMITTED' | 'GRADED'
  submissionText?: string
  submittedAt?: string
  grade?: string
  feedback?: string
  assignedAt: string
}

export interface AuditLogRecord {
  id: string
  timestamp: string
  adminEmail: string
  action: string
  entityType: string
  entityId: string
  details: string
  ipAddress?: string
}

// In-memory persistent state across requests during server runtime
const globalStore = globalThis as unknown as {
  _adminStudents?: StudentRecord[]
  _adminBookings?: BookingRecord[]
  _adminAssessments?: AssessmentRecord[]
  _adminPayments?: PaymentRecord[]
  _adminSettings?: AcademySettings
  _adminSeoSettings?: SeoSettings
  _adminProfile?: AdminProfile
  _adminNotifications?: AdminNotification[]
  _adminMaterials?: LearningMaterialRecord[]
  _adminHomework?: AdminHomeworkRecord[]
  _adminAuditLogs?: AuditLogRecord[]
  _adminStudentsSyncedAt?: number
}

// ────────────────────────────────────────────────────────────
// Initial Seeds
// ────────────────────────────────────────────────────────────

if (!globalStore._adminProfile) {
  globalStore._adminProfile = {
    id: 'admin-system-master',
    name: 'Asad Khan',
    email: 'khanasad4244@gmail.com',
    password: undefined,
    role: 'ADMIN',
    title: 'Lead Teacher & Platform Owner',
    avatarUrl: '',
    phone: '+351 916 869 857',
  }
}

if (!globalStore._adminNotifications) {
  globalStore._adminNotifications = [
    {
      id: 'notif-1',
      title: 'New Assessment Request',
      message: 'David Van Dijk requested A1 assessment (Lisbon In-Person)',
      type: 'ASSESSMENT',
      timestamp: '15 mins ago',
      read: false,
      link: '/management/assessments',
    },
    {
      id: 'notif-2',
      title: 'Lesson Booking Confirmed',
      message: 'Ana Beatriz Santos confirmed Medical & Professional English session',
      type: 'BOOKING',
      timestamp: '2 hours ago',
      read: false,
      link: '/management/bookings',
    },
    {
      id: 'notif-3',
      title: 'Payment Cleared',
      message: '€320.00 received via MB WAY for Portuguese Starter 10-pack',
      type: 'PAYMENT',
      timestamp: 'Yesterday',
      read: true,
      link: '/management/payments',
    },
    {
      id: 'notif-4',
      title: 'System Health Check',
      message: 'Academy database & single admin session stores running smoothly with zero downtime',
      type: 'SYSTEM',
      timestamp: '2 days ago',
      read: true,
      link: '/management/dashboard',
    },
  ]
}

if (!globalStore._adminStudents) {
  globalStore._adminStudents = [
    {
      id: 'std-demo',
      name: 'Demo Student',
      email: 'demo@student.com',
      phone: '+351 912 345 678',
      preferredLanguage: 'PORTUGUESE',
      currentLevel: 'A2 — Elementary',
      cefrLevel: 'A2',
      lessonsCompleted: 4,
      lessonBalance: 6,
      status: 'ACTIVE',
      joinedAt: '2026-08-01',
      assignedCourses: ['European Portuguese Starter — 10 Lessons'],
      inviteToken: 'inv_demo_001',
      inviteUrl: 'http://localhost:3000/login',
      notes: 'Initial enrolled demo student account.',
      attendance: { attended: 4, absent: 0, late: 0 },
    },
    {
      id: 'std-1',
      name: 'Maria Silva',
      email: 'maria.silva@techlisbon.pt',
      phone: '+351 912 345 678',
      preferredLanguage: 'PORTUGUESE',
      currentLevel: 'B1 — Intermediate',
      cefrLevel: 'B1',
      lessonsCompleted: 14,
      lessonBalance: 6,
      status: 'ACTIVE',
      joinedAt: '2026-09-15',
      assignedCourses: ['European Portuguese for Tech Professionals', 'Workplace Daily Communication'],
      inviteToken: 'inv_msilva_9921',
      inviteUrl: 'http://localhost:3000/register?invite=inv_msilva_9921',
      notes: 'Focus on oral fluency for client presentations and negotiations.',
      attendance: { attended: 14, absent: 1, late: 0 },
    },
    {
      id: 'std-2',
      name: 'James Harrington',
      email: 'j.harrington@fintech.co.uk',
      phone: '+351 933 881 229',
      preferredLanguage: 'PORTUGUESE',
      currentLevel: 'A2 — Elementary',
      cefrLevel: 'A2',
      lessonsCompleted: 8,
      lessonBalance: 12,
      status: 'ACTIVE',
      joinedAt: '2026-10-02',
      assignedCourses: ['European Portuguese A2 Intensive', 'Financial Vocabulary Portugal'],
      inviteToken: 'inv_jharrington_4810',
      inviteUrl: 'http://localhost:3000/register?invite=inv_jharrington_4810',
      notes: 'Preparing for Portuguese citizenship residency language requirement (CIPLE A2).',
      attendance: { attended: 8, absent: 0, late: 1 },
    },
    {
      id: 'std-3',
      name: 'Ana Beatriz Santos',
      email: 'anabeatriz@hospital-lisboa.pt',
      phone: '+351 961 772 334',
      preferredLanguage: 'ENGLISH',
      currentLevel: 'B2 — Upper Intermediate',
      cefrLevel: 'B2',
      lessonsCompleted: 22,
      lessonBalance: 8,
      status: 'ACTIVE',
      joinedAt: '2026-08-20',
      assignedCourses: ['Medical & Clinical English', 'International Healthcare Conferences'],
      inviteToken: 'inv_asantos_3391',
      inviteUrl: 'http://localhost:3000/register?invite=inv_asantos_3391',
      notes: 'Cardiology specialist writing papers for BMJ and speaking at Oxford symposium.',
      attendance: { attended: 22, absent: 2, late: 1 },
    },
    {
      id: 'std-4',
      name: 'David Van Dijk',
      email: 'david.dijk@remoteamsterdam.nl',
      phone: '+351 915 440 918',
      preferredLanguage: 'BOTH',
      currentLevel: 'A1 — Beginner',
      cefrLevel: 'A1',
      lessonsCompleted: 4,
      lessonBalance: 16,
      status: 'ACTIVE',
      joinedAt: '2026-11-01',
      assignedCourses: ['Portuguese A1 Immersion', 'Everyday Life in Lisbon'],
      inviteToken: 'inv_dvandijk_1029',
      inviteUrl: 'http://localhost:3000/register?invite=inv_dvandijk_1029',
      notes: 'Digital nomad relocated to Lisbon. Needs practical restaurant, shopping, and rental phrases.',
      attendance: { attended: 4, absent: 0, late: 0 },
    },
    {
      id: 'std-5',
      name: 'Sofia Rocha',
      email: 'sofia.rocha@advogados-porto.pt',
      phone: '+351 928 663 115',
      preferredLanguage: 'ENGLISH',
      currentLevel: 'C1 — Advanced Business',
      cefrLevel: 'C1',
      lessonsCompleted: 19,
      lessonBalance: 5,
      status: 'ACTIVE',
      joinedAt: '2026-07-12',
      assignedCourses: ['Legal English & Contract Drafting', 'Cross-Border M&A Advisory'],
      inviteToken: 'inv_srocha_5542',
      inviteUrl: 'http://localhost:3000/register?invite=inv_srocha_5542',
      notes: 'Commercial lawyer handling cross-border acquisitions between Portugal and the UK.',
      attendance: { attended: 19, absent: 1, late: 2 },
    },
  ]
}

if (!globalStore._adminBookings) {
  globalStore._adminBookings = [
    {
      id: 'bk-101',
      studentName: 'James Harrington',
      studentEmail: 'j.harrington@fintech.co.uk',
      tutorName: 'Prof. Asad Khan',
      serviceName: 'European Portuguese for Workplace',
      language: 'PORTUGUESE',
      deliveryMode: 'ONLINE',
      startAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      durationMinutes: 60,
      price: 32,
      status: 'CONFIRMED',
      meetingLink: 'https://meet.google.com/ws-pt-harrington',
      attendanceStatus: 'PENDING',
      lessonNotes: 'Grammar review: Pretérito Perfeito vs Imperfeito in business reporting.',
    },
    {
      id: 'bk-102',
      studentName: 'Ana Beatriz Santos',
      studentEmail: 'anabeatriz@hospital-lisboa.pt',
      tutorName: 'Prof. Asad Khan',
      serviceName: 'Medical & Professional English',
      language: 'ENGLISH',
      deliveryMode: 'ONLINE',
      startAt: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
      durationMinutes: 60,
      price: 32,
      status: 'CONFIRMED',
      meetingLink: 'https://meet.google.com/ws-pt-santos',
      attendanceStatus: 'PENDING',
      lessonNotes: 'Patient consultation simulations and medical discharge summaries.',
    },
    {
      id: 'bk-103',
      studentName: 'David Van Dijk',
      studentEmail: 'david.dijk@remoteamsterdam.nl',
      tutorName: 'Prof. Asad Khan',
      serviceName: 'Portuguese Intensive A1',
      language: 'PORTUGUESE',
      deliveryMode: 'IN_PERSON',
      startAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      durationMinutes: 90,
      price: 48,
      status: 'CONFIRMED',
      meetingLink: '',
      attendanceStatus: 'PENDING',
      lessonNotes: 'In-person meeting at Saldanha Cowork Hub. Focus on ordering and directions.',
    },
    {
      id: 'bk-104',
      studentName: 'Maria Silva',
      studentEmail: 'maria.silva@techlisbon.pt',
      tutorName: 'Prof. Asad Khan',
      serviceName: 'Executive Presentation Skills',
      language: 'PORTUGUESE',
      deliveryMode: 'ONLINE',
      startAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      durationMinutes: 60,
      price: 32,
      status: 'COMPLETED',
      meetingLink: 'https://meet.google.com/ws-pt-silva',
      attendanceStatus: 'PRESENT',
      lessonNotes: 'Conducted pitch deck walkthrough. Maria demonstrated strong mastery of formal transitions.',
      tutorFeedback: 'Excellent progress! Continue practicing pronunciation of open vowels in Portuguese technical terms.',
    },
    {
      id: 'bk-105',
      studentName: 'Sofia Rocha',
      studentEmail: 'sofia.rocha@advogados-porto.pt',
      tutorName: 'Prof. Asad Khan',
      serviceName: 'Legal English & Contract Drafting',
      language: 'ENGLISH',
      deliveryMode: 'ONLINE',
      startAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      durationMinutes: 60,
      price: 32,
      status: 'PENDING_PAYMENT',
      meetingLink: 'https://meet.google.com/ws-pt-rocha',
      attendanceStatus: 'PENDING',
      lessonNotes: 'Awaiting invoice clearance. Focus scheduled on indemnification clauses.',
    },
  ]
}

if (!globalStore._adminAssessments) {
  globalStore._adminAssessments = [
    {
      id: 'asm-201',
      name: 'Carlos Mendes',
      email: 'carlos.m@startup-hub.pt',
      phone: '+351 918 223 991',
      language: 'ENGLISH',
      deliveryMode: 'ONLINE',
      currentLevel: 'B1 — Intermediate',
      learningGoals: 'Preparing for pitch rounds in London and Silicon Valley next month.',
      status: 'NEW',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      recommendedLevel: 'B2',
      evaluationNotes: 'High receptive comprehension, needs work on executive spontaneous Q&A.',
    },
    {
      id: 'asm-202',
      name: 'Emma Watson-Brown',
      email: 'emma.wb@techconsulting.com',
      phone: '+351 934 112 870',
      language: 'PORTUGUESE',
      deliveryMode: 'BOTH',
      currentLevel: 'A0 — Total Beginner',
      learningGoals: 'Relocated to Cascais recently. Need conversational Portuguese for social and professional integration.',
      status: 'NEW',
      createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      recommendedLevel: 'A1',
      evaluationNotes: 'Recommended Starter 10-lesson Portuguese intensive pack.',
    },
    {
      id: 'asm-203',
      name: 'Lukas Bauer',
      email: 'lukas.bauer@auto-engineering.de',
      phone: '+351 925 667 334',
      language: 'PORTUGUESE',
      deliveryMode: 'ONLINE',
      currentLevel: 'A2 — Elementary',
      learningGoals: 'AIMA language exam preparation (CIPLE A2 certification).',
      status: 'CONTACTED',
      createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      recommendedLevel: 'A2',
      evaluationNotes: 'Scheduled diagnostic oral assessment via Google Meet.',
    },
    {
      id: 'asm-204',
      name: 'Helena Costa',
      email: 'h.costa@biotech-coimbra.pt',
      phone: '+351 919 445 112',
      language: 'ENGLISH',
      deliveryMode: 'ONLINE',
      currentLevel: 'B2 — Upper Intermediate',
      learningGoals: 'Academic paper publication and international scientific symposium presentation.',
      status: 'SCHEDULED',
      createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      recommendedLevel: 'B2/C1',
      evaluationNotes: 'Assessment scheduled for Thursday 17:00.',
    },
  ]
}

if (!globalStore._adminPayments) {
  globalStore._adminPayments = [
    {
      id: 'pay-301',
      studentName: 'James Harrington',
      studentEmail: 'j.harrington@fintech.co.uk',
      description: 'Portuguese Starter 10-Lesson Package',
      amount: 320,
      currency: 'EUR',
      status: 'SUCCEEDED',
      paidAt: '2026-11-10T14:30:00Z',
      method: 'MB WAY',
      invoiceNumber: 'INV-2026-0089',
    },
    {
      id: 'pay-302',
      studentName: 'Ana Beatriz Santos',
      studentEmail: 'anabeatriz@hospital-lisboa.pt',
      description: 'Single Session (60m) - Medical English',
      amount: 32,
      currency: 'EUR',
      status: 'SUCCEEDED',
      paidAt: '2026-11-09T10:15:00Z',
      method: 'Credit Card (Stripe)',
      invoiceNumber: 'INV-2026-0088',
    },
    {
      id: 'pay-303',
      studentName: 'David Van Dijk',
      studentEmail: 'david.dijk@remoteamsterdam.nl',
      description: 'Portuguese Intensive A1 Pack (20 Lessons)',
      amount: 600,
      currency: 'EUR',
      status: 'SUCCEEDED',
      paidAt: '2026-11-04T16:45:00Z',
      method: 'SEPA Bank Transfer',
      invoiceNumber: 'INV-2026-0085',
    },
    {
      id: 'pay-304',
      studentName: 'Maria Silva',
      studentEmail: 'maria.silva@techlisbon.pt',
      description: 'Executive Presentation Skills (10 Lessons)',
      amount: 320,
      currency: 'EUR',
      status: 'SUCCEEDED',
      paidAt: '2026-10-28T09:00:00Z',
      method: 'Multibanco Reference',
      invoiceNumber: 'INV-2026-0078',
    },
  ]
}

if (!globalStore._adminSettings) {
  globalStore._adminSettings = {
    academyName: 'WorkSpeak Portugal',
    contactEmail: 'khanasad4244@gmail.com',
    supportPhone: '+351 916 869 857',
    standardHourlyRate: 32,
    timezone: 'Europe/Lisbon',
    currency: 'EUR',
    onlineMeetingPlatform: 'Google Meet / Zoom Education',
  }
}

if (!globalStore._adminSeoSettings) {
  globalStore._adminSeoSettings = {
    siteTitle: 'WorkSpeak Portugal — Professional Portuguese & Business English Academy',
    metaDescription: 'Personalized 1-on-1 language coaching in Lisbon and online. European Portuguese (CIPLE/DIPLE prep) & Business English for international professionals and expats.',
    canonicalUrl: 'https://workspeakportugal.com',
    targetKeywords: 'learn portuguese lisbon, business portuguese, ciple a2 prep, english tutor lisbon, portuguese lessons expat',
    announcementBanner: '🇵🇹 Spring 2026 Term: Book your Free 15-Minute Level Assessment with Teacher Asad Khan.',
    bannerActive: true,
    contactPhone: '+351 916 869 857',
    contactEmail: 'khanasad4244@gmail.com',
  }
}

if (!globalStore._adminMaterials) {
  globalStore._adminMaterials = [
    {
      id: 'mat-1',
      title: 'European Portuguese Workplace Essentials Guide',
      description: 'Handy PDF cheat sheet covering email phrases, meeting greetings, and office idioms in Portugal.',
      type: 'PDF',
      url: '',
      language: 'PORTUGUESE',
      level: 'A1-B1',
      assignedStudentId: 'ALL',
      uploadedAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 'mat-2',
      title: 'Pronunciation Audio Drills: Open vs Closed Vowels',
      description: '30-minute high-definition audio drills with transcript practicing European Portuguese nasal & closed vowels.',
      type: 'AUDIO',
      url: '',
      language: 'PORTUGUESE',
      level: 'A1-A2',
      assignedStudentId: 'ALL',
      uploadedAt: '2026-10-22T14:30:00Z',
    },
    {
      id: 'mat-3',
      title: 'Medical Consultation Framework & Clinical Terminology',
      description: 'Worksheet and vocabulary bank for clinicians presenting patient case notes in English.',
      type: 'WORKSHEET',
      url: '',
      language: 'ENGLISH',
      level: 'B2-C1',
      assignedStudentId: 'std-3',
      uploadedAt: '2026-11-01T09:15:00Z',
    },
    {
      id: 'mat-4',
      title: 'CIPLE A2 Exam Practice Test & Audio Samples',
      description: 'Official AIMA/CAPLE format test covering reading, writing, and listening comprehension.',
      type: 'PDF',
      url: '',
      language: 'PORTUGUESE',
      level: 'A2',
      assignedStudentId: 'std-2',
      uploadedAt: '2026-11-05T11:00:00Z',
    },
    {
      id: 'mat-5',
      title: 'Business English Negotiation Masterclass Video',
      description: '15-minute breakdown of diplomatic phrasing, counter-offers, and closing agreements in English.',
      type: 'VIDEO',
      url: '',
      language: 'ENGLISH',
      level: 'B2-C2',
      assignedStudentId: 'ALL',
      uploadedAt: '2026-11-08T16:20:00Z',
    },
  ]
}

if (!globalStore._adminHomework) {
  globalStore._adminHomework = [
    {
      id: 'hw-1',
      title: 'Write a Workplace Introduction Email in Portuguese',
      instructions: 'Draft a 150-word formal email introducing yourself to your new team at a Portuguese company.',
      studentId: 'std-2',
      studentName: 'James Harrington',
      language: 'PORTUGUESE',
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      status: 'ASSIGNED',
      assignedAt: '2026-11-10T11:00:00Z',
    },
    {
      id: 'hw-2',
      title: 'Patient Clinical History Summary in English',
      instructions: 'Summarize a complex cardiology case in English following standard NHS/International SOAP format.',
      studentId: 'std-3',
      studentName: 'Ana Beatriz Santos',
      language: 'ENGLISH',
      dueDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      status: 'SUBMITTED',
      submissionText: 'The patient presents with intermittent angina pectoris over the past 3 weeks...',
      submittedAt: '2026-11-11T18:40:00Z',
      assignedAt: '2026-11-06T10:00:00Z',
    },
    {
      id: 'hw-3',
      title: 'Everyday Restaurant & Market Ordering Practice',
      instructions: 'Record 5 short audio dialogues or write sentences asking for bill, specific ingredients, and table reservations.',
      studentId: 'std-1',
      studentName: 'Maria Silva',
      language: 'PORTUGUESE',
      dueDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      status: 'GRADED',
      submissionText: '1. "Queria uma mesa para dois, por favor." 2. "A conta, por favor."',
      submittedAt: '2026-11-07T12:00:00Z',
      grade: '95/100 (A)',
      feedback: 'Muito bem Maria! Perfect formal usage of the conditional "queria" instead of "quero".',
      assignedAt: '2026-11-02T09:00:00Z',
    },
  ]
}

if (!globalStore._adminAuditLogs) {
  globalStore._adminAuditLogs = []
} else {
  // Remove legacy demo events that may remain in a hot-reloaded development process.
  globalStore._adminAuditLogs = globalStore._adminAuditLogs.filter(
    (log) => !['aud-1', 'aud-2', 'aud-3'].includes(log.id)
  )
}
// ────────────────────────────────────────────────────────────
// Audit Logging Helper
// ────────────────────────────────────────────────────────────

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  adminEmail: string = 'khanasad4244@gmail.com'
): Promise<AuditLogRecord> {
  const log: AuditLogRecord = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    adminEmail,
    action,
    entityType,
    entityId,
    details,
  }
  globalStore._adminAuditLogs!.unshift(log)
  if (globalStore._adminAuditLogs!.length > 200) {
    globalStore._adminAuditLogs!.pop()
  }
  return log
}

export async function getAuditLogs(): Promise<AuditLogRecord[]> {
  return [...globalStore._adminAuditLogs!]
}

export async function deleteAuditLog(id: string): Promise<boolean> {
  const logs = globalStore._adminAuditLogs!
  const index = logs.findIndex((log) => log.id === id)
  if (index < 0) return false
  logs.splice(index, 1)
  return true
}

export async function clearAuditLogs(): Promise<void> {
  globalStore._adminAuditLogs = []
}

// ────────────────────────────────────────────────────────────
// Admin Profile & Notifications API
// ────────────────────────────────────────────────────────────

export async function getAdminProfile(): Promise<AdminProfile> {
  return { ...globalStore._adminProfile! }
}

export async function updateAdminProfile(data: Partial<AdminProfile>): Promise<AdminProfile> {
  globalStore._adminProfile = {
    ...globalStore._adminProfile!,
    ...data,
  }
  await logAuditEvent('UPDATE_ADMIN_PROFILE', 'ADMIN', 'admin-master', `Updated profile fields: ${Object.keys(data).join(', ')}`)
  return { ...globalStore._adminProfile }
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  return [...globalStore._adminNotifications!]
}

export async function markAdminNotificationAsRead(id: string): Promise<boolean> {
  const item = globalStore._adminNotifications!.find((n) => n.id === id)
  if (item) {
    item.read = true
    return true
  }
  return false
}

export async function markAllAdminNotificationsAsRead(): Promise<boolean> {
  globalStore._adminNotifications!.forEach((n) => {
    n.read = true
  })
  return true
}

export async function clearAdminNotifications(): Promise<boolean> {
  globalStore._adminNotifications = []
  return true
}

// ────────────────────────────────────────────────────────────
// Overview API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminOverviewData() {
  const students = globalStore._adminStudents!
  const bookings = globalStore._adminBookings!
  const assessments = globalStore._adminAssessments!
  const payments = globalStore._adminPayments!

  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0)

  const upcomingCount = bookings.filter((b) => b.status === 'CONFIRMED').length
  const pendingCount =
    assessments.filter((a) => a.status === 'NEW').length +
    bookings.filter((b) => b.status === 'PENDING_PAYMENT').length

  return {
    totalStudents: students.length,
    newStudents: 2,
    upcomingLessons: upcomingCount,
    pendingActions: pendingCount,
    monthlyRevenue: totalRevenue,
    totalRevenue: totalRevenue + 1840,
    recentAssessments: assessments.slice(0, 5),
    upcomingBookings: bookings.filter((b) => b.status === 'CONFIRMED').slice(0, 5),
  }
}

// ────────────────────────────────────────────────────────────
// Student Management API Methods
// ────────────────────────────────────────────────────────────

export async function findStudentByEmail(email: string): Promise<StudentRecord | null> {
  const norm = email.trim().toLowerCase()
  const list = globalStore._adminStudents ?? []
  const s = list.find((item) => item.email.trim().toLowerCase() === norm)
  return s ? { ...s } : null
}

export async function findStudentById(id: string): Promise<StudentRecord | null> {
  const student = (globalStore._adminStudents ?? []).find((item) => item.id === id)
  return student ? { ...student } : null
}

export async function registerStudentAccount(data: {
  name: string
  email: string
  phone?: string
  preferredLanguage?: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  passwordHash: string
}): Promise<StudentRecord> {
  const norm = data.email.trim().toLowerCase()
  const list = globalStore._adminStudents ?? []
  const existing = list.find((s) => s.email.trim().toLowerCase() === norm)
  if (existing) {
    throw new Error('An account with this email already exists')
  }
  let id = `std-${Date.now()}`
  const newStudent: StudentRecord = {
    id,
    name: data.name,
    email: norm,
    phone: data.phone || '+351 900 000 000',
    preferredLanguage: data.preferredLanguage || 'PORTUGUESE',
    currentLevel: 'A1 — Beginner',
    cefrLevel: 'A1',
    lessonsCompleted: 0,
    lessonBalance: 5,
    status: 'ACTIVE',
    joinedAt: new Date().toISOString().split('T')[0],
    assignedCourses: ['European Portuguese Starter Course'],
    passwordHash: data.passwordHash,
    attendance: { attended: 0, absent: 0, late: 0 },
  }
  globalStore._adminStudents = globalStore._adminStudents || []
  globalStore._adminStudents.unshift(newStudent)
  return newStudent
}

export async function getAdminStudents(search?: string, languageFilter?: string, statusFilter?: string) {
  const syncIsStale = !globalStore._adminStudentsSyncedAt || Date.now() - globalStore._adminStudentsSyncedAt > 15_000
  if (syncIsStale) {
    try {
      const users = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          studentProfile: { select: { currentLevel: true, phone: true, preferredLanguage: true, notes: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      const syncedEmails = new Set<string>()
      for (const user of users) {
        const emailKey = user.email.trim().toLowerCase()
        if (syncedEmails.has(emailKey)) continue
        syncedEmails.add(emailKey)
        const previous = globalStore._adminStudents!.find((student) => student.email.trim().toLowerCase() === emailKey)
        const currentLevel = user.studentProfile?.currentLevel ?? previous?.currentLevel ?? ''
        const cefrLevel = (currentLevel.match(/\b(A1|A2|B1|B2|C1|C2)\b/)?.[1] as StudentRecord['cefrLevel'] | undefined) ?? previous?.cefrLevel ?? 'A1'
        const record: StudentRecord = {
          id: user.id,
          name: user.name,
          email: user.email.trim().toLowerCase(),
          phone: user.studentProfile?.phone ?? previous?.phone ?? '',
          preferredLanguage: user.studentProfile?.preferredLanguage ?? previous?.preferredLanguage ?? 'PORTUGUESE',
          currentLevel,
          cefrLevel,
          lessonsCompleted: previous?.lessonsCompleted ?? 0,
          lessonBalance: previous?.lessonBalance ?? 0,
          status: user.isActive ? 'ACTIVE' : 'DEACTIVATED',
          joinedAt: user.createdAt.toISOString().slice(0, 10),
          assignedCourses: previous?.assignedCourses ?? [],
          inviteToken: previous?.inviteToken,
          inviteUrl: previous?.inviteUrl,
          tempPassword: previous?.tempPassword,
          passwordHash: previous?.passwordHash,
          notes: user.studentProfile?.notes ?? previous?.notes ?? '',
          attendance: previous?.attendance ?? { attended: 0, absent: 0, late: 0 },
        }
        const index = globalStore._adminStudents!.findIndex((student) => student.email.trim().toLowerCase() === emailKey)
        if (index >= 0) globalStore._adminStudents![index] = record
        else globalStore._adminStudents!.unshift(record)
      }
      globalStore._adminStudentsSyncedAt = Date.now()
    } catch {
      // Keep the in-memory list available when the database is offline.
      // Avoid repeating a failed connection attempt on every navigation.
      globalStore._adminStudentsSyncedAt = Date.now()
    }
  }

  // Seed data, database rows, and legacy in-memory accounts can share an email.
  // Use one canonical email key so a learner is only shown once.
  const uniqueStudents = new Map<string, StudentRecord>()
  for (const student of globalStore._adminStudents!) {
    const key = student.email.trim().toLowerCase()
    if (!uniqueStudents.has(key)) uniqueStudents.set(key, student)
  }
  let list = [...uniqueStudents.values()]
  if (search) {
    const q = search.toLowerCase()
    list = list.filter((student) => student.name.toLowerCase().includes(q) || student.email.toLowerCase().includes(q))
  }
  if (languageFilter && languageFilter !== 'ALL') list = list.filter((student) => student.preferredLanguage === languageFilter)
  if (statusFilter && statusFilter !== 'ALL') list = list.filter((student) => student.status === statusFilter)
  return list
}

export async function addAdminStudent(data: {
  name: string
  email: string
  phone: string
  preferredLanguage: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  currentLevel: string
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  status?: 'ACTIVE' | 'INACTIVE'
  lessonBalance?: number
  password?: string
  notes?: string
}) {
  const normEmail = data.email.trim().toLowerCase()
  if (!normEmail || !data.name.trim()) {
    throw Object.assign(new Error('Name and email are required'), { statusCode: 400 })
  }

  const existingInMemory = globalStore._adminStudents!.find(
    (student) => student.email.trim().toLowerCase() === normEmail
  )
  if (existingInMemory) {
    throw Object.assign(new Error('A student account with this email already exists'), { statusCode: 409 })
  }

  let id = `std-${Date.now()}`
  const inviteToken = `inv_${Math.random().toString(36).substring(2, 10)}`
  const plainPassword =
    data.password && data.password.trim().length > 0
      ? data.password.trim()
      : `WorkSpeak@${Math.floor(1000 + Math.random() * 9000)}!`

  if (
    plainPassword.length < 8 ||
    plainPassword.length > 72 ||
    !/[A-Z]/.test(plainPassword) ||
    !/[a-z]/.test(plainPassword) ||
    !/[0-9]/.test(plainPassword)
  ) {
    throw Object.assign(
      new Error('Password must be 8-72 characters and include uppercase, lowercase, and a number'),
      { statusCode: 400 }
    )
  }

  const passwordHash = await hashPassword(plainPassword)

  const newStudent: StudentRecord = {
    id,
    name: data.name.trim(),
    email: normEmail,
    phone: data.phone || '+351 900 000 000',
    preferredLanguage: data.preferredLanguage,
    currentLevel: data.currentLevel || 'A1 — Beginner',
    cefrLevel: data.cefrLevel || 'A1',
    lessonsCompleted: 0,
    lessonBalance: data.lessonBalance ?? 10,
    status: data.status || 'ACTIVE',
    joinedAt: new Date().toISOString().split('T')[0],
    assignedCourses: [
      data.preferredLanguage === 'PORTUGUESE'
        ? 'European Portuguese Starter Course'
        : data.preferredLanguage === 'ENGLISH'
        ? 'Professional Business English Course'
        : 'Dual-Track Portuguese & English Masterclass',
    ],
    inviteToken,
    inviteUrl: `${process.env.APP_URL ?? 'http://localhost:3000'}/login`,
    tempPassword: plainPassword,
    passwordHash,
    notes: data.notes || '',
    attendance: { attended: 0, absent: 0, late: 0 },
  }

  // Persist to Prisma database
  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normEmail, mode: 'insensitive' } },
      select: { id: true },
    })

    if (existing) {
      throw Object.assign(new Error('A student account with this email already exists'), { statusCode: 409 })
    } else {
      const dbStudent = await prisma.user.create({
        data: {
          email: normEmail,
          name: newStudent.name,
          passwordHash,
          role: 'STUDENT',
          studentProfile: {
            create: {
              phone: newStudent.phone,
              preferredLanguage: newStudent.preferredLanguage,
              currentLevel: newStudent.currentLevel,
            },
          },
        },
        select: { id: true },
      })
      // Keep the admin record linked to the same database ID used by the student session.
      id = dbStudent.id
      newStudent.id = dbStudent.id
    }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'statusCode' in err) {
      throw err
    }
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002') {
      throw Object.assign(new Error('A student account with this email already exists'), { statusCode: 409 })
    }
    // Database fallback to memory store
  }

  // Upsert in memory store
  const existingInMemoryIdx = globalStore._adminStudents!.findIndex(
    (s) => s.email.toLowerCase() === normEmail
  )
  if (existingInMemoryIdx !== -1) {
    globalStore._adminStudents![existingInMemoryIdx] = {
      ...globalStore._adminStudents![existingInMemoryIdx],
      ...newStudent,
    }
  } else {
    globalStore._adminStudents!.unshift(newStudent)
  }

  await logAuditEvent(
    'ADD_STUDENT',
    'STUDENT',
    id,
    `Enrolled student ${newStudent.name} (${newStudent.email}) with login credentials.`
  )
  return newStudent
}

export async function updateAdminStudent(id: string, data: Partial<StudentRecord>) {
  const idx = globalStore._adminStudents!.findIndex((s) => s.id === id)
  if (idx !== -1) {
    globalStore._adminStudents![idx] = {
      ...globalStore._adminStudents![idx],
      ...data,
    }
    try {
      const updated = globalStore._adminStudents![idx]
      await prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email.trim().toLowerCase() } : {}),
          studentProfile: {
            upsert: {
              create: {
                phone: updated.phone || null,
                preferredLanguage: updated.preferredLanguage,
                currentLevel: updated.currentLevel,
              },
              update: {
                ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
                ...(data.preferredLanguage !== undefined ? { preferredLanguage: data.preferredLanguage } : {}),
                ...(data.currentLevel !== undefined ? { currentLevel: data.currentLevel } : {}),
              },
            },
          },
        },
      })
    } catch {
      // Legacy seeded students may not have a corresponding database row.
    }
    await logAuditEvent('UPDATE_STUDENT', 'STUDENT', id, `Updated student details: ${Object.keys(data).join(', ')}`)
    return globalStore._adminStudents![idx]
  }
  return null
}

export async function deactivateAdminStudent(id: string) {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    student.status = 'DEACTIVATED'
    try {
      await prisma.user.updateMany({
        where: { email: student.email.trim().toLowerCase(), role: 'STUDENT' },
        data: { isActive: false },
      })
    } catch {}
    await logAuditEvent('DEACTIVATE_STUDENT', 'STUDENT', id, `Deactivated account for ${student.name}`)
    return student
  }
  return null
}

export async function restoreAdminStudent(id: string) {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    student.status = 'ACTIVE'
    try {
      await prisma.user.updateMany({
        where: { email: student.email.trim().toLowerCase(), role: 'STUDENT' },
        data: { isActive: true },
      })
    } catch {}
    await logAuditEvent('RESTORE_STUDENT', 'STUDENT', id, `Restored account to ACTIVE for ${student.name}`)
    return student
  }
  return null
}

export async function deleteAdminStudent(id: string) {
  const idx = globalStore._adminStudents!.findIndex((s) => s.id === id)
  if (idx !== -1) {
    const deleted = globalStore._adminStudents!.splice(idx, 1)[0]
    await logAuditEvent('DELETE_STUDENT', 'STUDENT', id, `Deleted student ${deleted.name} (${deleted.email})`)
    return true
  }
  return false
}

export async function generateStudentInvite(id: string) {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    const inviteToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const tempPassword = `WorkSpeak@${Math.floor(1000 + Math.random() * 9000)}!`
    const passwordHash = await hashPassword(tempPassword)
    student.inviteToken = inviteToken
    student.inviteUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/login`
    student.tempPassword = tempPassword
    student.passwordHash = passwordHash

    try {
      const existing = await prisma.user.findUnique({
        where: { email: student.email.trim().toLowerCase() },
        select: { id: true },
      })
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash, role: 'STUDENT', isActive: true },
        })
      } else {
        await prisma.user.create({
          data: {
            email: student.email.trim().toLowerCase(),
            name: student.name,
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
              create: {
                phone: student.phone,
                preferredLanguage: student.preferredLanguage,
                currentLevel: student.currentLevel,
              },
            },
          },
        })
      }
    } catch {}

    await logAuditEvent('GENERATE_INVITE', 'STUDENT', id, `Generated secure invite token and temporary credentials for ${student.name}`)
    return {
      inviteToken: student.inviteToken,
      inviteUrl: student.inviteUrl,
      tempPassword: student.tempPassword,
      email: student.email,
    }
  }
  return null
}

export async function resetStudentPassword(id: string, newPassword?: string) {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    const tempPass =
      newPassword && newPassword.trim().length > 0
        ? newPassword.trim()
        : `WorkSpeak@${Math.floor(1000 + Math.random() * 9000)}!`

    const passwordHash = await hashPassword(tempPass)

    // Reset credentials for the existing account only. Never create a user from
    // this action; account creation belongs to the enrollment flow.
    let existing: { id: string } | null = null
    try {
      const normEmail = student.email.trim().toLowerCase()
      existing = await prisma.user.findFirst({
        where: { email: { equals: normEmail, mode: 'insensitive' }, role: 'STUDENT' },
        select: { id: true },
      })
    } catch {
      if (process.env.DATABASE_URL) {
        throw Object.assign(new Error('Could not update the student account. Please try again.'), { statusCode: 503 })
      }
    }

    if (process.env.DATABASE_URL && !existing) {
      throw Object.assign(new Error('Student account not found. Enroll the student before resetting access.'), { statusCode: 404 })
    }

    if (existing) {
      try {
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash, isActive: true },
        })
        await invalidateAllUserSessions(existing.id)
      } catch {
        if (process.env.DATABASE_URL) {
          throw Object.assign(new Error('Could not update the student account. Please try again.'), { statusCode: 503 })
        }
      }
    }

    student.tempPassword = tempPass
    student.passwordHash = passwordHash

    await logAuditEvent(
      'RESET_STUDENT_PASSWORD',
      'STUDENT',
      id,
      `Updated login credentials for ${student.name} (${student.email})`
    )
    return {
      success: true,
      tempPassword: tempPass,
      email: student.email,
      name: student.name,
      inviteUrl: `${process.env.APP_URL ?? 'http://localhost:3000'}/login`,
    }
  }
  return null
}

export async function assignStudentCourses(id: string, courses: string[], cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    student.assignedCourses = courses
    if (cefrLevel) {
      student.cefrLevel = cefrLevel
      student.currentLevel = `${cefrLevel} — Certified Track`
      await prisma.studentProfile.upsert({
        where: { userId: id },
        create: { userId: id, preferredLanguage: student.preferredLanguage, phone: student.phone || null, currentLevel: student.currentLevel },
        update: { currentLevel: student.currentLevel },
      })
    }
    await logAuditEvent('ASSIGN_COURSES', 'STUDENT', id, `Updated curriculum courses: [${courses.join(', ')}] with CEFR ${student.cefrLevel}`)
    return student
  }
  return null
}

export async function adjustStudentLessonBalance(id: string, delta: number, reason: string) {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    student.lessonBalance = Math.max(0, student.lessonBalance + delta)
    await logAuditEvent('ADJUST_BALANCE', 'STUDENT', id, `Adjusted lesson balance by ${delta > 0 ? '+' : ''}${delta}. New balance: ${student.lessonBalance}. Reason: ${reason}`)
    return student
  }
  return null
}

// ────────────────────────────────────────────────────────────
// Class & Schedule Management API Methods
// ────────────────────────────────────────────────────────────

async function getDatabaseAdminId(): Promise<string> {
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } })
  if (existingAdmin) return existingAdmin.id

  const profile = globalStore._adminProfile!
  const email = (process.env.ADMIN_EMAIL ?? profile.email).trim().toLowerCase()
  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD ?? profile.password ?? `${Date.now()}-system-admin`)
  const admin = await prisma.user.create({
    data: { email, name: profile.name || 'Administrator', passwordHash, role: 'ADMIN', isActive: true },
    select: { id: true },
  })
  return admin.id
}

function toAdminBookingRecord(booking: any): BookingRecord {
  return {
    id: booking.id,
    studentName: booking.student.name,
    studentEmail: booking.student.email,
    tutorName: booking.tutor.name,
    serviceName: booking.service.name,
    language: booking.service.language === 'ENGLISH' ? 'ENGLISH' : 'PORTUGUESE',
    deliveryMode: booking.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE',
    startAt: booking.startAt.toISOString(),
    durationMinutes: booking.service.durationMinutes,
    price: Number(booking.payment?.amount ?? booking.service.price),
    status: booking.status === 'PENDING_PAYMENT' ? 'PENDING_PAYMENT' : booking.status === 'COMPLETED' ? 'COMPLETED' : booking.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
    meetingLink: booking.meetingLink ?? undefined,
    attendanceStatus: booking.lesson?.attendanceStatus === 'PRESENT' || booking.lesson?.attendanceStatus === 'ABSENT' || booking.lesson?.attendanceStatus === 'LATE' ? booking.lesson.attendanceStatus : undefined,
    lessonNotes: booking.lesson?.topic ?? undefined,
    tutorFeedback: booking.lesson?.studentFeedback ?? undefined,
  }
}

async function getOrCreateBookingService(data: {
  serviceName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  deliveryMode: 'ONLINE' | 'IN_PERSON'
  durationMinutes: number
  price: number
}) {
  const existing = await prisma.service.findFirst({
    where: { name: data.serviceName, language: data.language, durationMinutes: data.durationMinutes, deliveryMode: data.deliveryMode },
  })
  if (existing) return prisma.service.update({ where: { id: existing.id }, data: { price: data.price, isActive: true } })

  const baseSlug = `${data.serviceName.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}-${data.language.toLowerCase()}-${data.durationMinutes}`.replace(/^-|-$/g, '')
  return prisma.service.create({
    data: {
      name: data.serviceName,
      slug: `${baseSlug}-${Date.now()}`,
      language: data.language,
      deliveryMode: data.deliveryMode,
      durationMinutes: data.durationMinutes,
      price: data.price,
      currency: 'EUR',
      isActive: true,
    },
  })
}

export async function getAdminBookings(statusFilter?: string) {
  let list: BookingRecord[]
  try {
    const rows = await prisma.booking.findMany({
      include: { student: true, tutor: true, service: true, lesson: true, payment: true },
      orderBy: { startAt: 'desc' },
    })
    list = rows.map(toAdminBookingRecord)
  } catch {
    list = [...globalStore._adminBookings!]
  }
  if (statusFilter && statusFilter !== 'ALL') {
    list = list.filter((b) => b.status === statusFilter)
  }
  return list
}

export async function createAdminBooking(data: {
  studentName: string
  studentEmail: string
  serviceName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  deliveryMode: 'ONLINE' | 'IN_PERSON'
  durationMinutes: number
  price: number
  startAt?: string
  meetingLink?: string
}) {
  const student = await prisma.user.findUnique({ where: { email: data.studentEmail.trim().toLowerCase() }, select: { id: true, name: true, email: true, role: true } })
  if (!student || student.role !== 'STUDENT') {
    throw Object.assign(new Error('Create a student account before scheduling a class.'), { statusCode: 404 })
  }
  const service = await getOrCreateBookingService(data)
  const tutorId = await getDatabaseAdminId()
  const startAt = data.startAt ? new Date(data.startAt) : new Date(Date.now() + 24 * 3600 * 1000)
  if (!Number.isFinite(startAt.getTime())) throw Object.assign(new Error('Choose a valid class time.'), { statusCode: 400 })
  const row = await prisma.booking.create({
    data: {
      studentId: student.id,
      tutorId,
      serviceId: service.id,
      startAt,
      endAt: new Date(startAt.getTime() + service.durationMinutes * 60_000),
      deliveryMode: data.deliveryMode,
      status: 'CONFIRMED',
      meetingLink: data.deliveryMode === 'ONLINE' ? (data.meetingLink || null) : null,
    },
    include: { student: true, tutor: true, service: true, lesson: true, payment: true },
  })
  const created = toAdminBookingRecord(row)
  globalStore._adminBookings!.unshift(created)
  await logAuditEvent('CREATE_BOOKING', 'BOOKING', created.id, 'Scheduled class for ' + student.name + ' (' + created.serviceName + ')')
  return created
}

export async function updateAdminBooking(id: string, data: Partial<BookingRecord>) {
  const current = await prisma.booking.findUnique({ where: { id }, include: { student: true, service: true } })
  if (!current) return null
  let studentId = current.studentId
  if (data.studentEmail && data.studentEmail.trim().toLowerCase() !== current.student.email.toLowerCase()) {
    const student = await prisma.user.findUnique({ where: { email: data.studentEmail.trim().toLowerCase() }, select: { id: true, role: true } })
    if (!student || student.role !== 'STUDENT') throw Object.assign(new Error('Student account not found.'), { statusCode: 404 })
    studentId = student.id
  }
  const service = data.serviceName || data.language || data.deliveryMode || data.durationMinutes !== undefined || data.price !== undefined
    ? await getOrCreateBookingService({
        serviceName: data.serviceName ?? current.service.name,
        language: data.language ?? (current.service.language === 'ENGLISH' ? 'ENGLISH' : 'PORTUGUESE'),
        deliveryMode: data.deliveryMode ?? (current.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE'),
        durationMinutes: data.durationMinutes ?? current.service.durationMinutes,
        price: data.price ?? Number(current.service.price),
      })
    : current.service
  const startAt = data.startAt ? new Date(data.startAt) : current.startAt
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      studentId,
      serviceId: service.id,
      startAt,
      endAt: new Date(startAt.getTime() + service.durationMinutes * 60_000),
      ...(data.meetingLink !== undefined ? { meetingLink: data.meetingLink || null } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
    include: { student: true, tutor: true, service: true, lesson: true, payment: true },
  })
  const result = toAdminBookingRecord(updated)
  const idx = globalStore._adminBookings!.findIndex((booking) => booking.id === id)
  if (idx >= 0) globalStore._adminBookings![idx] = result
  await logAuditEvent('UPDATE_BOOKING', 'BOOKING', id, 'Updated class details: ' + Object.keys(data).join(', '))
  return result
}

export async function updateAdminBookingStatus(id: string, status: BookingRecord['status']) {
  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { student: true, tutor: true, service: true, lesson: true, payment: true },
  }).catch(() => null)
  if (!updated) return null
  const result = toAdminBookingRecord(updated)
  const idx = globalStore._adminBookings!.findIndex((booking) => booking.id === id)
  if (idx >= 0) globalStore._adminBookings![idx] = result
  await logAuditEvent('UPDATE_BOOKING_STATUS', 'BOOKING', id, 'Changed booking status to ' + status)
  return result
}

export async function updateMeetingLink(id: string, meetingLink: string) {
  const updated = await prisma.booking.update({
    where: { id },
    data: { meetingLink },
    include: { student: true, tutor: true, service: true, lesson: true, payment: true },
  }).catch(() => null)
  if (!updated) return null
  const result = toAdminBookingRecord(updated)
  const idx = globalStore._adminBookings!.findIndex((booking) => booking.id === id)
  if (idx >= 0) globalStore._adminBookings![idx] = result
  await logAuditEvent('UPDATE_MEETING_LINK', 'BOOKING', id, 'Updated online meeting link')
  return result
}

export async function recordAttendance(
  id: string,
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE',
  lessonNotes?: string,
  tutorFeedback?: string
) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: { student: true } })
  if (!booking) return null
  const adminId = await getDatabaseAdminId()
  await prisma.lesson.upsert({
    where: { bookingId: id },
    create: {
      bookingId: id,
      tutorId: booking.tutorId,
      studentId: booking.studentId,
      attendanceStatus,
      attendanceMarkedBy: adminId,
      attendanceMarkedAt: new Date(),
      completedAt: attendanceStatus === 'PRESENT' ? new Date() : null,
      topic: lessonNotes,
      studentFeedback: tutorFeedback,
    },
    update: {
      attendanceStatus,
      attendanceMarkedBy: adminId,
      attendanceMarkedAt: new Date(),
      completedAt: attendanceStatus === 'PRESENT' ? new Date() : null,
      ...(lessonNotes !== undefined ? { topic: lessonNotes } : {}),
      ...(tutorFeedback !== undefined ? { studentFeedback: tutorFeedback } : {}),
    },
  })
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: attendanceStatus === 'PRESENT' ? 'COMPLETED' : undefined },
    include: { student: true, tutor: true, service: true, lesson: true, payment: true },
  })
  const result = toAdminBookingRecord(updated)
  const idx = globalStore._adminBookings!.findIndex((item) => item.id === id)
  if (idx >= 0) globalStore._adminBookings![idx] = result
  await logAuditEvent('RECORD_ATTENDANCE', 'BOOKING', id, 'Recorded attendance ' + attendanceStatus + ' for ' + booking.student.name)
  return result
}

export async function deleteAdminBooking(id: string) {
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED', cancelledBy: await getDatabaseAdminId(), cancelledAt: new Date() },
    include: { student: true, tutor: true, service: true, lesson: true, payment: true },
  }).catch(() => null)
  if (!updated) return false
  globalStore._adminBookings = globalStore._adminBookings!.filter((booking) => booking.id !== id)
  await logAuditEvent('DELETE_BOOKING', 'BOOKING', id, 'Cancelled booking for ' + updated.student.name)
  return true
}

export function addAssessmentToAdminStore(data: {
  id: string
  name: string
  email: string
  phone?: string | null
  language: string
  deliveryMode: string
  currentLevel?: string | null
  learningGoals?: string | null
  message?: string | null
  status?: string
}) {
  const rec: AssessmentRecord = {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    language: data.language as any,
    deliveryMode: data.deliveryMode as any,
    currentLevel: data.currentLevel || 'A1 — Beginner',
    learningGoals: data.learningGoals || data.message || 'General Fluency & Workplace Portuguese/English',
    message: data.message || undefined,
    status: (data.status as any) || 'NEW',
    createdAt: new Date().toISOString().split('T')[0],
  }
  if (!globalStore._adminAssessments) globalStore._adminAssessments = []
  globalStore._adminAssessments.unshift(rec)

  if (!globalStore._adminNotifications) globalStore._adminNotifications = []
  globalStore._adminNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Assessment Request',
    message: `${data.name} submitted an inquiry for ${data.language}`,
    type: 'ASSESSMENT',
    timestamp: 'Just now',
    read: false,
    link: '/management/assessments',
  })
}

export async function getAdminAssessments(statusFilter?: string) {
  // Sync with Prisma database to load all guest inquiries
  try {
    const dbAssessments = await prisma.assessmentRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })

    if (dbAssessments && dbAssessments.length > 0) {
      if (!globalStore._adminAssessments) globalStore._adminAssessments = []

      for (const a of dbAssessments) {
        const existingIdx = globalStore._adminAssessments.findIndex(
          (x) => x.id === a.id || (x.email.toLowerCase() === a.email.toLowerCase() && x.name === a.name)
        )

        const rec: AssessmentRecord = {
          id: a.id,
          name: a.name,
          email: a.email,
          phone: a.phone || '',
          language: a.language as any,
          deliveryMode: a.deliveryMode as any,
          currentLevel: a.currentLevel || 'A1 — Beginner',
          learningGoals: a.learningGoals || a.message || 'General Fluency & Workplace Language',
          message: a.message || undefined,
          status: a.status as any,
          createdAt: a.createdAt ? a.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          recommendedLevel: a.internalNotes || undefined,
        }

        if (existingIdx !== -1) {
          globalStore._adminAssessments[existingIdx] = {
            ...globalStore._adminAssessments[existingIdx],
            ...rec,
          }
        } else {
          globalStore._adminAssessments.unshift(rec)
        }
      }
    }
  } catch (err) {
    // Database fallback
  }

  let list = [...(globalStore._adminAssessments ?? [])]
  if (statusFilter && statusFilter !== 'ALL') {
    list = list.filter((a) => a.status === statusFilter)
  }
  return list
}

export async function updateAdminAssessmentStatus(
  id: string,
  status: AssessmentRecord['status'],
  recommendedLevel?: string,
  evaluationNotes?: string
) {
  try {
    await prisma.assessmentRequest.update({
      where: { id },
      data: {
        status: status as any,
        internalNotes: recommendedLevel || evaluationNotes || undefined,
      },
    })
  } catch (err) {
    // Database fallback
  }

  const item = globalStore._adminAssessments!.find((a) => a.id === id)
  if (item) {
    item.status = status
    if (recommendedLevel) item.recommendedLevel = recommendedLevel
    if (evaluationNotes) item.evaluationNotes = evaluationNotes
    await logAuditEvent(
      'UPDATE_ASSESSMENT',
      'ASSESSMENT',
      id,
      `Updated assessment status to ${status} (Level: ${recommendedLevel || 'N/A'})`
    )
    return item
  }
  return null
}

export async function addAdminAssessment(data: Omit<AssessmentRecord, 'id' | 'createdAt'>) {
  const newAssessment: AssessmentRecord = {
    ...data,
    id: `asm-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  }
  if (!globalStore._adminAssessments) globalStore._adminAssessments = []
  globalStore._adminAssessments.unshift(newAssessment)
  await logAuditEvent('ADD_ASSESSMENT', 'ASSESSMENT', newAssessment.id, `Created assessment for ${newAssessment.name}`)
  return newAssessment
}

export async function updateAdminAssessment(id: string, data: Partial<AssessmentRecord>) {
  const item = globalStore._adminAssessments!.find((a) => a.id === id)
  if (item) {
    Object.assign(item, data)
    await logAuditEvent('UPDATE_ASSESSMENT', 'ASSESSMENT', id, `Edited assessment inquiry for ${item.name}`)
    return item
  }
  return null
}

export async function deleteAdminAssessment(id: string) {
  const idx = globalStore._adminAssessments!.findIndex((a) => a.id === id)
  if (idx !== -1) {
    const deleted = globalStore._adminAssessments!.splice(idx, 1)[0]
    await logAuditEvent('DELETE_ASSESSMENT', 'ASSESSMENT', id, `Deleted assessment inquiry of ${deleted.name}`)
    return true
  }
  return false
}

// ────────────────────────────────────────────────────────────
// Payments API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminPayments() {
  return [...globalStore._adminPayments!]
}

export async function addAdminPayment(data: Omit<PaymentRecord, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }) {
  const id = `pay-${Date.now()}`
  const newPayment: PaymentRecord = {
    ...data,
    id,
    currency: data.currency || 'EUR',
    invoiceNumber: data.invoiceNumber || `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  }
  if (!globalStore._adminPayments) globalStore._adminPayments = []
  globalStore._adminPayments.unshift(newPayment)
  await logAuditEvent('ADD_PAYMENT', 'PAYMENT', id, `Recorded payment of €${newPayment.amount} for ${newPayment.studentName}`)
  return newPayment
}

export async function updateAdminPayment(id: string, data: Partial<PaymentRecord>) {
  const item = globalStore._adminPayments!.find((p) => p.id === id)
  if (item) {
    Object.assign(item, data)
    await logAuditEvent('UPDATE_PAYMENT', 'PAYMENT', id, `Updated payment record ${item.invoiceNumber || id}`)
    return item
  }
  return null
}

export async function deleteAdminPayment(id: string) {
  const idx = globalStore._adminPayments!.findIndex((p) => p.id === id)
  if (idx !== -1) {
    const deleted = globalStore._adminPayments!.splice(idx, 1)[0]
    await logAuditEvent('DELETE_PAYMENT', 'PAYMENT', id, `Deleted payment record ${deleted.invoiceNumber || id} (€${deleted.amount})`)
    return true
  }
  return false
}

// ────────────────────────────────────────────────────────────
// Learning Materials Management API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminMaterials() {
  try {
    const rows = await prisma.learningMaterial.findMany({ include: { accessGrants: { take: 1 } }, orderBy: { createdAt: 'desc' } })
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      type: row.mimeType === 'application/pdf' ? 'PDF' : row.mimeType.startsWith('audio/') ? 'AUDIO' : row.mimeType.startsWith('video/') ? 'VIDEO' : row.mimeType === 'application/vnd.workspeak.worksheet' ? 'WORKSHEET' : 'LINK',
      url: row.fileKey,
      language: row.language ?? 'BOTH',
      level: '',
      assignedStudentId: row.isPublic ? 'ALL' : row.accessGrants[0]?.studentId ?? '',
      uploadedAt: row.createdAt.toISOString(),
    } satisfies LearningMaterialRecord))
  } catch {
    return [...globalStore._adminMaterials!]
  }
}

export async function addAdminMaterial(data: Omit<LearningMaterialRecord, 'id' | 'uploadedAt'>) {
  const uploadedById = await getDatabaseAdminId()
  const isPublic = !data.assignedStudentId || data.assignedStudentId === 'ALL'
  const assignedStudentId = data.assignedStudentId
  const mimeType = data.type === 'PDF' ? 'application/pdf' : data.type === 'AUDIO' ? 'audio/mpeg' : data.type === 'VIDEO' ? 'video/mp4' : data.type === 'WORKSHEET' ? 'application/vnd.workspeak.worksheet' : 'text/uri-list'
  const row = await prisma.learningMaterial.create({
    data: {
      uploadedById,
      title: data.title,
      description: data.description,
      fileKey: data.url,
      fileSize: 0,
      mimeType,
      language: data.language,
      isPublic,
      ...(!isPublic && assignedStudentId ? { accessGrants: { create: { student: { connect: { id: assignedStudentId } } } } } : {}),
    },
    include: { accessGrants: { take: 1 } },
  })
  const created: LearningMaterialRecord = {
    id: row.id, title: row.title, description: row.description ?? '', type: data.type, url: row.fileKey,
    language: row.language ?? 'BOTH', level: data.level, assignedStudentId: row.isPublic ? 'ALL' : row.accessGrants[0]?.studentId ?? '', uploadedAt: row.createdAt.toISOString(),
  }
  globalStore._adminMaterials!.unshift(created)
  await logAuditEvent('ADD_MATERIAL', 'MATERIAL', created.id, 'Shared material: ' + created.title)
  return created
}

export async function updateAdminMaterial(id: string, data: Partial<LearningMaterialRecord>) {
  const current = await prisma.learningMaterial.findUnique({ where: { id } })
  if (!current) return null
  const isPublic = data.assignedStudentId === undefined ? current.isPublic : data.assignedStudentId === 'ALL' || data.assignedStudentId === ''
  const type = data.type ?? (current.mimeType === 'application/pdf' ? 'PDF' : current.mimeType.startsWith('audio/') ? 'AUDIO' : current.mimeType.startsWith('video/') ? 'VIDEO' : current.mimeType === 'application/vnd.workspeak.worksheet' ? 'WORKSHEET' : 'LINK')
  const mimeType = type === 'PDF' ? 'application/pdf' : type === 'AUDIO' ? 'audio/mpeg' : type === 'VIDEO' ? 'video/mp4' : type === 'WORKSHEET' ? 'application/vnd.workspeak.worksheet' : 'text/uri-list'
  await prisma.learningMaterial.update({ where: { id }, data: {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.url !== undefined ? { fileKey: data.url } : {}),
    ...(data.type !== undefined ? { mimeType } : {}),
    ...(data.language !== undefined ? { language: data.language } : {}),
    isPublic,
  } })
  if (data.assignedStudentId !== undefined) {
    await prisma.materialAccess.deleteMany({ where: { materialId: id } })
    if (!isPublic) await prisma.materialAccess.create({ data: { materialId: id, studentId: data.assignedStudentId } })
  }
  const rows = await prisma.learningMaterial.findUnique({ where: { id }, include: { accessGrants: { take: 1 } } })
  if (!rows) return null
  const updated: LearningMaterialRecord = {
    id: rows.id, title: rows.title, description: rows.description ?? '', type, url: rows.fileKey,
    language: rows.language ?? 'BOTH', level: data.level ?? '', assignedStudentId: rows.isPublic ? 'ALL' : rows.accessGrants[0]?.studentId ?? '', uploadedAt: rows.createdAt.toISOString(),
  }
  const idx = globalStore._adminMaterials!.findIndex((material) => material.id === id)
  if (idx >= 0) globalStore._adminMaterials![idx] = updated
  await logAuditEvent('UPDATE_MATERIAL', 'MATERIAL', id, 'Updated material access or details for ' + rows.title)
  return updated
}

export async function deleteAdminMaterial(id: string) {
  const material = await prisma.learningMaterial.findUnique({ where: { id }, select: { title: true } })
  if (!material) return false
  await prisma.lessonMaterial.deleteMany({ where: { materialId: id } })
  await prisma.materialAccess.deleteMany({ where: { materialId: id } })
  await prisma.learningMaterial.delete({ where: { id } })
  globalStore._adminMaterials = globalStore._adminMaterials!.filter((item) => item.id !== id)
  await logAuditEvent('DELETE_MATERIAL', 'MATERIAL', id, 'Deleted material ' + material.title)
  return true
}

export async function getAdminHomework() {
  try {
    const rows = await prisma.homework.findMany({ include: { submission: true }, orderBy: { createdAt: 'desc' } })
    const students = await prisma.user.findMany({
      where: { id: { in: rows.map((row) => row.studentId) } },
      include: { studentProfile: true },
    })
    const studentsById = new Map(students.map((student) => [student.id, student]))
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      instructions: row.instructions,
      studentId: row.studentId,
      studentName: studentsById.get(row.studentId)?.name ?? 'Student',
      language: studentsById.get(row.studentId)?.studentProfile?.preferredLanguage === 'ENGLISH' ? 'ENGLISH' : 'PORTUGUESE',
      dueDate: row.dueAt?.toISOString() ?? '',
      status: row.status === 'REVIEWED' ? 'GRADED' : row.status === 'SUBMITTED' || row.submission ? 'SUBMITTED' : 'ASSIGNED',
      assignedAt: row.createdAt.toISOString(),
      grade: row.submission?.feedback?.split(' ? ')[0],
      feedback: row.submission?.feedback ?? undefined,
    } satisfies AdminHomeworkRecord))
  } catch {
    return [...globalStore._adminHomework!]
  }
}

export async function createAdminHomework(data: {
  title: string
  instructions: string
  studentId: string
  studentName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  dueDate: string
}) {
  const student = await prisma.user.findUnique({ where: { id: data.studentId }, select: { id: true, name: true } })
  if (!student) throw Object.assign(new Error('Student account not found.'), { statusCode: 404 })
  const assignedById = await getDatabaseAdminId()
  const row = await prisma.homework.create({
    data: {
      title: data.title,
      instructions: data.instructions,
      studentId: student.id,
      assignedById,
      dueAt: data.dueDate ? new Date(data.dueDate) : null,
      status: 'ASSIGNED',
    },
    include: { submission: true },
  })
  const created: AdminHomeworkRecord = {
    id: row.id, title: row.title, instructions: row.instructions, studentId: row.studentId,
    studentName: student.name, language: data.language, dueDate: row.dueAt?.toISOString() ?? '',
    status: 'ASSIGNED', assignedAt: row.createdAt.toISOString(),
  }
  globalStore._adminHomework!.unshift(created)
  await logAuditEvent('CREATE_HOMEWORK', 'HOMEWORK', created.id, 'Assigned homework ' + created.title + ' to ' + created.studentName)
  return created
}

export async function gradeAdminHomework(id: string, grade: string, feedback: string) {
  const homework = await prisma.homework.findUnique({ where: { id }, include: { submission: true } })
  if (!homework) return null
  const assignedById = await getDatabaseAdminId()
  const feedbackText = grade ? grade + ' ? ' + feedback : feedback
  await prisma.$transaction([
    prisma.homework.update({ where: { id }, data: { status: 'REVIEWED' } }),
    prisma.homeworkSubmission.upsert({
      where: { homeworkId: id },
      create: { homeworkId: id, studentId: homework.studentId, reviewedBy: assignedById, feedback: feedbackText, feedbackAt: new Date() },
      update: { reviewedBy: assignedById, feedback: feedbackText, feedbackAt: new Date() },
    }),
  ])
  const idx = globalStore._adminHomework!.findIndex((item) => item.id === id)
  if (idx >= 0) {
    globalStore._adminHomework![idx].grade = grade
    globalStore._adminHomework![idx].feedback = feedback
    globalStore._adminHomework![idx].status = 'GRADED'
  }
  await logAuditEvent('GRADE_HOMEWORK', 'HOMEWORK', id, 'Reviewed homework and recorded feedback for ' + homework.studentId)
  return (await getAdminHomework()).find((item) => item.id === id) ?? null
}

export async function deleteAdminHomework(id: string) {
  const homework = await prisma.homework.findUnique({ where: { id }, select: { title: true } })
  if (!homework) return false
  await prisma.homeworkSubmission.deleteMany({ where: { homeworkId: id } })
  await prisma.homework.delete({ where: { id } })
  globalStore._adminHomework = globalStore._adminHomework!.filter((item) => item.id !== id)
  await logAuditEvent('DELETE_HOMEWORK', 'HOMEWORK', id, 'Deleted homework task ' + homework.title)
  return true
}

export async function getAdminSettings(): Promise<AcademySettings> {
  return { ...globalStore._adminSettings! }
}

export async function updateAdminSettings(settings: Partial<AcademySettings>) {
  globalStore._adminSettings = {
    ...globalStore._adminSettings!,
    ...settings,
  }
  await logAuditEvent('UPDATE_SETTINGS', 'ACADEMY', 'settings', 'Updated academy operational settings.')
  return globalStore._adminSettings
}

export async function getSeoSettings(): Promise<SeoSettings> {
  return { ...globalStore._adminSeoSettings! }
}

export async function updateSeoSettings(seo: Partial<SeoSettings>) {
  globalStore._adminSeoSettings = {
    ...globalStore._adminSeoSettings!,
    ...seo,
  }
  await logAuditEvent('UPDATE_SEO', 'WEBSITE', 'seo', 'Updated website SEO and announcement banner.')
  return globalStore._adminSeoSettings
}
