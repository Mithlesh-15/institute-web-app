import { CalendarDays, CheckCircle2, PencilLine, Wallet } from 'lucide-react'
import FeeStatusBadge from './FeeStatusBadge'
import PendingBadge from './PendingBadge'

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

  return (
    <div
      className={[
        'rounded-[1.5rem] border p-4 shadow-soft transition hover:-translate-y-0.5',
        isPaid
          ? 'border-green-200 bg-green-50/70'
          : 'border-orange-200 bg-[linear-gradient(180deg,rgba(242,93,13,0.08),rgba(255,255,255,0.98))]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#2563eb]" />
            <p className="text-base font-semibold text-slate-900">
              {fee.month} {fee.year}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Last updated/payment date: {formatDisplayDate(fee.paymentDate || fee.createdAt)}
          </p>
        </div>
        <FeeStatusBadge status={fee.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isPaid ? (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#22c55e]">
            Cleared
          </span>
        ) : (
          <PendingBadge amount={fee.pendingAmount} />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onMarkPaid(fee)}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading ? 'Saving...' : 'Mark Paid'}
        </button>
        <button
          type="button"
          onClick={() => onEdit(fee)}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#2563eb]/25 hover:text-[#2563eb]"
        >
          <PencilLine className="h-4 w-4" />
          {loading ? 'Saving...' : 'Edit Pending'}
        </button>
      </div>
    </div>
  )
}

export default PendingFeeCard
