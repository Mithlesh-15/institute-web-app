import { Check, X, UserCircle2 } from 'lucide-react'

function AttendanceRow({ student, status, onChange, presentLabel = 'Present', absentLabel = 'Absent' }) {
  const isPresent = status === 'present'
  const isAbsent = status === 'absent'

  const setStatus = (nextStatus) => {
    if (typeof onChange === 'function') {
      onChange(student.id, nextStatus)
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft transition hover:border-[#2563eb]/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.32))]">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#2563eb]">
                {student.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{student.name || 'Unnamed student'}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <UserCircle2 className="h-4 w-4 text-[#2563eb]" />
                Class {student.className || 'N/A'}
              </span>
              <span>{student.phone || 'No phone available'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatus('present')}
            className={[
              'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
              isPresent
                ? 'bg-[#22c55e] text-white shadow-[0_12px_24px_rgba(34,197,94,0.22)]'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-[#22c55e]/30 hover:text-[#22c55e]',
            ].join(' ')}
          >
            <Check className="h-4 w-4" />
            {presentLabel}
          </button>
          <button
            type="button"
            onClick={() => setStatus('absent')}
            className={[
              'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
              isAbsent
                ? 'bg-[#ef4444] text-white shadow-[0_12px_24px_rgba(239,68,68,0.22)]'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-[#ef4444]/30 hover:text-[#ef4444]',
            ].join(' ')}
          >
            <X className="h-4 w-4" />
            {absentLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceRow
