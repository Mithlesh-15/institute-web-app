import { useEffect, useMemo, useState } from 'react'
import { X, Plus } from 'lucide-react'
import Button from '../ui/Button'
import FeeStatusBadge from './FeeStatusBadge'
import PendingBadge from './PendingBadge'
import PendingFeeCard from './PendingFeeCard'
import { getTodayDateValue } from '../../utils/feesManagement'

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function FeeDetailsModal({
  open,
  student,
  currentMonthYear,
  onClose,
  onSave,
  onMarkPaid,
  onEditPending,
  onAddFee,
  loading = false,
  actionLoadingId = '',
}) {
  const [status, setStatus] = useState('pending')
  const [pendingAmount, setPendingAmount] = useState('0')
  const [paymentDate, setPaymentDate] = useState('')

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newFeeMonth, setNewFeeMonth] = useState('')
  const [newFeeYear, setNewFeeYear] = useState('')
  const [newFeeStatus, setNewFeeStatus] = useState('paid')
  const [newFeeAmount, setNewFeeAmount] = useState('')
  const [newFeePaymentDate, setNewFeePaymentDate] = useState('')
  const [newFeeError, setNewFeeError] = useState('')

  useEffect(() => {
    if (!open || !student) {
      return
    }

    const currentFee = student.currentFee
    setStatus(currentFee?.status || 'pending')
    setPendingAmount(String(currentFee?.pendingAmount ?? 0))
    setPaymentDate(currentFee?.paymentDate || getTodayDateValue())

    setIsAddingNew(false)
    setNewFeeMonth(currentMonthYear?.month || 'January')
    setNewFeeYear(String(currentMonthYear?.year || new Date().getFullYear()))
    setNewFeeStatus('paid')
    setNewFeeAmount('')
    setNewFeePaymentDate(getTodayDateValue())
    setNewFeeError('')
  }, [open, student, currentMonthYear])

  const allFees = useMemo(() => student?.allFees || [], [student])

  if (!open || !student) {
    return null
  }

  const handleSave = async () => {
    await onSave({
      studentId: student.id,
      status,
      pendingAmount: status === 'pending' ? Number(pendingAmount || 0) : 0,
      paymentDate: status === 'paid' ? paymentDate : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Student fees
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {student.name || 'Student fees'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage the current month and review previous pending months.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-brand/20 hover:bg-slate-50 hover:text-brand"
            aria-label="Close fee details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.32))]">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand">
                  {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{student.name}</h3>
              <p className="text-sm text-slate-500">Class {student.className || 'N/A'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <FeeStatusBadge status={status} />
                {status === 'pending' ? <PendingBadge amount={pendingAmount} /> : null}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Current Month: {currentMonthYear.month} {currentMonthYear.year}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={[
                  'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  status === 'paid'
                    ? 'border-success bg-success text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-success/30 hover:text-success',
                ].join(' ')}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={[
                  'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  status === 'pending'
                    ? 'border-error bg-error text-white shadow-[0_12px_24px_rgba(239,68,68,0.22)]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-error/30 hover:text-error',
                ].join(' ')}
              >
                Pending
              </button>
            </div>

            {status === 'pending' ? (
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Pending Amount
                </span>
                <input
                  type="number"
                  min="0"
                  value={pendingAmount}
                  onChange={(event) => setPendingAmount(event.target.value)}
                  placeholder="500"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
                />
              </label>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Payment Date
                  </span>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(event) => setPaymentDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </label>
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  Paid records will store pending amount as zero and set the selected payment date.
                </div>
              </div>
            )}
          </div>

          {isAddingNew ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-base font-semibold text-slate-900">Add New Fee Record</h4>
              
              {newFeeError ? (
                <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-medium">
                  {newFeeError}
                </div>
              ) : null}

              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Month</label>
                    <select
                      value={newFeeMonth}
                      onChange={(e) => setNewFeeMonth(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    >
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</label>
                    <input
                      type="number"
                      value={newFeeYear}
                      onChange={(e) => setNewFeeYear(e.target.value)}
                      placeholder="2026"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-medium">Status</label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setNewFeeStatus('paid')}
                      className={[
                        'rounded-xl border py-2.5 text-sm font-semibold transition',
                        newFeeStatus === 'paid'
                          ? 'border-success bg-success text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:text-success hover:border-success/35',
                      ].join(' ')}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFeeStatus('pending')}
                      className={[
                        'rounded-xl border py-2.5 text-sm font-semibold transition',
                        newFeeStatus === 'pending'
                          ? 'border-error bg-error text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:text-error hover:border-error/35',
                      ].join(' ')}
                    >
                      Pending
                    </button>
                  </div>
                </div>

                {newFeeStatus === 'pending' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Pending Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={newFeePaymentDate}
                      onChange={(e) => setNewFeePaymentDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false)
                      setNewFeeError('')
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newFeeYear) {
                        setNewFeeError('Please enter a valid year.')
                        return
                      }
                      if (newFeeStatus === 'pending' && !newFeeAmount) {
                        setNewFeeError('Please enter the pending amount.')
                        return
                      }
                      setNewFeeError('')
                      try {
                        await onAddFee({
                          studentId: student.id,
                          month: newFeeMonth,
                          year: Number(newFeeYear),
                          status: newFeeStatus,
                          pendingAmount: newFeeStatus === 'pending' ? Number(newFeeAmount) : 0,
                          paymentDate: newFeeStatus === 'paid' ? newFeePaymentDate : null,
                        })
                        setIsAddingNew(false)
                        setNewFeeAmount('')
                      } catch (err) {
                        setNewFeeError(err instanceof Error ? err.message : 'Failed to add fee record.')
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl transition shadow-sm"
                  >
                    Submit Fee
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-semibold text-slate-900">Fee History</h4>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-[#f25d0d]">
                    Total Pending: {formatMoney(student.previousPendingAmount)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(true)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-brand hover:bg-blue-100 transition shadow-sm"
                    title="Add new fee record"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {allFees.length ? (
                  allFees.map((fee) => (
                    <PendingFeeCard
                      key={fee.id}
                      fee={fee}
                      onMarkPaid={onMarkPaid}
                      onEdit={onEditPending}
                      loading={actionLoadingId === fee.id}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    No fee history found for this student.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              loading={loading}
              loadingLabel="Saving fees..."
            >
              Save Fees
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeeDetailsModal
