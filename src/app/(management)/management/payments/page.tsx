import { getSession } from '@/lib/auth'
import { getAdminPayments } from '@/lib/admin-data'
import { formatEuro } from '@/lib/money'

export default async function ManagementPaymentsPage() {
  const session = await getSession()
  if (!session) return null

  const payments = await getAdminPayments()

  const totalSucceeded = payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
              Financial Ledger & Receipts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Payments & Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Settled Euro transactions, package purchases, and lesson receipts for WorkSpeak Portugal.
          </p>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200/80 self-start sm:self-auto shadow-2xs">
          EUR Currency · Portugal / EU
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Settled Volume
            </p>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center text-sm font-bold">
              €
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {formatEuro(totalSucceeded)}
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
            <span>✓</span>
            <span>Cleared via Stripe & MB WAY</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Transactions
            </p>
            <div className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-700 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {payments.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            {payments.filter((p) => p.status === 'SUCCEEDED').length} Succeeded · {payments.filter((p) => p.status === 'PENDING').length} Pending
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accepted Methods
            </p>
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-extrabold text-slate-900 mt-2.5">
            Multibanco · MB WAY · Cards
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Compliant with Portuguese Tax & VAT
          </p>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction & Student</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900">{p.studentName}</div>
                    <div className="text-xs text-slate-500">{p.studentEmail}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 text-xs">{p.description}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
                      {p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {p.paidAt}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-slate-900 text-sm">{formatEuro(p.amount)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${
                        p.status === 'SUCCEEDED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                          : 'bg-amber-50 text-amber-900 border-amber-200/80'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
