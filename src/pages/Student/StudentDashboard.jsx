import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  Megaphone,
  Video,
  ExternalLink,
  Image,
  UserRound,
  Bell
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentDashboardData, formatPortalCurrency } from '../../utils/studentPortal'
import { fetchLiveEvents } from '../../utils/galleryManagement'

const quickActions = [
  {
    title: 'My Classes',
    to: '/student/classes',
    icon: GraduationCap,
    description: 'View schedules and subjects',
    accent: 'text-blue-600 bg-blue-50'
  },
  {
    title: 'Attendance',
    to: '/student/attendance',
    icon: CalendarCheck2,
    description: 'Track monthly presence rate',
    accent: 'text-emerald-600 bg-emerald-50'
  },
  {
    title: 'Fees',
    to: '/student/fees',
    icon: CreditCard,
    description: 'Review pending dues and bills',
    accent: 'text-amber-600 bg-amber-50'
  },
  {
    title: 'Gallery',
    to: '/student/gallery',
    icon: Image,
    description: 'Browse coaching event photos',
    accent: 'text-purple-600 bg-purple-50'
  },
  {
    title: 'Live Class',
    to: '/student/live',
    icon: Video,
    description: 'Join active online class streams',
    accent: 'text-red-600 bg-red-50'
  },
  {
    title: 'My Profile',
    to: '/student/profile',
    icon: UserRound,
    description: 'View student profile details',
    accent: 'text-slate-600 bg-slate-100'
  }
]

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    loadDashboardData()

    return () => {
      mounted = false
    }
  }, [])

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr >= 5 && hr < 12) return 'Good morning'
    if (hr >= 12 && hr < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
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
      {/* Styles for simple scrollable list (no animation to prevent glitches) */}
      <style>{`
        .notice-list-viewport {
          max-height: 250px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
        }
        .notice-list-viewport::-webkit-scrollbar {
          width: 4px;
        }
        .notice-list-viewport::-webkit-scrollbar-track {
          background: transparent;
        }
        .notice-list-viewport::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .notice-list-track {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>

      {/* 1. Live Class Alert (Renders at the very top if any live class is active) */}
      {activeLive && (
        <div className="rounded-[1.75rem] border border-red-200 bg-gradient-to-r from-red-50 to-red-100/30 p-5 shadow-soft flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shrink-0 shadow-md">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-red-700">Live Class is Active!</h2>
              <p className="text-sm text-red-600 font-semibold mt-0.5">
                {activeLive.eventName}
              </p>
            </div>
          </div>
          {activeLive.link ? (
            <a
              href={activeLive.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 shadow-md shrink-0 active:scale-95"
            >
              Join Live Class Now
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      )}

      {/* 2. Welcome Greeting Header Block */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
          {getFormattedDate()}
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {getGreeting()}, {dashboard?.profile?.name || 'Student'}!
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Grade Class: {dashboard?.profile?.className || 'N/A'}
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            Welcome to the Raj Tuition Classes student portal dashboard.
          </div>
        </div>
      </section>

      {/* 3. Event Notices Up-to-Down Scrolling Marquee Container */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb] shrink-0">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Events Notice Board</h2>
            <p className="mt-0.5 text-xs text-slate-400">Continuous feed. Hover to pause, click to open links.</p>
          </div>
        </div>

        <div className="mt-5 border border-slate-100 bg-slate-50/50 rounded-2xl p-3">
          {noticesList.length ? (
            <div className="notice-list-viewport">
              <div className="notice-list-track">
                {noticesList.map((notice, idx) => (
                  <div
                    key={`${notice.id}-${idx}`}
                    onClick={() => {
                      if (notice.noticeLink) {
                        window.open(notice.noticeLink, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-sm transition hover:border-[#2563eb]/25 ${
                      notice.noticeLink ? 'cursor-pointer hover:bg-blue-50/10' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Bell className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-850 truncate">
                        {notice.title}
                      </span>
                    </div>
                    {notice.noticeLink && (
                      <span className="text-xs font-semibold text-[#2563eb] flex items-center gap-1 shrink-0 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                        Open Notice Link
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
              No recent notice events scheduled at this moment.
            </div>
          )}
        </div>
      </section>

      {/* Stat Cards Row */}
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

      {/* 4. Quick Actions Buttons Section */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div>
          <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
          <p className="mt-1 text-sm text-slate-500">Instant one-click shortcuts to Portal pages.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2563eb]/20 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                </div>
                <h2 className="mt-5 text-base font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1.5 text-xs text-slate-450">{item.description}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default StudentDashboard
