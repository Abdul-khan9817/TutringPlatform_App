// Unified backend data provider for Admin Management
// Queries Prisma database when connected, and maintains consistent in-memory state during development

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
  status: 'SUCCEEDED' | 'PENDING' | 'REFUNDED'
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
}

// ────────────────────────────────────────────────────────────
// Initial Seeds
// ────────────────────────────────────────────────────────────

if (!globalStore._adminProfile) {
  globalStore._adminProfile = {
    id: 'admin-system-master',
    name: 'Asad Khan',
    email: 'khanasad4244@gmail.com',
    password: 'Admin@WorkSpeak2026!',
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
      tempPassword: 'Student@WorkSpeak2026!',
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
      tempPassword: 'Student@WorkSpeak2026!',
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
      tempPassword: 'Student@WorkSpeak2026!',
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
      tempPassword: 'Student@WorkSpeak2026!',
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
      tempPassword: 'Student@WorkSpeak2026!',
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
      tempPassword: 'Student@WorkSpeak2026!',
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
      url: 'https://workspeakportugal.com/materials/workplace-essentials-pt.pdf',
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
      url: 'https://workspeakportugal.com/materials/pt-vowels-drills.mp3',
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
      url: 'https://workspeakportugal.com/materials/medical-english-case-notes.pdf',
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
      url: 'https://workspeakportugal.com/materials/ciple-a2-practice-pack.pdf',
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
      url: 'https://workspeakportugal.com/materials/negotiations-masterclass.mp4',
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
  globalStore._adminAuditLogs = [
    {
      id: 'aud-1',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      adminEmail: 'khanasad4244@gmail.com',
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'SECURITY',
      entityId: 'admin-master',
      details: 'WorkSpeak Portugal Single Admin initialized with full platform authority.',
    },
    {
      id: 'aud-2',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      adminEmail: 'khanasad4244@gmail.com',
      action: 'UPDATE_STUDENT_CEFR',
      entityType: 'STUDENT',
      entityId: 'std-1',
      details: 'Assigned CEFR B1 level to student Maria Silva.',
    },
    {
      id: 'aud-3',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      adminEmail: 'khanasad4244@gmail.com',
      action: 'RECORD_ATTENDANCE',
      entityType: 'BOOKING',
      entityId: 'bk-104',
      details: 'Marked Maria Silva as PRESENT for Executive Presentation Skills lesson.',
    },
  ]
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
  const id = `std-${Date.now()}`
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
    tempPassword: 'Student@WorkSpeak2026!',
    passwordHash: data.passwordHash,
    attendance: { attended: 0, absent: 0, late: 0 },
  }
  globalStore._adminStudents = globalStore._adminStudents || []
  globalStore._adminStudents.unshift(newStudent)
  return newStudent
}

export async function getAdminStudents(search?: string, languageFilter?: string, statusFilter?: string) {
  let list = [...globalStore._adminStudents!]
  if (search) {
    const q = search.toLowerCase()
    list = list.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
  }
  if (languageFilter && languageFilter !== 'ALL') {
    list = list.filter((s) => s.preferredLanguage === languageFilter)
  }
  if (statusFilter && statusFilter !== 'ALL') {
    list = list.filter((s) => s.status === statusFilter)
  }
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
  notes?: string
}) {
  const id = `std-${Date.now()}`
  const inviteToken = `inv_${Math.random().toString(36).substring(2, 10)}`
  const newStudent: StudentRecord = {
    id,
    name: data.name,
    email: data.email,
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
    inviteUrl: `http://localhost:3000/register?invite=${inviteToken}`,
    tempPassword: `Pass@${Math.floor(100000 + Math.random() * 900000)}`,
    notes: data.notes || '',
    attendance: { attended: 0, absent: 0, late: 0 },
  }
  globalStore._adminStudents!.unshift(newStudent)
  await logAuditEvent('ADD_STUDENT', 'STUDENT', id, `Enrolled student ${newStudent.name} (${newStudent.email}) with ${newStudent.lessonBalance} lesson credits.`)
  return newStudent
}

export async function updateAdminStudent(id: string, data: Partial<StudentRecord>) {
  const idx = globalStore._adminStudents!.findIndex((s) => s.id === id)
  if (idx !== -1) {
    globalStore._adminStudents![idx] = {
      ...globalStore._adminStudents![idx],
      ...data,
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
    await logAuditEvent('DEACTIVATE_STUDENT', 'STUDENT', id, `Deactivated account for ${student.name}`)
    return student
  }
  return null
}

export async function restoreAdminStudent(id: string) {
  const student = globalStore._adminStudents!.find((s) => s.id === id)
  if (student) {
    student.status = 'ACTIVE'
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
    student.inviteToken = inviteToken
    student.inviteUrl = `http://localhost:3000/register?invite=${inviteToken}`
    student.tempPassword = `WorkSpeak@${Math.floor(1000 + Math.random() * 9000)}!`
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
    const tempPass = newPassword || `WorkSpeak@${Math.floor(1000 + Math.random() * 9000)}!`
    student.tempPassword = tempPass
    await logAuditEvent('RESET_STUDENT_PASSWORD', 'STUDENT', id, `Reset login credentials for ${student.name}`)
    return { success: true, tempPassword: tempPass, email: student.email }
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

export async function getAdminBookings(statusFilter?: string) {
  let list = [...globalStore._adminBookings!]
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
  const newBooking: BookingRecord = {
    id: `bk-${Date.now()}`,
    studentName: data.studentName,
    studentEmail: data.studentEmail,
    tutorName: 'Prof. Asad Khan',
    serviceName: data.serviceName,
    language: data.language,
    deliveryMode: data.deliveryMode,
    startAt: data.startAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    durationMinutes: data.durationMinutes,
    price: data.price,
    status: 'CONFIRMED',
    meetingLink: data.deliveryMode === 'ONLINE' ? (data.meetingLink || 'https://meet.google.com/ws-pt-class') : '',
    attendanceStatus: 'PENDING',
  }
  globalStore._adminBookings!.unshift(newBooking)
  await logAuditEvent('CREATE_BOOKING', 'BOOKING', newBooking.id, `Scheduled class for ${newBooking.studentName} (${newBooking.serviceName})`)
  return newBooking
}

export async function updateAdminBooking(id: string, data: Partial<BookingRecord>) {
  const idx = globalStore._adminBookings!.findIndex((b) => b.id === id)
  if (idx !== -1) {
    globalStore._adminBookings![idx] = {
      ...globalStore._adminBookings![idx],
      ...data,
    }
    await logAuditEvent('UPDATE_BOOKING', 'BOOKING', id, `Updated class details: ${Object.keys(data).join(', ')}`)
    return globalStore._adminBookings![idx]
  }
  return null
}

export async function updateAdminBookingStatus(id: string, status: BookingRecord['status']) {
  const item = globalStore._adminBookings!.find((b) => b.id === id)
  if (item) {
    item.status = status
    await logAuditEvent('UPDATE_BOOKING_STATUS', 'BOOKING', id, `Changed booking status to ${status}`)
    return item
  }
  return null
}

export async function updateMeetingLink(id: string, meetingLink: string) {
  const item = globalStore._adminBookings!.find((b) => b.id === id)
  if (item) {
    item.meetingLink = meetingLink
    await logAuditEvent('UPDATE_MEETING_LINK', 'BOOKING', id, `Updated online meeting link to ${meetingLink}`)
    return item
  }
  return null
}

export async function recordAttendance(
  id: string,
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE',
  lessonNotes?: string,
  tutorFeedback?: string
) {
  const item = globalStore._adminBookings!.find((b) => b.id === id)
  if (item) {
    item.attendanceStatus = attendanceStatus
    if (attendanceStatus === 'PRESENT') item.status = 'COMPLETED'
    if (lessonNotes !== undefined) item.lessonNotes = lessonNotes
    if (tutorFeedback !== undefined) item.tutorFeedback = tutorFeedback

    // Update student's attendance counters
    const student = globalStore._adminStudents!.find((s) => s.email === item.studentEmail)
    if (student) {
      if (attendanceStatus === 'PRESENT') student.attendance.attended += 1
      if (attendanceStatus === 'ABSENT') student.attendance.absent += 1
      if (attendanceStatus === 'LATE') student.attendance.late += 1
      student.lessonsCompleted += 1
      if (student.lessonBalance > 0) student.lessonBalance -= 1
    }

    await logAuditEvent('RECORD_ATTENDANCE', 'BOOKING', id, `Recorded attendance '${attendanceStatus}' for ${item.studentName}`)
    return item
  }
  return null
}

export async function deleteAdminBooking(id: string) {
  const idx = globalStore._adminBookings!.findIndex((b) => b.id === id)
  if (idx !== -1) {
    const deleted = globalStore._adminBookings!.splice(idx, 1)[0]
    await logAuditEvent('DELETE_BOOKING', 'BOOKING', id, `Cancelled and deleted booking for ${deleted.studentName}`)
    return true
  }
  return false
}

// ────────────────────────────────────────────────────────────
// Assessment API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminAssessments(statusFilter?: string) {
  let list = [...globalStore._adminAssessments!]
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
  const item = globalStore._adminAssessments!.find((a) => a.id === id)
  if (item) {
    item.status = status
    if (recommendedLevel) item.recommendedLevel = recommendedLevel
    if (evaluationNotes) item.evaluationNotes = evaluationNotes
    await logAuditEvent('UPDATE_ASSESSMENT', 'ASSESSMENT', id, `Updated assessment status to ${status} (Level: ${recommendedLevel || 'N/A'})`)
    return item
  }
  return null
}

// ────────────────────────────────────────────────────────────
// Payments API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminPayments() {
  return [...globalStore._adminPayments!]
}

// ────────────────────────────────────────────────────────────
// Learning Materials Management API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminMaterials() {
  return [...globalStore._adminMaterials!]
}

