import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import FeeStatusBadge from './FeeStatusBadge'
import PendingBadge from './PendingBadge'
import PendingFeeCard from './PendingFeeCard'

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function FeeDetailsModal({
  open,
  student,
  currentMonthYear,
  onClose,
  onSave,
  onMarkPaid,
  onEditPending,
  loading = false,
  actionLoadingId = '',
}) {
  const [status, setStatus] = useState('pending')
  const [pendingAmount, setPendingAmount] = useState('0')

  useEffect(() => {
    if (!open || !student) {
      return
    }

    const currentFee = student.currentFee
    setStatus(currentFee?.status || 'pending')
    setPendingAmount(String(currentFee?.pendingAmount ?? 0))
  }, [open, student])

  const previousPendingFees = useMemo(() => student?.previousPendingFees || [], [student])

  if (!open || !student) {
    return null
  }

  const handleSave = async () => {
    await onSave({
      studentId: student.id,
      status,
      pendingAmount: status === 'pending' ? Number(pendingAmount || 0) : 0,
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
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Paid records will store pending amount as zero and set the payment date.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-slate-900">Previous Pending Months</h4>
              <div className="text-sm font-semibold text-[#f25d0d]">
                Total {formatMoney(student.previousPendingAmount)}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {previousPendingFees.length ? (
                previousPendingFees.map((fee) => (
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
                  No previous pending months for this student.
                </div>
              )}
            </div>
          </div>

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
