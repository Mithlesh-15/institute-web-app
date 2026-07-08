import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ArrowRight } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-classes/EmptyState'
import FilterTabs from '../../components/teacher-classes/FilterTabs'
import SearchBar from '../../components/teacher-classes/SearchBar'
import { fetchCompletedClasses } from '../../utils/classesManagement'

const COMPLETED_CLASS_OPTIONS = ['All', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG', 'Other']

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

function TeacherCompletedClasses() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')

  useEffect(() => {
    let mounted = true
    const loadCompletedClasses = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchCompletedClasses()
        if (mounted) {
          setClasses(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unable to load completed classes.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadCompletedClasses()
    return () => {
      mounted = false
    }
  }, [])

  // Filter completed classes by search term and class level
  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase()
    return classes.filter((c) => {
      const matchesFilter = classFilter === 'All' || c.classLevel === classFilter
      const matchesSearch =
        !term ||
        c.className.toLowerCase().includes(term) ||
        c.classLevel.toLowerCase().includes(term)

      return matchesFilter && matchesSearch
    })
  }, [classes, search, classFilter])

  // Check states
  const hasClasses = classes.length > 0
  const hasFilteredClasses = filteredClasses.length > 0

  return (
    <div className="space-y-6">
      {/* Top Welcome Section */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Completed Classes
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Review history, attendance records, and test marks of finished batches.
            </p>
          </div>

          <div className="lg:w-[24rem]">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search archived classes..."
            />
          </div>
        </div>
      </section>

      {/* Class Level Classification Tabs */}
      <SectionCard title="Class wise classification">
        <FilterTabs value={classFilter} options={COMPLETED_CLASS_OPTIONS} onChange={setClassFilter} />
      </SectionCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : !hasClasses ? (
        <EmptyState
          title="No completed classes found"
          description="Classes you complete will appear here as archives."
        />
      ) : !hasFilteredClasses ? (
        <EmptyState
          title="No completed classes match your filters"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <article
              key={classItem.id}
              onClick={() => navigate(`/teacher/completed-classes/${classItem.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 flex flex-col justify-between h-44"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {classItem.className}
                    </h3>
                    <span className="mt-1.5 inline-block rounded-full bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                      {classItem.classLevel}
                    </span>
                  </div>
                  
                  {/* Completion Badge */}
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-250 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Completed
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  <span>Started {formatDate(classItem.startDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                <span>{classItem.totalStudents || 0} Students assigned</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeacherCompletedClasses
