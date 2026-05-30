import { BadgeCheck, CircleAlert, CreditCard } from 'lucide-react'
import { formatPortalCurrency, formatPortalDate } from '../../utils/studentPortal'

function FeeCard({ fee }) {
  const isPaid = fee.status === 'paid'

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {fee.month} {fee.year}
          </h3>
          <div
            className={[
              'mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
            ].join(' ')}
          >
            {isPaid ? <BadgeCheck className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
            {isPaid ? 'Paid' : 'Pending'}
          </div>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
          <CreditCard className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Pending Amount</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {formatPortalCurrency(fee.pendingAmount)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Payment Date</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {fee.paymentDate ? formatPortalDate(fee.paymentDate) : 'Not paid yet'}
          </p>
        </div>
      </div>
    </article>
  )
}

export default FeeCard
