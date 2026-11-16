import { getSession } from '@/lib/auth'
import { getStudentPayments } from '@/lib/student-data'
import { formatEuro } from '@/lib/money'

const STATUS_COLOR: Record<string, string> = {
  SUCCEEDED: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-sky-100 text-sky-800',
}

export default async function StudentPaymentsPage() {
  const session = await getSession()
  if (!session) return null

  const payments = getStudentPayments()

  const totalPaid = payments
    .filter(p => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payment History</h1>
        <p className="text-slate-500 mt-1">Your transactions and receipts</p>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-extrabold text-brand-700">{formatEuro(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Transactions</p>
          <p className="text-2xl font-extrabold text-slate-900">{payments.filter(p => p.status === 'SUCCEEDED').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Payment</p>
          <p className="text-sm font-bold text-slate-900">
            {payments[0] ? new Date(payments[0].date).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-3" aria-hidden="true">💳</p>
          <p className="font-semibold text-slate-700">No payments yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-slate-900 font-medium">
                      <div>{p.description}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.reference}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{p.method}</td>
                    <td className="px-5 py-3 text-slate-900 font-semibold whitespace-nowrap">{formatEuro(p.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
