import { useState } from 'react'
import { GraduationCap, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import ClassCard from '../../components/student-portal/ClassCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentClasses, formatPortalDate, formatPortalTime } from '../../utils/studentPortal'

function StudentClasses() {
  const [selectedClass, setSelectedClass] = useState(null)

  const { data: classes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['studentClasses'],
    queryFn: fetchStudentClasses,
    staleTime: 1 * 60 * 60 * 1000, // 2 hours
    gcTime: 1 * 60 * 60 * 1000,    // 2 hours
  })

  const error = queryError ? (queryError.message || 'Unable to load classes right now.') : ''

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              My Classes
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Joined classes</h1>
          </div>
          <div className="w-full max-w-xs">
            <StudentStatCard
              label="Total Joined Classes"
              value={classes.length}
              hint="Classes assigned to your profile"
              icon={GraduationCap}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : classes.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} onClick={setSelectedClass} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No classes joined yet.
        </div>
      )}

      {selectedClass ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center animate-fade-in">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  Class Details
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

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Name</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900">
                  {selectedClass.className}
                </p>
              </div>
              
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class (Batch/Standard)</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900">
                  {selectedClass.classType || 'N/A'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Time</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900">
                  {formatPortalTime(selectedClass.classTime)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</p>
                <p className="mt-1.5 text-base font-semibold text-slate-900">
                  {formatPortalDate(selectedClass.startDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StudentClasses
