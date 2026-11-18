/**
 * Standard PDF Generator for WorkSpeak Portugal Language Academy
 * Creates valid, native PDF-1.4 binary documents on the client
 * without external network dependencies or heavy binary libraries.
 */

function createPdfBlob(contentStreams: string[]): Blob {
  const objects: string[] = []
  
  // Object 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')

  // Object 2: Pages
  const pageRefs = contentStreams.map((_, i) => `${4 + i * 2} 0 R`).join(' ')
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${contentStreams.length} >>\nendobj`)

  // Object 3: Font Helvetica & Helvetica-Bold
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj'
  )
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj'
  )

  let nextObjId = 5
  for (let i = 0; i < contentStreams.length; i++) {
    const pageObjId = nextObjId++
    const contentObjId = nextObjId++
    const stream = contentStreams[i]
    const streamLength = new TextEncoder().encode(stream).length

    // Page object
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    )

    // Stream content object
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj`
    )
  }

  // Build full PDF document structure
  let fileBody = '%PDF-1.4\n'
  const xrefOffsets: number[] = [0]

  for (const obj of objects) {
    xrefOffsets.push(fileBody.length)
    fileBody += obj + '\n'
  }

  const xrefStart = fileBody.length
  fileBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i < xrefOffsets.length; i++) {
    const offsetStr = xrefOffsets[i].toString().padStart(10, '0')
    fileBody += `${offsetStr} 00000 n \n`
  }

  fileBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([fileBody], { type: 'application/pdf' })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '') // ASCII safe range
}

/**
 * 1. Generate & Download a payment confirmation PDF
 */
export function downloadReceiptPdf(payment: {
  invoiceNumber?: string
  reference?: string
  studentName: string
  studentEmail: string
  description: string
  amount: number
  method: string
  paidAt: string
}) {
  const receiptReference = escapePdfText(payment.reference || payment.invoiceNumber || 'Payment confirmation')
  const fileReference = (payment.reference || payment.invoiceNumber || 'payment').replace(/[^a-zA-Z0-9_-]/g, '_')
  const student = escapePdfText(payment.studentName)
  const email = escapePdfText(payment.studentEmail)
  const desc = escapePdfText(payment.description)
  const method = escapePdfText(payment.method)
  const dateStr = new Date(payment.paidAt).toLocaleDateString('en-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const stream = `
q
% Top Banner Background (Dark Brand Navy #0a1738)
0.039 0.090 0.220 rg
0 740 595.28 102 re f

% Portuguese Tricolor Accent Line
0.063 0.725 0.506 rg 0 737.5 198.4 2.5 re f
0.937 0.267 0.267 rg 198.4 737.5 198.4 2.5 re f
0.961 0.620 0.043 rg 396.8 737.5 198.4 2.5 re f

% Academy Header Text
BT
/F2 20 Tf
1 1 1 rg
40 790 Td
(WORKSPEAK PORTUGAL) Tj
ET

BT
/F1 10 Tf
0.8 0.85 0.95 rg
40 772 Td
(Language Academy - Professional Portuguese & English Instruction) Tj
ET

BT
/F1 9 Tf
0.7 0.75 0.85 rg
40 756 Td
(Student payment record) Tj
ET

% Receipt Badge
BT
/F2 14 Tf
0.1 0.1 0.2 rg
40 690 Td
(PAYMENT RECEIPT / COMPROVATIVO DE PAGAMENTO) Tj
ET

% Divider
0.85 0.88 0.92 RG 1 w
40 675 m 555 675 l S

% Metadata Box
0.97 0.98 0.99 rg
40 595 515 70 re f
0.85 0.88 0.92 RG 1 w
40 595 515 70 re S

BT
/F2 10 Tf
0.2 0.25 0.3 rg
55 645 Td
(Receipt Reference:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
165 645 Td
(${receiptReference}) Tj
/F2 10 Tf
0.2 0.25 0.3 rg
350 645 Td
(Payment Date:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
465 645 Td
(${dateStr}) Tj
ET

BT
/F2 10 Tf
0.2 0.25 0.3 rg
55 615 Td
(Student Recipient:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
165 615 Td
(${student} (${email})) Tj
/F2 10 Tf
0.2 0.25 0.3 rg
350 615 Td
(Payment Method:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
465 615 Td
(${method}) Tj
ET

% Table Header
0.039 0.090 0.220 rg
40 545 515 28 re f

BT
/F2 10 Tf
1 1 1 rg
55 554 Td
(SERVICE & CURRICULUM DESCRIPTION) Tj
390 554 Td
(QTY) Tj
460 554 Td
(TOTAL EUR) Tj
ET

% Table Row
0.85 0.88 0.92 RG 1 w
40 485 515 60 re S

BT
/F2 10 Tf
0.1 0.1 0.1 rg
55 520 Td
(${desc}) Tj
/F1 9 Tf
0.4 0.45 0.5 rg
55 504 Td
(Payment confirmation) Tj
/F1 10 Tf
0.2 0.2 0.2 rg
400 514 Td
(1) Tj
/F2 12 Tf
0.1 0.4 0.2 rg
460 514 Td
(EUR ${payment.amount.toFixed(2)}) Tj
ET

% Summary Box
BT
/F2 13 Tf
0.039 0.090 0.220 rg
360 430 Td
(TOTAL PAID:) Tj
460 430 Td
(EUR ${payment.amount.toFixed(2)}) Tj
ET

0.1 0.6 0.3 RG 2 w
350 420 m 555 420 l S

% Tax Exemption Legal Notice
0.96 0.97 0.98 rg
40 300 515 55 re f
0.85 0.88 0.92 RG 1 w
40 300 515 55 re S

BT
/F2 9 Tf
0.2 0.3 0.4 rg
55 338 Td
(PAYMENT CONFIRMATION) Tj
/F1 8.5 Tf
0.3 0.35 0.4 rg
55 322 Td
(This document confirms the transaction details shown above.) Tj
55 310 Td
(It is not a fiscal invoice.) Tj
ET

% Status Stamp
0.063 0.725 0.506 RG 1.5 w
40 180 180 50 re S
BT
/F2 12 Tf
0.063 0.725 0.506 rg
55 208 Td
(PAYMENT CONFIRMED) Tj
/F1 8.5 Tf
0.2 0.2 0.2 rg
55 194 Td
(WorkSpeak Portugal Academy) Tj
ET

% Footer
BT
/F1 8.5 Tf
0.5 0.55 0.6 rg
40 50 Td
(Keep this confirmation with your payment records.) Tj
ET
Q
`

  const blob = createPdfBlob([stream.trim()])
  triggerDownload(blob, `WorkSpeak-Receipt-${fileReference}.pdf`)
}

/**
 * 2. Generate & Download Standard CEFR Progress Report & Enrollment Certificate PDF
 */
export function downloadProgressReportPdf(student: {
  name: string
  email: string
  cefrLevel: string
  currentLevel: string
  preferredLanguage: string
  lessonsCompleted: number
  joinedAt: string
}) {
  const name = escapePdfText(student.name)
  const email = escapePdfText(student.email)
  const cefr = escapePdfText(student.cefrLevel || 'A1')
  const level = escapePdfText(student.currentLevel || 'A1 Beginner')
  const lang = escapePdfText(student.preferredLanguage)
  const dateStr = new Date().toLocaleDateString('en-PT', { day: '2-digit', month: 'short', year: 'numeric' })
  const certId = `CERT-WS-${Math.floor(100000 + Math.random() * 900000)}`

  const stream = `
q
% Top Header
0.039 0.090 0.220 rg
0 740 595.28 102 re f

0.063 0.725 0.506 rg 0 737.5 198.4 2.5 re f
0.937 0.267 0.267 rg 198.4 737.5 198.4 2.5 re f
0.961 0.620 0.043 rg 396.8 737.5 198.4 2.5 re f

BT
/F2 20 Tf
1 1 1 rg
40 790 Td
(WORKSPEAK PORTUGAL) Tj
ET

BT
/F1 10 Tf
0.8 0.85 0.95 rg
40 772 Td
(Language Academy - Official Student Language Progress & Verification) Tj
ET

BT
/F1 9 Tf
0.7 0.75 0.85 rg
40 756 Td
(Certificate ID: ${certId} - Issued on: ${dateStr}) Tj
ET

% Document Title
BT
/F2 15 Tf
0.039 0.090 0.220 rg
40 680 Td
(CERTIFICATE OF ENROLLMENT & CEFR PROGRESS REPORT) Tj
ET

0.85 0.88 0.92 RG 1 w
40 665 m 555 665 l S

% Student Profile Card
0.97 0.98 0.99 rg
40 545 515 105 re f
0.85 0.88 0.92 RG 1 w
40 545 515 105 re S

BT
/F2 12 Tf
0.1 0.1 0.1 rg
55 625 Td
(STUDENT INFORMATION) Tj
/F2 10 Tf
0.3 0.35 0.4 rg
55 600 Td
(Student Full Name:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
180 600 Td
(${name}) Tj
/F2 10 Tf
0.3 0.35 0.4 rg
55 580 Td
(Account Email:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
180 580 Td
(${email}) Tj
/F2 10 Tf
0.3 0.35 0.4 rg
55 560 Td
(Enrollment Date:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
180 560 Td
(${student.joinedAt}) Tj
ET

% Progress & CEFR Level Card
0.95 0.98 0.96 rg
40 390 515 135 re f
0.8 0.9 0.85 RG 1 w
40 390 515 135 re S

BT
/F2 12 Tf
0.04 0.4 0.2 rg
55 498 Td
(VERIFIED LANGUAGE PROFICIENCY MILESTONE) Tj
/F2 10 Tf
0.2 0.25 0.3 rg
55 470 Td
(Active Curriculum:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
180 470 Td
(${lang} Language Course) Tj

/F2 10 Tf
0.2 0.25 0.3 rg
55 448 Td
(CEFR Assessment Level:) Tj
/F2 12 Tf
0.1 0.4 0.2 rg
180 448 Td
(${cefr} - ${level}) Tj

/F2 10 Tf
0.2 0.25 0.3 rg
55 426 Td
(Lessons Completed:) Tj
/F1 10 Tf
0.1 0.1 0.1 rg
180 426 Td
(${student.lessonsCompleted} Verified Class Sessions with Native Instructors) Tj

/F2 10 Tf
0.2 0.25 0.3 rg
55 404 Td
(Current Academic Standing:) Tj
/F2 10 Tf
0.063 0.725 0.506 rg
180 404 Td
(In Good Standing - Actively Attending) Tj
ET

% Academic Competencies Checklist
BT
/F2 11 Tf
0.1 0.1 0.2 rg
40 355 Td
(ACADEMIC & WORKPLACE COMPETENCIES EVALUATED) Tj
/F1 9.5 Tf
0.2 0.25 0.3 rg
40 335 Td
([x] Oral Communication in Routine Workplace Contexts in Portugal) Tj
40 317 Td
([x] Written Professional Correspondence and Everyday Interaction) Tj
40 299 Td
([x] Listening Comprehension of Native European Portuguese Dialect) Tj
40 281 Td
([x] Essential Grammatical Syntax and Practical Vocabulary Foundation) Tj
ET

% Official Verification Stamp
0.039 0.090 0.220 RG 1.5 w
340 130 215 90 re S

BT
/F2 11 Tf
0.039 0.090 0.220 rg
355 195 Td
(OFFICIALLY CERTIFIED) Tj
/F1 9 Tf
0.2 0.2 0.2 rg
355 180 Td
(WorkSpeak Portugal Academy) Tj
355 165 Td
(Prof. Asad Khan - Lead Director) Tj
355 150 Td
(Lisbon Executive Center) Tj
ET

% Footer
BT
/F1 8.5 Tf
0.5 0.55 0.6 rg
40 50 Td
(This document verifies active enrollment and CEFR progress at WorkSpeak Portugal Language Academy.) Tj
ET
Q
`

  const blob = createPdfBlob([stream.trim()])
  triggerDownload(blob, `WorkSpeak-Progress-${name.replace(/\s+/g, '_')}.pdf`)
}

/**
 * 3. Generate & Download Standard Curriculum Worksheet / Material PDF
 */
export function downloadMaterialPdf(material: {
  title: string
  language: string
  level: string
  description: string
  type: string
}) {
  const title = escapePdfText(material.title)
  const lang = escapePdfText(material.language)
  const level = escapePdfText(material.level)
  const desc = escapePdfText(material.description)
  const type = escapePdfText(material.type)

  const stream = `
q
% Top Header
0.039 0.090 0.220 rg
0 740 595.28 102 re f

0.063 0.725 0.506 rg 0 737.5 198.4 2.5 re f
0.937 0.267 0.267 rg 198.4 737.5 198.4 2.5 re f
0.961 0.620 0.043 rg 396.8 737.5 198.4 2.5 re f

BT
/F2 18 Tf
1 1 1 rg
40 790 Td
(WORKSPEAK PORTUGAL - STUDY HANDOUT) Tj
ET

BT
/F1 10 Tf
0.8 0.85 0.95 rg
40 772 Td
(Official Curriculum Material & Practice Worksheet) Tj
ET

BT
/F1 9 Tf
0.7 0.75 0.85 rg
40 756 Td
(Track: ${lang} - Target Level: ${level} - Resource Type: ${type}) Tj
ET

% Content Header
BT
/F2 16 Tf
0.039 0.090 0.220 rg
40 680 Td
(${title}) Tj
ET

0.85 0.88 0.92 RG 1 w
40 665 m 555 665 l S

% Description Card
0.97 0.98 0.99 rg
40 585 515 65 re f
0.85 0.88 0.92 RG 1 w
40 585 515 65 re S

BT
/F2 10 Tf
0.2 0.3 0.4 rg
55 632 Td
(LESSON OVERVIEW & LEARNING OBJECTIVE) Tj
/F1 9.5 Tf
0.2 0.2 0.2 rg
55 612 Td
(${desc}) Tj
/F1 8.5 Tf
0.4 0.45 0.5 rg
55 597 Td
(Recommended for self-study review before and after live teacher sessions.) Tj
ET

% Core Exercises Framework
BT
/F2 12 Tf
0.1 0.1 0.2 rg
40 545 Td
(PART 1: WORKPLACE VOCABULARY & GRAMMAR EXERCISES) Tj
/F1 10 Tf
0.2 0.25 0.3 rg
40 520 Td
(1. Study the essential expressions and complete the contextual sentences below.) Tj
40 500 Td
(2. Translate the workplace communication scenarios into fluent standard Portuguese.) Tj
40 480 Td
(3. Practice oral pronunciation of key vowel sounds and nasal contractions (ao, ae, oes).) Tj
40 460 Td
(4. Write a 5-line professional email following the formal opening and closing protocol.) Tj
ET

% Note Taking Section
0.85 0.88 0.92 RG 1 w
40 150 515 280 re S

BT
/F2 10 Tf
0.4 0.45 0.5 rg
55 410 Td
(STUDENT CLASSROOM NOTES & PRACTICE AREA:) Tj
ET

% Ruled lines
0.9 0.92 0.95 RG 1 w
55 380 m 540 380 l S
55 350 m 540 350 l S
55 320 m 540 320 l S
55 290 m 540 290 l S
55 260 m 540 260 l S
55 230 m 540 230 l S
55 200 m 540 200 l S
55 170 m 540 170 l S

% Footer
BT
/F1 8.5 Tf
0.5 0.55 0.6 rg
40 50 Td
(WorkSpeak Portugal Language Academy - Curriculum Copyright 2026 - www.workspeak-portugal.com) Tj
ET
Q
`

  const blob = createPdfBlob([stream.trim()])
  triggerDownload(blob, `WorkSpeak-${title.replace(/\s+/g, '_')}.pdf`)
}
