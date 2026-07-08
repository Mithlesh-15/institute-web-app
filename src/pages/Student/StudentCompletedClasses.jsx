import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ArrowRight } from 'lucide-react'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentCompletedClasses } from '../../utils/studentPortal'

const CACHE_TIME_12_HOURS = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function StudentCompletedClasses() {
  const navigate = useNavigate()

  // React Query to cache completed classes list for 12 hours
  const { data: classes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['studentCompletedClasses'],
    queryFn: fetchStudentCompletedClasses,
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
  })

  const error = queryError ? (queryError.message || 'Unable to load completed classes.') : ''

  return (
    <div className="space-y-6">
      {/* Welcome Title Banner */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              History
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Completed Classes
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Access your historical attendance logs and test score sheets.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <StudentStatCard
              label="Archived Classes"
              value={classes.length}
              hint="Completed classes assigned to your profile"
              icon={CalendarDays}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : !classes.length ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            📚
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800">No completed classes yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Classes you successfully complete will show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((classItem) => (
            <article
              key={classItem.id}
              onClick={() => navigate(`/student/completed-classes/${classItem.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-350 flex flex-col justify-between h-40"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-800 group-hover:text-[#2563eb] transition-colors">
                      {classItem.className}
                    </h3>
                    <span className="mt-1.5 inline-block rounded-full bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                      {classItem.classLevel}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    Completed
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  <span>Started {formatDate(classItem.startDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 group-hover:text-[#2563eb] transition-colors">
                <span>View My Records</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentCompletedClasses
