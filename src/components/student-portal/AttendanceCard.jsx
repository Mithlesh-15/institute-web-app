import { CalendarCheck2, ChevronRight, CircleX } from 'lucide-react'

function AttendanceCard({ classItem, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(classItem)}
      className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-1 hover:border-[#2563eb]/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">{classItem.className}</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Attendance</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{classItem.percentage}%</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-700">Present</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">{classItem.presentCount}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3">
              <p className="text-xs font-medium text-red-600">Absent</p>
              <p className="mt-2 text-lg font-semibold text-red-600">{classItem.absentCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
            <ChevronRight className="h-4 w-4" />
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {classItem.totalCount} records
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
        <CalendarCheck2 className="h-4 w-4 text-[#2563eb]" />
        <span>Tap to view full history</span>
        {classItem.absentCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
            <CircleX className="h-3.5 w-3.5" />
            {classItem.absentCount} absent
          </span>
        ) : null}
      </div>
    </button>
  )
}

export default AttendanceCard
