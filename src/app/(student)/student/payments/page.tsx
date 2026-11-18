import { EmptyStateIcon } from '@/components/ui/empty-state-icon'
import { PaymentsReceiptButton } from './payments-receipt-button'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser, getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatEuro } from '@/lib/money'

const STATUS_STYLE: Record<string, string> = {
  SUCCEEDED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  FAILED: 'border-red-200 bg-red-50 text-red-800',
  REFUNDED: 'border-sky-200 bg-sky-50 text-sky-800',
  PARTIALLY_REFUNDED: 'border-sky-200 bg-sky-50 text-sky-800',
  EXPIRED: 'border-slate-200 bg-slate-100 text-slate-700',
}

const STATUS_LABEL: Record<string, string> = {
  SUCCEEDED: 'Paid',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially refunded',
  EXPIRED: 'Expired',
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-PT', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)

export default async function StudentPaymentsPage() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== 'STUDENT') redirect('/management/dashboard')

  const [user, records] = await Promise.all([
    getAuthenticatedUser(session),
    prisma.payment.findMany({
      where: { studentId: session.sub },
      include: {
        booking: { include: { service: { select: { name: true } } } },
        packagePurchase: { include: { package: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const payments = records.map((payment) => ({
    id: payment.id,
    description: payment.booking?.service.name ?? payment.packagePurchase?.package.name ?? 'Language service payment',
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    date: payment.paidAt ?? payment.createdAt,
    method: 'Card',
    reference: payment.stripePaymentIntentId ?? payment.id,
    paidAt: payment.paidAt,
  }))

  const successfulPayments = payments.filter((payment) => payment.status === 'SUCCEEDED')
  const totalPaid = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const pendingPayments = payments.filter((payment) => payment.status === 'PENDING')
  const pendingTotal = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in font-sans">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-800">
            Billing
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Payments &amp; receipts</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Review your payment history and download a confirmation for completed payments.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs sm:self-auto">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 text-[11px] font-extrabold text-slate-700">€</span>
          All amounts in EUR
        </span>
      </header>

      <section aria-label="Payment summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-brand-300 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total paid</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{formatEuro(totalPaid)}</p>
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Completed payments only</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-brand-300 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed payments</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{successfulPayments.length}</p>
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Receipts are available for completed transactions</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-brand-300 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{formatEuro(pendingTotal)}</p>
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{pendingPayments.length} {pendingPayments.length === 1 ? 'transaction' : 'transactions'} awaiting payment</p>
        </div>
      </section>

      {payments.length === 0 ? (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs sm:p-12">
          <EmptyStateIcon name="payment" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">No payments yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Completed and pending transactions will appear here after you book a lesson or purchase a package.</p>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs" aria-labelledby="payment-history-heading">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="payment-history-heading" className="text-sm font-extrabold text-slate-900">Payment history</h2>
              <p className="mt-0.5 text-xs text-slate-500">Transaction details and downloadable confirmations</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{payments.length} {payments.length === 1 ? 'transaction' : 'transactions'}</span>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Date</th>
                  <th scope="col" className="px-5 py-3.5">Payment</th>
                  <th scope="col" className="px-5 py-3.5">Method</th>
                  <th scope="col" className="px-5 py-3.5">Amount</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-600">{formatDate(payment.date)}</td>
                    <td className="max-w-[280px] px-5 py-4">
                      <p className="truncate font-semibold text-slate-900">{payment.description}</p>
                      <p className="mt-1 truncate font-mono text-[10px] text-slate-400" title={payment.reference}>Ref {payment.reference}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600">{payment.method}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-extrabold text-slate-900">{formatEuro(payment.amount)}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[payment.status] ?? STATUS_STYLE.EXPIRED}`}>
                        {STATUS_LABEL[payment.status] ?? payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {payment.status === 'SUCCEEDED' && payment.paidAt ? (
                        <PaymentsReceiptButton payment={{
                          reference: payment.reference,
                          studentName: user.name,
                          studentEmail: session.email,
                          description: payment.description,
                          amount: payment.amount,
                          method: payment.method,
                          paidAt: payment.paidAt.toISOString(),
                        }} />
                      ) : (
                        <span className="text-xs text-slate-400">Available after payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-relaxed text-slate-500">
            Receipts confirm completed transactions. For a fiscal invoice, please contact the academy.
          </p>
        </section>
      )}
    </div>
  )
}
