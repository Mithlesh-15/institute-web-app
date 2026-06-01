import { useState } from 'react'
import { CalendarCheck2, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import AttendanceCard from '../../components/student-portal/AttendanceCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentAttendanceData, formatPortalDate } from '../../utils/studentPortal'

const groupHistoryByMonth = (history) => {
  const groups = {}
  history.forEach((record) => {
    if (!record.attendanceDate) return
    const date = new Date(record.attendanceDate)
    if (Number.isNaN(date.getTime())) return
    const monthName = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    if (!groups[monthName]) {
      groups[monthName] = {
        monthName,
        records: [],
        present: 0,
        absent: 0,
      }
    }
    groups[monthName].records.push(record)
    if (record.status === 'present') {
      groups[monthName].present++
    } else {
      groups[monthName].absent++
    }
  })
  return Object.values(groups)
}

function StudentAttendance() {
  const [selectedClass, setSelectedClass] = useState(null)

  const { data: attendanceData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['studentAttendance'],
    queryFn: fetchStudentAttendanceData,
    staleTime: 3 * 60 * 60 * 1000, // 3 hours
    gcTime: 3 * 60 * 60 * 1000,    // 3 hours
  })

  const attendance = attendanceData?.classes || []
  const monthPercentage = attendanceData?.currentMonthAttendancePercentage || 0
  const error = queryError ? (queryError.message || 'Unable to load attendance right now.') : ''

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Attendance
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">My Attendance</h1>
          </div>
          <div className="w-full max-w-xs">
            
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : attendance.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {attendance.map((classItem) => (
            <AttendanceCard key={classItem.id} classItem={classItem} onClick={setSelectedClass} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No attendance records found yet.
        </div>
      )}

      {selectedClass ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center animate-fade-in">
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  Attendance History
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {selectedClass.className}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 max-h-112 space-y-6 overflow-y-auto pr-1">
              {selectedClass.history.length ? (
                groupHistoryByMonth(selectedClass.history).map((group) => (
                  <div key={group.monthName} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-semibold text-slate-900">{group.monthName}</h3>
                      <div className="flex gap-2 text-xs font-medium">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                          Present: {group.present}
                        </span>
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">
                          Absent: {group.absent}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {group.records.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                        >
                          <p className="text-sm font-medium text-slate-700">
                            {formatPortalDate(record.attendanceDate)}
                          </p>
                          <span
                            className={[
                              'rounded-full px-2.5 py-1 text-xs font-semibold',
                              record.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-600',
                            ].join(' ')}
                          >
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No history available for this class.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StudentAttendance