export async function addAdminMaterial(data: Omit<LearningMaterialRecord, 'id' | 'uploadedAt'>) {
  const newMat: LearningMaterialRecord = {
    ...data,
    id: `mat-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  }
  globalStore._adminMaterials!.unshift(newMat)
  await logAuditEvent('ADD_MATERIAL', 'MATERIAL', newMat.id, `Uploaded material: ${newMat.title} (${newMat.type})`)
  return newMat
}

export async function updateAdminMaterial(id: string, data: Partial<LearningMaterialRecord>) {
  const idx = globalStore._adminMaterials!.findIndex((m) => m.id === id)
  if (idx !== -1) {
    globalStore._adminMaterials![idx] = {
      ...globalStore._adminMaterials![idx],
      ...data,
    }
    await logAuditEvent('UPDATE_MATERIAL', 'MATERIAL', id, `Updated material: ${globalStore._adminMaterials![idx].title}`)
    return globalStore._adminMaterials![idx]
  }
  return null
}

export async function deleteAdminMaterial(id: string) {
  const idx = globalStore._adminMaterials!.findIndex((m) => m.id === id)
  if (idx !== -1) {
    const deleted = globalStore._adminMaterials!.splice(idx, 1)[0]
    await logAuditEvent('DELETE_MATERIAL', 'MATERIAL', id, `Deleted material ${deleted.title}`)
    return true
  }
  return false
}

// ────────────────────────────────────────────────────────────
// Homework & Assignments API Methods
// ────────────────────────────────────────────────────────────

export async function getAdminHomework() {
  return [...globalStore._adminHomework!]
}

export async function createAdminHomework(data: {
  title: string
  instructions: string
  studentId: string
  studentName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  dueDate: string
}) {
  const newHw: AdminHomeworkRecord = {
    id: `hw-${Date.now()}`,
    ...data,
    status: 'ASSIGNED',
    assignedAt: new Date().toISOString(),
  }
  globalStore._adminHomework!.unshift(newHw)
  await logAuditEvent('CREATE_HOMEWORK', 'HOMEWORK', newHw.id, `Assigned homework '${newHw.title}' to ${newHw.studentName}`)
  return newHw
}

export async function gradeAdminHomework(id: string, grade: string, feedback: string) {
  const item = globalStore._adminHomework!.find((h) => h.id === id)
  if (item) {
    item.grade = grade
    item.feedback = feedback
    item.status = 'GRADED'
    await logAuditEvent('GRADE_HOMEWORK', 'HOMEWORK', id, `Graded homework '${item.title}' for ${item.studentName}: ${grade}`)
    return item
  }
  return null
}

export async function deleteAdminHomework(id: string) {
  const idx = globalStore._adminHomework!.findIndex((h) => h.id === id)
  if (idx !== -1) {
    const deleted = globalStore._adminHomework!.splice(idx, 1)[0]
    await logAuditEvent('DELETE_HOMEWORK', 'HOMEWORK', id, `Deleted homework task '${deleted.title}'`)
    return true
  }
  return false
}

// ────────────────────────────────────────────────────────────
// Academy & SEO Settings API Methods
// ────────────────────────────────────────────────────────────

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
