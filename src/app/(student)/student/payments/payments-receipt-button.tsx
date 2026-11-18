'use client'

import { downloadReceiptPdf } from '@/lib/pdf-generator'

interface Props {
  payment: {
    reference: string
    studentName: string
    studentEmail: string
    description: string
    amount: number
    method: string
    paidAt: string
  }
}

export function PaymentsReceiptButton({ payment }: Props) {
  return (
    <button
      onClick={() => downloadReceiptPdf(payment)}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      title="Download payment confirmation"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download receipt
    </button>
  )
}
