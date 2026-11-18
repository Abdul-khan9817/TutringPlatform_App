import { getSession } from '@/lib/auth'
import { getAdminPayments } from '@/lib/admin-data'
import PaymentsClient from './payments-client'

export default async function ManagementPaymentsPage() {
  const session = await getSession()
  if (!session) return null

  const payments = await getAdminPayments()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
              Financial Ledger &amp; Receipts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Payments &amp; Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Settled Euro transactions, package purchases, and lesson receipts for WorkSpeak Portugal.
          </p>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200/80 self-start sm:self-auto shadow-2xs">
          EUR Currency · Portugal / EU
        </div>
      </div>

      <PaymentsClient initialPayments={payments} />
    </div>
  )
}
