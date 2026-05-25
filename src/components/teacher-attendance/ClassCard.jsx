import { CalendarDays, Users } from 'lucide-react'

const formatDate = (value) => {
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

function ClassCard({ classItem, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(classItem)}
      className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]"
    >
      <div className="h-1.5 bg-[linear-gradient(90deg,#2563eb,#f25d0d)]" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {classItem.className || 'Unnamed class'}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {classItem.classLevel || 'N/A'}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {Number.isFinite(classItem.totalStudents)
                  ? `${classItem.totalStudents} students`
                  : '0 students'}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-[#f25d0d]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4 text-[#2563eb]" />
          <span>Starts {formatDate(classItem.startDate)}</span>
        </div>
      </div>
    </button>
  )
}

export default ClassCard
