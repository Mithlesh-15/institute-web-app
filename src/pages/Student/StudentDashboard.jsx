import { useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck2, CreditCard, GraduationCap, Megaphone, Video, User, Trophy, BookOpen, Camera } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import NoticeCard from '../../components/student-portal/NoticeCard'
import { fetchStudentDashboardData, formatPortalCurrency } from '../../utils/studentPortal'

const quickActions = [
  {
    title: 'My Classes',
    to: '/student/classes',
    icon: GraduationCap,
    description: 'View your enrolled classes',
  },
  {
    title: 'Attendance',
    to: '/student/attendance',
    icon: CalendarCheck2,
    description: 'Track daily attendance history',
  },
  {
    title: 'Fees Summary',
    to: '/student/fees',
    icon: CreditCard,
    description: 'Review fee payments & status',
  },
  {
    title: 'Test Results',
    to: '/student/results',
    icon: Trophy,
    description: 'Check scorecard & rankings',
  },
  {
    title: 'E-Library',
    to: '/student/library',
    icon: BookOpen,
    description: 'Access study notes & papers',
  },
  {
    title: 'Notices',
    to: '/student/notices',
    icon: Megaphone,
    description: 'Check official announcements',
  },
  {
    title: 'Gallery',
    to: '/student/gallery',
    icon: Camera,
    description: 'View campus event photos',
  },
  {
    title: 'My Profile',
    to: '/student/profile',
    icon: User,
    description: 'Update profile and details',
  },
]

function StudentDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStudentDashboardData()

        if (mounted) {
          setDashboard(data)
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load dashboard right now.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard() 

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const getGreeting = () => {
    const hours = currentTime.getHours()
    if (hours < 12) return 'Good Morning'
    if (hours < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-[2rem] border border-slate-200 bg-white shadow-soft" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Live Class Section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-red-200 bg-[linear-gradient(135deg,#fef2f2,#fff1f2,#ffe4e6)] p-6 shadow-[0_16px_40px_rgba(244,63,94,0.08)]">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-rose-200/30 blur-2xl"></div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
              <Video className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Live Session</p>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Interactive Live Class</h2>
              <p className="mt-1 text-sm text-slate-600">Join your batch's active class session on Google Meet.</p>
            </div>
          </div>
          <a
            href="https://meet.google.com/rtc-live-class"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 hover:shadow-rose-700/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Join Live Class
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* 2. Greeting Section */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Overview Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {getGreeting()}, {dashboard?.profile?.name || 'Student'}! ✨
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enrolled in Class: <span className="font-semibold text-slate-700">{dashboard?.profile?.className || 'N/A'}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm font-medium text-blue-700">
            Welcome back to your dashboard panel.
          </div>
        </div>
      </section>

      {/* 3. Notice Board & 4. Pending Fees */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Notice Board Section (2 Columns width on LG screens) */}
        <section className="lg:col-span-2 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notice Board</h2>
              <p className="text-xs text-slate-500">Latest updates from your tuition classes.</p>
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {dashboard?.notices?.length ? (
              dashboard.notices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
                No notices available right now.
              </div>
            )}
          </div>
        </section>

        {/* Small Pending Fees Card (1 Column width) */}
        <div className="flex flex-col gap-6">
          <div
            onClick={() => navigate('/student/fees')}
            className="group cursor-pointer rounded-[1.75rem] border border-amber-200 bg-[linear-gradient(135deg,#fefaf0,#fffbeb,#fef3c7)] p-6 shadow-[0_16px_30px_rgba(245,158,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Action Required
              </span>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">Pending Total Fees</p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {formatPortalCurrency(dashboard?.stats?.totalPendingAmount || 0)}
              </h3>
              <p className="mt-2 text-xs text-amber-800/80">
                Click this card to view your fee history and make payments.
              </p>
            </div>
          </div>
          
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/50 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Stats</h4>
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/50">
              <span className="text-slate-500">Enrolled Classes</span>
              <span className="font-semibold text-slate-800">{dashboard?.stats?.totalJoinedClasses || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-slate-500">This Month's Attendance</span>
              <span className="font-semibold text-slate-800">{dashboard?.stats?.currentMonthAttendancePercentage || 0}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Quick Access Section */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quick Access Buttons</h2>
            <p className="text-xs text-slate-500">Jump directly to your portal utilities.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-[1.5rem] border border-slate-150 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2563eb]/20 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb] group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}

export default StudentDashboard
