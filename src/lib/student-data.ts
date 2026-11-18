/**
 * student-data.ts
 * In-memory persistent data store for the student portal.
 * Used as a fallback when no database is available.
 * Follows the same globalStore pattern as admin-data.ts.
 */

export interface StudentBooking {
  id: string
  serviceName: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  durationMinutes: number
  deliveryMode: 'ONLINE' | 'IN_PERSON'
  tutorName: string
  startAt: string   // ISO string
  endAt: string     // ISO string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  amount: number
  paymentStatus: 'PAID' | 'PENDING' | 'UNPAID'
  meetingLink?: string
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'PENDING'
  lessonNotes?: string
  tutorFeedback?: string
}

export interface StudentPackage {
  id: string
  name: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  lessonCount: number
  usedLessons: number
  validityDays: number
  price: number
  status: 'ACTIVE' | 'EXPIRED' | 'USED'
  purchasedAt: string
  expiresAt: string
  description: string
}

export interface AvailablePackage {
  id: string
  name: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  lessonCount: number
  validityDays: number
  price: number
  description: string
  popular: boolean
}

export interface StudentHomework {
  id: string
  title: string
  instructions: string
  dueDate: string
  status: 'ASSIGNED' | 'SUBMITTED' | 'GRADED'
  grade?: string
  feedback?: string
  assignedAt: string
}

export interface StudentMaterial {
  id: string
  title: string
  type: 'PDF' | 'AUDIO' | 'VIDEO' | 'WORKSHEET' | 'LINK'
  description: string
  url: string
  language: 'PORTUGUESE' | 'ENGLISH' | 'BOTH'
  level: string
  uploadedAt: string
}

export interface StudentPayment {
  id: string
  description: string
  amount: number
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED'
  date: string
  method: string
  reference: string
}

export interface StudentProgressEntry {
  level: string
  label: string
  completedLessons: number
  targetLessons: number
  achievedAt?: string
  current: boolean
}

export interface StudentProfile {
  name: string
  email: string
  phone: string
  nationality: string
  currentLevel: string
  learningGoal: string
  preferredSchedule: string
  enrolledAt: string
}

export interface StudentNotification {
  id: string
  title: string
  message: string
  type: 'LESSON' | 'HOMEWORK' | 'PACKAGE' | 'SYSTEM'
  timestamp: string
  read: boolean
  link?: string
}

// ---------------------------------------------------------------------------
// Global in-memory store (persists across Next.js hot reloads via globalThis)
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __studentStore: StudentStore | undefined
}

interface StudentStore {
  bookings: StudentBooking[]
  purchasedPackages: StudentPackage[]
  homework: StudentHomework[]
  materials: StudentMaterial[]
  payments: StudentPayment[]
  progress: StudentProgressEntry[]
  profile: StudentProfile
  notifications?: StudentNotification[]
}

