import { useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck2, CreditCard, GraduationCap, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import NoticeCard from '../../components/student-portal/NoticeCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentDashboardData, formatPortalCurrency } from '../../utils/studentPortal'
import { fetchLiveEvents } from '../../utils/galleryManagement'

const quickActions = [
  {
    title: 'My Classes',
    to: '/student/classes',
    icon: GraduationCap,
  },
  {
    title: 'Attendance',
    to: '/student/attendance',
    icon: CalendarCheck2,
  },
  {
    title: 'Fees Summary',
    to: '/student/fees',
    icon: CreditCard,
  },
]

function StudentDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    let mounted = true

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError('')
        const [dashData, liveData] = await Promise.all([
          fetchStudentDashboardData(),
          fetchLiveEvents()
        ])

        if (mounted) {
          setDashboard(dashData)
          setLiveClasses(liveData || [])
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load dashboard right now.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    )
  }

  const activeLive = liveClasses.length > 0 ? liveClasses[0] : null
  const noticesList = dashboard?.notices || []

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
          Dashboard
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {dashboard?.profile?.name || 'Student'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Class {dashboard?.profile?.className || 'N/A'}
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Fast overview for classes, attendance and fees
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StudentStatCard
          label="Current Month Attendance"
          value={`${dashboard?.stats?.currentMonthAttendancePercentage || 0}%`}
          hint="Based on marked records this month"
          icon={CalendarCheck2}
        />
        <StudentStatCard
          label="Pending Fees"
          value={formatPortalCurrency(dashboard?.stats?.totalPendingAmount || 0)}
          hint="Total pending across fee history"
          icon={CreditCard}
          tone="amber"
        />
        <StudentStatCard
          label="Joined Classes"
          value={dashboard?.stats?.totalJoinedClasses || 0}
          hint="Total classes assigned to you"
          icon={GraduationCap}
          tone="slate"
        />
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
            <p className="mt-1 text-sm text-slate-500">Jump straight to the pages you use most.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.title}
                to={item.to}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-[#2563eb]/20 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                </div>
                <h2 className="mt-5 text-base font-semibold text-slate-900">{item.title}</h2>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notice Board</h2>
            <p className="mt-1 text-sm text-slate-500">Latest updates from your tuition.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {dashboard?.notices?.length ? (
            dashboard.notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 xl:col-span-2">
              No notices available right now.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default StudentDashboard
