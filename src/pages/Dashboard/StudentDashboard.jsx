import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  CalendarCheck2,
  BookOpen,
  CreditCard,
  FileText,
  Megaphone,
  LogOut,
  GraduationCap,
  BadgeCheck,
} from 'lucide-react'
import StudentPageShell from '../../components/student/StudentPageShell'
import StudentSectionCard from '../../components/student/StudentSectionCard'
import { getSession, logout } from '../../utils/auth'

const dashboardCards = [
  {
    title: 'Notices',
    description: 'Latest announcements from your tuition',
    icon: Megaphone,
    tone: 'from-[#f25d0d] to-[#ff9100]',
  },
  {
    title: 'Attendance',
    description: 'Track your present days and weekly streak',
    icon: CalendarCheck2,
    tone: 'from-[#ff9100] to-[#ffd900]',
  },
  {
    title: 'Homework',
    description: 'Check pending assignments and submissions',
    icon: BookOpen,
    tone: 'from-[#f25d0d] to-[#ffd900]',
  },
  {
    title: 'Results',
    description: 'Review scores and progress snapshots',
    icon: FileText,
    tone: 'from-[#ffd900] to-[#ff9100]',
  },
  {
    title: 'Fees',
    description: 'View due dates and payment history',
    icon: CreditCard,
    tone: 'from-[#f25d0d] to-[#ff9100]',
  },
]

function StudentDashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const student = session?.student

  const initials = useMemo(() => {
    return (student?.name || session?.displayName || 'Student')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [session?.displayName, student?.name])

  if (!session?.token) {
    return <Navigate to="/login/student" replace />
  }

  if (session.role !== 'student') {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login/student', { replace: true })
  }

  return (
    <StudentPageShell
      eyebrow="Student dashboard"
      title={`Welcome back, ${student?.name || session?.displayName || 'Student'}`}
      description="A clean student workspace for notices, homework, results, attendance, and fee tracking."
      rightSlot={
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#f25d0d]/25 hover:text-[#f25d0d]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="h-24 w-24 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,rgba(242,93,13,0.08),rgba(255,217,0,0.12))]">
              {student?.photo ? (
                <img src={student.photo} alt={student?.name || 'Student'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#b84908]">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd900]/35 bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-[#7a5a00]">
                <BadgeCheck className="h-3.5 w-3.5 text-[#f25d0d]" />
                Student profile active
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">{student?.name || session?.displayName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Class {student?.className || session?.className || 'N/A'} · {student?.phone || session?.phone}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(student?.subjects || session?.subjects || []).map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-[#9a3d07]"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {dashboardCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]"
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${card.tone} p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
              </div>
            )
          })}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <StudentSectionCard title="Today’s overview" subtitle="Summary">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Attendance', '94%'],
              ['Homework', '03 pending'],
              ['Fees', 'Paid till July'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-[#fffdf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </StudentSectionCard>

        <StudentSectionCard title="Recent activity" subtitle="Updates">
          <div className="space-y-4">
            {[
              'New homework uploaded for Math.',
              'Attendance marked for today’s class.',
              'Notice board updated with tomorrow’s schedule.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-[#fffdf8] px-4 py-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  )
}

export default StudentDashboard