function createInitialStore(): StudentStore {
  const now = new Date()

  const d = (offsetDays: number, hour = 10, minute = 0): string => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + offsetDays)
    dt.setHours(hour, minute, 0, 0)
    return dt.toISOString()
  }

  return {
    profile: {
      name: 'Demo Student',
      email: 'demo@student.com',
      phone: '+351 912 345 678',
      nationality: 'Indian',
      currentLevel: 'A2',
      learningGoal: 'Achieve B1 level for work permit in Portugal',
      preferredSchedule: 'Weekday mornings',
      enrolledAt: d(-90),
    },

    bookings: [
      {
        id: 'bk-001',
        serviceName: 'Portuguese — 60 min Individual',
        language: 'PORTUGUESE',
        durationMinutes: 60,
        deliveryMode: 'ONLINE',
        tutorName: 'Prof. Asad Khan (Lead Teacher)',
        startAt: d(1, 10, 0),
        endAt: d(1, 11, 0),
        status: 'CONFIRMED',
        amount: 35,
        paymentStatus: 'PAID',
        meetingLink: 'https://meet.google.com/ws-pt-class',
        attendanceStatus: 'PENDING',
        lessonNotes: 'Oral conversation and workplace Portuguese phrases.',
      },
      {
        id: 'bk-002',
        serviceName: 'Portuguese — 60 min Individual',
        language: 'PORTUGUESE',
        durationMinutes: 60,
        deliveryMode: 'ONLINE',
        tutorName: 'Prof. Asad Khan (Lead Teacher)',
        startAt: d(5, 10, 0),
        endAt: d(5, 11, 0),
        status: 'CONFIRMED',
        amount: 35,
        paymentStatus: 'PAID',
        meetingLink: 'https://meet.google.com/ws-pt-class',
        attendanceStatus: 'PENDING',
        lessonNotes: 'Grammar review: Pretérito Perfeito vs Imperfeito.',
      },
      {
        id: 'bk-003',
        serviceName: 'English — 60 min Individual',
        language: 'ENGLISH',
        durationMinutes: 60,
        deliveryMode: 'ONLINE',
        tutorName: 'Prof. Asad Khan (Lead Teacher)',
        startAt: d(-7, 14, 0),
        endAt: d(-7, 15, 0),
        status: 'COMPLETED',
        amount: 35,
        paymentStatus: 'PAID',
        meetingLink: 'https://meet.google.com/ws-pt-class',
        attendanceStatus: 'PRESENT',
        lessonNotes: 'International presentation pitch review.',
        tutorFeedback: 'Strong presentation delivery. Good pace and intonation.',
      },
      {
        id: 'bk-004',
        serviceName: 'Portuguese — 90 min Individual',
        language: 'PORTUGUESE',
        durationMinutes: 90,
        deliveryMode: 'IN_PERSON',
        tutorName: 'Prof. Asad Khan (Lead Teacher)',
        startAt: d(-21, 11, 0),
        endAt: d(-21, 12, 30),
        status: 'COMPLETED',
        amount: 50,
        paymentStatus: 'PAID',
        attendanceStatus: 'PRESENT',
        lessonNotes: 'In-person session at Lisbon hub. Real-world conversation practice.',
        tutorFeedback: 'Great active listening. Pronunciation of nasal sounds has improved.',
      },
      {
        id: 'bk-005',
        serviceName: 'Free Assessment',
        language: 'PORTUGUESE',
        durationMinutes: 30,
        deliveryMode: 'ONLINE',
        tutorName: 'Prof. Asad Khan (Lead Teacher)',
        startAt: d(-90, 9, 0),
        endAt: d(-90, 9, 30),
        status: 'COMPLETED',
        amount: 0,
        paymentStatus: 'PAID',
        meetingLink: 'https://meet.google.com/ws-pt-assessment',
        attendanceStatus: 'PRESENT',
        lessonNotes: 'Initial diagnostic assessment. Assessed at level A1-A2.',
      },
    ],

    purchasedPackages: [
      {
        id: 'pp-001',
        name: 'Portuguese Starter — 10 Lessons',
        language: 'PORTUGUESE',
        lessonCount: 10,
        usedLessons: 4,
        validityDays: 90,
        price: 320,
        status: 'ACTIVE',
        purchasedAt: d(-30),
        expiresAt: d(60),
        description: '10 x 60-minute individual sessions',
      },
    ],

    homework: [
      {
        id: 'hw-001',
        title: 'Irregular Verbs — Present Tense',
        instructions:
          'Complete exercises 3A–3D on irregular verbs (ser, estar, ter, ir, fazer). Write 2 original sentences for each verb. Submit via WhatsApp or email.',
        dueDate: d(5),
        status: 'ASSIGNED',
        assignedAt: d(-2),
      },
      {
        id: 'hw-002',
        title: 'Listening: Dialogue at a Café',
        instructions:
          'Listen to the audio file sent by your tutor. Answer the comprehension questions and write a short 5-sentence summary in Portuguese.',
        dueDate: d(2),
        status: 'ASSIGNED',
        assignedAt: d(-5),
      },
      {
        id: 'hw-003',
        title: 'Vocabulary: At the Workplace',
        instructions:
          'Learn 20 workplace vocabulary words from the PDF worksheet. Record yourself saying each word + a sample sentence.',
        dueDate: d(-3),
        status: 'SUBMITTED',
        assignedAt: d(-14),
        grade: undefined,
        feedback: "Great effort! Good pronunciation overall. We'll review in next session.",
      },
      {
        id: 'hw-004',
        title: 'Grammar: Definite & Indefinite Articles',
        instructions:
          'Complete the articles worksheet pages 12–15. Focus on gender agreement (o/a, os/as, um/uma).',
        dueDate: d(-15),
        status: 'GRADED',
        assignedAt: d(-28),
        grade: 'A',
        feedback: 'Excellent work! Perfect score on gender agreement. Ready for A2 unit 3.',
      },
    ],

    materials: [
      {
        id: 'mat-001',
        title: 'A1–A2 Grammar Reference Guide',
        type: 'PDF',
        description: 'Comprehensive grammar reference covering articles, verb conjugations, and sentence structure for beginners.',
        url: 'https://wa.me/351916869857?text=I need the A1-A2 Grammar Guide',
        language: 'PORTUGUESE',
        level: 'A1–A2',
        uploadedAt: d(-45),
      },
      {
        id: 'mat-002',
        title: 'Workplace Vocabulary — Set 1',
        type: 'WORKSHEET',
        description: '50 essential workplace words and phrases with example sentences and pronunciation guide.',
        url: 'https://wa.me/351916869857?text=I need the Workplace Vocabulary worksheet',
        language: 'PORTUGUESE',
        level: 'A2',
        uploadedAt: d(-30),
      },
      {
        id: 'mat-003',
        title: 'Listening Practice — Daily Conversations',
        type: 'AUDIO',
        description: '6 short audio dialogues (café, supermarket, work, transport, doctor, bank) with transcripts.',
        url: 'https://wa.me/351916869857?text=I need the Listening Practice audio files',
        language: 'PORTUGUESE',
        level: 'A2',
        uploadedAt: d(-15),
      },
      {
        id: 'mat-004',
        title: 'English Business Writing — Templates',
        type: 'PDF',
        description: 'Professional email and letter templates for workplace communication in English.',
        url: 'https://wa.me/351916869857?text=I need the English Business Writing templates',
        language: 'ENGLISH',
        level: 'B1',
        uploadedAt: d(-10),
      },
    ],

    payments: [
      {
        id: 'pay-001',
        description: 'Portuguese Starter — 10 Lessons package',
        amount: 320,
        status: 'SUCCEEDED',
        date: d(-30),
        method: 'MB Way',
        reference: 'REF-2026-0041',
      },
      {
        id: 'pay-002',
        description: 'Portuguese — 60 min session (Oct 15)',
        amount: 35,
        status: 'SUCCEEDED',
        date: d(-21),
        method: 'Bank Transfer',
        reference: 'REF-2026-0028',
      },
      {
        id: 'pay-003',
        description: 'English — 60 min session (Nov 4)',
        amount: 35,
        status: 'SUCCEEDED',
        date: d(-7),
        method: 'MB Way',
        reference: 'REF-2026-0055',
      },
    ],

    progress: [
      { level: 'A1', label: 'Beginner', completedLessons: 10, targetLessons: 10, achievedAt: d(-60), current: false },
      { level: 'A2', label: 'Elementary', completedLessons: 4, targetLessons: 10, achievedAt: undefined, current: true },
      { level: 'B1', label: 'Intermediate', completedLessons: 0, targetLessons: 15, achievedAt: undefined, current: false },
      { level: 'B2', label: 'Upper Intermediate', completedLessons: 0, targetLessons: 20, achievedAt: undefined, current: false },
    ],

    notifications: [
      {
        id: 'snotif-1',
        title: 'Upcoming Portuguese Class',
        message: 'Your live lesson with Prof. Asad Khan starts tomorrow at 10:00 (WET).',
        type: 'LESSON',
        timestamp: '1 hour ago',
        read: false,
        link: '/student/bookings',
      },
      {
        id: 'snotif-2',
        title: 'Homework Assigned',
        message: 'Pretérito Perfeito vs Imperfeito practice exercises are due in 4 days.',
        type: 'HOMEWORK',
        timestamp: 'Yesterday',
        read: false,
        link: '/student/homework',
      },
      {
        id: 'snotif-3',
        title: 'Package Balance Alert',
        message: 'You have 6 lesson credits remaining in your Workplace Portuguese 10-pack.',
        type: 'PACKAGE',
        timestamp: '2 days ago',
        read: true,
        link: '/student/packages',
      },
    ],
  }
}

function getStore(): StudentStore {
  if (!globalThis.__studentStore) {
    globalThis.__studentStore = createInitialStore()
  }
  return globalThis.__studentStore
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export function getStudentBookings(): StudentBooking[] {
  return [...getStore().bookings].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
  )
}

export function createStudentBooking(data: {
  serviceName: string
  language: 'PORTUGUESE' | 'ENGLISH'
  durationMinutes: number
  deliveryMode: 'ONLINE' | 'IN_PERSON'
  startAt: string
}): StudentBooking {
  const store = getStore()
  const start = new Date(data.startAt)
  const end = new Date(start.getTime() + data.durationMinutes * 60 * 1000)
  const booking: StudentBooking = {
    id: `bk-${Date.now()}`,
    serviceName: data.serviceName,
    language: data.language,
    durationMinutes: data.durationMinutes,
    deliveryMode: data.deliveryMode,
    tutorName: data.language === 'PORTUGUESE' ? 'Ana Rodrigues' : 'James Carter',
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    status: 'CONFIRMED',
    amount: data.durationMinutes >= 90 ? 50 : 35,
    paymentStatus: 'PENDING',
  }
  store.bookings.unshift(booking)
  return booking
}

export function cancelStudentBooking(id: string): StudentBooking | null {
  const store = getStore()
  const booking = store.bookings.find(b => b.id === id)
  if (!booking) return null
  booking.status = 'CANCELLED'
  return booking
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export function getStudentPackages(): {
  purchased: StudentPackage[]
  available: AvailablePackage[]
} {
  const store = getStore()
  const available: AvailablePackage[] = [
    {
      id: 'avail-pt-5',
      name: 'Portuguese Starter — 5 Lessons',
      language: 'PORTUGUESE',
      lessonCount: 5,
      validityDays: 60,
      price: 165,
      description: '5 × 60-min individual sessions',
      popular: false,
    },
    {
      id: 'avail-pt-10',
      name: 'Portuguese Value — 10 Lessons',
      language: 'PORTUGUESE',
      lessonCount: 10,
      validityDays: 90,
      price: 320,
      description: '10 × 60-min individual sessions',
      popular: true,
    },
    {
      id: 'avail-pt-20',
      name: 'Portuguese Intensive — 20 Lessons',
      language: 'PORTUGUESE',
      lessonCount: 20,
      validityDays: 180,
      price: 600,
      description: '20 × 60-min individual sessions',
      popular: false,
    },
    {
      id: 'avail-en-10',
      name: 'English Professional — 10 Lessons',
      language: 'ENGLISH',
      lessonCount: 10,
      validityDays: 90,
      price: 320,
      description: '10 × 60-min individual sessions',
      popular: false,
    },
  ]
  return { purchased: store.purchasedPackages, available }
}

// ---------------------------------------------------------------------------
// Homework
// ---------------------------------------------------------------------------

export function getStudentHomework(): StudentHomework[] {
  return [...getStore().homework].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )
}

