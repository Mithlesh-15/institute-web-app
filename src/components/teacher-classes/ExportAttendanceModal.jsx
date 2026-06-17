import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import { MONTHS } from '../../utils/attendanceExport'

function ExportAttendanceModal({
  open,
  classes = [],
  onClose,
  onExport,
  loading = false
}) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // 1-indexed
  const currentYear = currentDate.getFullYear()

  const [classId, setClassId] = useState('all')
  const [month, setMonth] = useState(String(currentMonth))
  const [year, setYear] = useState(String(currentYear))

  useEffect(() => {
    if (open) {
      setClassId('all')
      setMonth(String(currentMonth))
      setYear(String(currentYear))
    }
  }, [open, currentMonth, currentYear])

  if (!open) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onExport(classId, Number(month), Number(year))
  }

  // Generate year options from 2024 to current year + 4
  const yearOptions = []
  for (let y = 2024; y <= currentYear + 4; y++) {
    yearOptions.push(String(y))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Attendance Report
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Export Attendance
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select a month and year to generate a professional Excel spreadsheet.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-brand/20 hover:bg-slate-50 hover:text-brand"
            aria-label="Close export form"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Class</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="all">All Classes</option>
              {classes.map((cItem) => (
                <option key={cItem.id} value={cItem.id}>
                  {cItem.className || 'Class'}{cItem.classLevel ? ` (${cItem.classLevel})` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Month</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {MONTHS.map((mName, idx) => (
                <option key={mName} value={String(idx + 1)}>
                  {mName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {yearOptions.map((yOpt) => (
                <option key={yOpt} value={yOpt}>
                  {yOpt}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              loadingLabel="Generating..."
            >
              Generate
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExportAttendanceModal
