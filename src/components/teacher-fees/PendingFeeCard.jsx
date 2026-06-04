import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, PencilLine, Wallet, X, Check } from 'lucide-react'
import FeeStatusBadge from './FeeStatusBadge'
import PendingBadge from './PendingBadge'

const getTodayDateValue = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function PendingFeeCard({ fee, onMarkPaid, onEdit, loading = false }) {
  const isPaid = fee.status === 'paid'
  const [isConfirmingPaid, setIsConfirmingPaid] = useState(false)
  const [paymentDate, setPaymentDate] = useState(getTodayDateValue())

  useEffect(() => {
    if (fee.paymentDate) {
      setPaymentDate(fee.paymentDate)
    } else {
      setPaymentDate(getTodayDateValue())
    }
  }, [fee])

  const handleConfirmPaid = async () => {
    try {
      await onMarkPaid(fee, paymentDate)
      setIsConfirmingPaid(false)
    } catch (err) {
      // Parent handle error
    }
  }

  return (
    <div
      className={[
        'rounded-3xl border p-4 shadow-soft transition hover:-translate-y-0.5',
        isPaid
          ? 'border-green-200 bg-green-50/70'
          : 'border-orange-200 bg-[linear-gradient(180deg,rgba(242,93,13,0.08),rgba(255,255,255,0.98))]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand" />
            <p className="text-base font-semibold text-slate-900">
              {fee.month} {fee.year}
            </p>
          </div>
        </div>
        <FeeStatusBadge status={fee.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isPaid ? (
          <div className="flex flex-col gap-1">
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-success w-fit">
              Cleared
            </span>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Paid on: <span className="font-semibold text-slate-800">{formatDisplayDate(fee.paymentDate)}</span>
            </p>
          </div>
        ) : (
          <PendingBadge amount={fee.pendingAmount} />
        )}
      </div>

      <div className="mt-4">
        {isConfirmingPaid ? (
          <div className="rounded-2xl border border-success/35 bg-white p-3 space-y-3">
            <label className="block">
              <span className="block text-xs font-semibold text-slate-600 mb-1">Select Payment Date</span>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-success focus:ring-1 focus:ring-success"
              />
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmingPaid(false)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-xl bg-success px-3 py-2 text-xs font-bold text-white hover:bg-green-600 transition shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            {!isPaid && (
              <button
                type="button"
                onClick={() => setIsConfirmingPaid(true)}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {loading ? 'Saving...' : 'Mark Paid'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(fee)}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand/25 hover:text-brand"
            >
              <PencilLine className="h-4 w-4" />
              {isPaid ? 'Edit Fee' : 'Edit Pending'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingFeeCard
