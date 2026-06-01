import { CalendarDays, ChevronRight, Layers3 } from 'lucide-react'
import { formatPortalDate } from '../../utils/studentPortal'

function ClassCard({ classItem, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(classItem)}
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-1 hover:border-brand/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{classItem.className}</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-brand" />
              <span>Class: {classItem.classType || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand" />
              <span>{formatPortalDate(classItem.startDate)}</span>
            </div>
          </div>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-brand">
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  )
}

export default ClassCard
