'use client'

import { useState, useMemo } from 'react'
import { PaymentRecord } from '@/lib/admin-data'
import { formatEuro } from '@/lib/money'
import { downloadReceiptPdf } from '@/lib/pdf-generator'

interface PaymentsClientProps {
  initialPayments: PaymentRecord[]
}

export default function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activePayment, setActivePayment] = useState<PaymentRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add Payment Form State
  const [payStudentName, setPayStudentName] = useState('')
  const [payStudentEmail, setPayStudentEmail] = useState('')
  const [payDescription, setPayDescription] = useState('')
  const [payAmount, setPayAmount] = useState(32)
  const [payMethod, setPayMethod] = useState<'Multibanco' | 'MB WAY' | 'Card' | 'Bank Transfer' | 'PayPal'>('MB WAY')
  const [payStatus, setPayStatus] = useState<'SUCCEEDED' | 'PENDING' | 'FAILED'>('SUCCEEDED')

  // Edit Payment Form State
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState(32)
  const [editMethod, setEditMethod] = useState('MB WAY')
  const [editStatus, setEditStatus] = useState<'SUCCEEDED' | 'PENDING' | 'FAILED'>('SUCCEEDED')

  // KPI computations (reactive from state)
  const kpi = useMemo(() => {
    const totalSucceeded = payments
      .filter((p) => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + p.amount, 0)
    const succeededCount = payments.filter((p) => p.status === 'SUCCEEDED').length
    const pendingCount = payments.filter((p) => p.status === 'PENDING').length
    return { totalSucceeded, succeededCount, pendingCount }
  }, [payments])

  // ── Add Payment ──────────────────────────────────────────
  function openAddModal() {
    setPayStudentName('')
    setPayStudentEmail('')
    setPayDescription('')
    setPayAmount(32)
    setPayMethod('MB WAY')
    setPayStatus('SUCCEEDED')
    setShowAddModal(true)
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_PAYMENT',
          payload: {
            studentName: payStudentName,
            studentEmail: payStudentEmail,
            description: payDescription,
            amount: Number(payAmount),
            method: payMethod,
            currency: 'EUR',
            status: payStatus,
            paidAt: new Date().toISOString(),
          },
        }),
      })
      const json = await res.json()
      if (res.ok && json.data) {
        setPayments((prev) => [json.data, ...prev])
        setShowAddModal(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Edit Payment ─────────────────────────────────────────
  function openEditModal(payment: PaymentRecord) {
    setActivePayment(payment)
    setEditDescription(payment.description)
    setEditAmount(payment.amount)
    setEditMethod(payment.method)
    setEditStatus(payment.status as 'SUCCEEDED' | 'PENDING' | 'FAILED')
    setShowEditModal(true)
  }

  async function handleEditPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!activePayment) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PAYMENT',
          payload: {
            id: activePayment.id,
            data: {
              description: editDescription,
              amount: Number(editAmount),
              method: editMethod,
              status: editStatus,
            },
          },
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === activePayment.id
              ? { ...p, description: editDescription, amount: Number(editAmount), method: editMethod, status: editStatus }
              : p
          )
        )
        setShowEditModal(false)
        setActivePayment(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete Payment ───────────────────────────────────────
  async function handleDeletePayment(id: string) {
    if (!confirm('Delete this payment record? This action cannot be undone.')) return
    const res = await fetch('/api/v1/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_PAYMENT', payload: { id } }),
    })
    if (res.ok) {
      setPayments((prev) => prev.filter((p) => p.id !== id))
    }
  }

  // ── Status Badge ─────────────────────────────────────────
  function statusClass(status: string) {
    if (status === 'SUCCEEDED') return 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
    if (status === 'FAILED') return 'bg-red-50 text-red-700 border-red-200/80'
    return 'bg-amber-50 text-amber-900 border-amber-200/80'
  }

  const inputCls = 'w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none'
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1'

  return (
    <>
      {/* ── KPI Cards ── */}
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Settled Volume */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Volume</p>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center text-sm font-bold">
              €
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {formatEuro(kpi.totalSucceeded)}
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
            <span>✓</span>
            <span>Cleared via Stripe &amp; MB WAY</span>
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transactions</p>
            <div className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-700 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{payments.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            {kpi.succeededCount} Succeeded · {kpi.pendingCount} Pending
          </p>
        </div>

        {/* Accepted Methods + Record Payment button */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted Methods</p>
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-extrabold text-slate-900 mt-2.5">Multibanco · MB WAY · Cards</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Compliant with Portuguese Tax &amp; VAT</p>
        </div>
      </div>

      {/* Record Payment Button row */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all"
        >
          + Record Payment
        </button>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction &amp; Student</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900">{p.studentName}</div>
                    <div className="text-xs text-slate-500">{p.studentEmail}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.invoiceNumber || p.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 text-xs">{p.description}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
                      {p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{p.paidAt}</td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-slate-900 text-sm">{formatEuro(p.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${statusClass(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'SUCCEEDED' ? (
                        <button
                          onClick={() =>
                            downloadReceiptPdf({
                              invoiceNumber: p.invoiceNumber,
                              reference: p.invoiceNumber || p.id,
                              studentName: p.studentName,
                              studentEmail: p.studentEmail,
                              description: p.description,
                              amount: p.amount,
                              method: p.method,
                              paidAt: p.paidAt,
                            })
                          }
                          className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                          title="Download payment confirmation"
                        >
                          Receipt PDF
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Available when paid</span>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-slate-400 hover:text-brand-700 transition-colors p-1 rounded-lg hover:bg-brand-50"
                        title="Edit Payment"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                        title="Delete Payment"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Payment Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Record Payment</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className={labelCls}>Student Name</label>
                <input
                  className={inputCls}
                  value={payStudentName}
                  onChange={(e) => setPayStudentName(e.target.value)}
                  placeholder="e.g. Maria Silva"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Student Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={payStudentEmail}
                  onChange={(e) => setPayStudentEmail(e.target.value)}
                  placeholder="e.g. maria@example.com"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input
                  className={inputCls}
                  value={payDescription}
                  onChange={(e) => setPayDescription(e.target.value)}
                  placeholder="e.g. Portuguese Starter 10-Lesson Package"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Amount (EUR)</label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  className={inputCls}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Payment Method</label>
                <select
                  className={inputCls}
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as typeof payMethod)}
                >
                  <option value="MB WAY">MB WAY</option>
                  <option value="Multibanco">Multibanco</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  value={payStatus}
                  onChange={(e) => setPayStatus(e.target.value as typeof payStatus)}
                >
                  <option value="SUCCEEDED">SUCCEEDED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Record Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Payment Modal ── */}
      {showEditModal && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Edit Payment</h2>
                <p className="text-xs text-slate-500 mt-0.5">{activePayment.studentName} · {activePayment.invoiceNumber || activePayment.id}</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setActivePayment(null) }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditPayment} className="space-y-3">
              <div>
                <label className={labelCls}>Description</label>
                <input
                  className={inputCls}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Amount (EUR)</label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  className={inputCls}
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Payment Method</label>
                <select
                  className={inputCls}
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value)}
                >
                  <option value="MB WAY">MB WAY</option>
                  <option value="Multibanco">Multibanco</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Credit Card (Stripe)">Credit Card (Stripe)</option>
                  <option value="SEPA Bank Transfer">SEPA Bank Transfer</option>
                  <option value="Multibanco Reference">Multibanco Reference</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as typeof editStatus)}
                >
                  <option value="SUCCEEDED">SUCCEEDED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setActivePayment(null) }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
