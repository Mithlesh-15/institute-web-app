import { useEffect, useState } from 'react'
import { GraduationCap, X } from 'lucide-react'
import ClassCard from '../../components/student-portal/ClassCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentClasses, formatPortalDate } from '../../utils/studentPortal'

function StudentClasses() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadClasses = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStudentClasses()

        if (mounted) {
          setClasses(data)
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load classes right now.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadClasses()

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
              className="h-48 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : classes.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} onClick={setSelectedClass} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No classes joined yet.
        </div>
      )}

      {selectedClass ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                  Class Details
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

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Class Name</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {selectedClass.className}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Start Date</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
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
