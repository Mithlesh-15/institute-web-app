import { CalendarDays, UserCircle2 } from 'lucide-react'
import FeeStatusBadge from './FeeStatusBadge'
import PendingBadge from './PendingBadge'

function StudentFeeCard({ student, onClick }) {
  const currentFee = student.currentFee

  return (
    <button
      type="button"
      onClick={() => onClick(student)}
      className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.32))]">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                {student.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {student.name || 'Unnamed student'}
              </h3>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-[#2563eb]" />
                <span>Class {student.className || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                <span>{student.previousPendingCount || 0} previous pending months</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-700">Current Month</div>
          <FeeStatusBadge status={currentFee?.status || 'pending'} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {currentFee?.status === 'pending' ? (
            <PendingBadge amount={currentFee.pendingAmount} />
          ) : (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#22c55e]">
              Current month clear
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs text-slate-500">Pending Months</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {student.totalPendingCount || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs text-slate-500">Pending Amount</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              ₹{Number(student.totalPendingAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

export default StudentFeeCard