export function submitHomework(id: string): StudentHomework | null {
  const store = getStore()
  const hw = store.homework.find(h => h.id === id)
  if (!hw || hw.status !== 'ASSIGNED') return null
  hw.status = 'SUBMITTED'
  return hw
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export function getStudentMaterials(): StudentMaterial[] {
  return [...getStore().materials].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export function getStudentPayments(): StudentPayment[] {
  return [...getStore().payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function getStudentProgress(): StudentProgressEntry[] {
  return getStore().progress
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export function getStudentProfile(): StudentProfile {
  return { ...getStore().profile }
}

export function updateStudentProfile(data: Partial<StudentProfile>): StudentProfile {
  const store = getStore()
  store.profile = { ...store.profile, ...data }
  return store.profile
}

// ---------------------------------------------------------------------------
// Dashboard summary
// ---------------------------------------------------------------------------

export function getStudentDashboardData() {
  const store = getStore()
  const now = new Date()

  const upcoming = store.bookings
    .filter(b => b.status === 'CONFIRMED' && new Date(b.startAt) >= now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 3)

  const active = store.purchasedPackages.filter(
    p => p.status === 'ACTIVE' && new Date(p.expiresAt) >= now
  )

  const pendingHw = store.homework.filter(h => h.status === 'ASSIGNED').length

  const lastPayment = store.payments
    .filter(p => p.status === 'SUCCEEDED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return { upcoming, active, pendingHw, lastPayment }
}

// ---------------------------------------------------------------------------
// Student Notifications
// ---------------------------------------------------------------------------

export function getStudentNotifications(): StudentNotification[] {
  const store = getStore()
  if (!store.notifications) {
    store.notifications = []
  }
  return [...store.notifications]
}

export function markStudentNotificationAsRead(id: string): boolean {
  const store = getStore()
  if (!store.notifications) return false
  const notif = store.notifications.find((n) => n.id === id)
  if (notif) {
    notif.read = true
    return true
  }
  return false
}

export function markAllStudentNotificationsAsRead(): boolean {
  const store = getStore()
  if (!store.notifications) return false
  store.notifications.forEach((n) => {
    n.read = true
  })
  return true
}

export function clearStudentNotifications(): boolean {
  const store = getStore()
  store.notifications = []
  return true
}
