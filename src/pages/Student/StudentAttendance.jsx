import { useEffect, useState } from 'react'
import { CalendarCheck2, X } from 'lucide-react'
import AttendanceCard from '../../components/student-portal/AttendanceCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentAttendanceData, formatPortalDate } from '../../utils/studentPortal'

function StudentAttendance() {
  const [attendance, setAttendance] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [monthPercentage, setMonthPercentage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadAttendance = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStudentAttendanceData()

        if (mounted) {
          setAttendance(data.classes)
          setMonthPercentage(data.currentMonthAttendancePercentage)
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load attendance right now.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAttendance()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Attendance
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">My attendance</h1>
          </div>
          <div className="w-full max-w-xs">
            <StudentStatCard
              label="Current Month Attendance"
              value={`${monthPercentage}%`}
              hint="Across all your joined classes"
              icon={CalendarCheck2}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : attendance.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {attendance.map((classItem) => (
            <AttendanceCard key={classItem.id} classItem={classItem} onClick={setSelectedClass} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No attendance records found yet.
        </div>
      )}

      {selectedClass ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                  Attendance History
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {selectedClass.className}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
              {selectedClass.history.length ? (
                selectedClass.history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPortalDate(record.attendanceDate)}
                      </p>
                    </div>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        record.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600',
                      ].join(' ')}
                    >
                      {record.status === 'present' ? 'Present' : 'Absent'}
                    </span>
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
