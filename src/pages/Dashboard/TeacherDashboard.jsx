import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { getSession, logout } from '../../utils/auth'

const stats = [
  {
    label: 'Total Students',
    value: '248',
    detail: '+18 this month',
  },
  {
    label: 'Pending Fees',
    value: '₹42,800',
    detail: '12 students pending',
  },
  {
    label: 'Attendance Today',
    value: '94%',
    detail: '182 marked present',
  },
  {
    label: 'Notices',
    value: '06',
    detail: '2 urgent announcements',
  },
]

const quickActions = [
  'Add student',
  'Mark attendance',
  'Send fee reminder',
  'Publish notice',
]

const sidebarItems = [
  'Dashboard',
  'Students',
  'Attendance',
  'Fees',
  'Notices',
]

function TeacherDashboard() {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    logout()
    navigate('/login/teacher', { replace: true })
  }

  const initials = (session?.displayName || 'Teacher')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.10)]">
          <div className="border-b border-slate-100 bg-[linear-gradient(90deg,rgba(242,93,13,0.05),rgba(255,145,0,0.03),rgba(255,255,255,1))] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f25d0d]">
                  Teacher dashboard
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Good to see you, {session?.displayName || 'Teacher'}.
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  This is the private workspace for coaching operations, fees,
                  attendance, and daily notices.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Coaching
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {session?.coachingName || 'Tuition workspace'}
                  </p>
                </div>
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[260px_1fr]">
            <aside className="border-b border-slate-100 bg-[#fffaf4] p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3 rounded-3xl border border-white bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f25d0d] to-[#ff9100] text-sm font-bold text-white">
                  {initials || 'T'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {session?.displayName || 'Teacher'}
                  </p>
                  <p className="text-sm text-slate-500">Verified staff account</p>
                </div>
              </div>

              <nav className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {sidebarItems.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={[
                      'rounded-2xl px-4 py-3 text-left text-sm font-medium transition',
                      index === 0
                        ? 'bg-gradient-to-r from-[#f25d0d] to-[#ff9100] text-white shadow-[0_14px_34px_rgba(242,93,13,0.20)]'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#f25d0d]/25 hover:bg-[#fff8f1]',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="mt-5 rounded-3xl border border-[#ffd900]/35 bg-[#ffd900]/10 p-4 text-sm leading-6 text-[#6f5800]">
                Quick reminder: teacher onboarding is private and session-backed
                in localStorage for this prototype.
              </div>
            </aside>

            <main className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
                  >
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(242,93,13,0.04),rgba(255,255,255,1))] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f25d0d]">
                        Quick actions
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        Common staff tasks
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-[#f25d0d]/25 hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-3xl bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Today&apos;s snapshot
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          Class operations are on track
                        </p>
                      </div>
                      <div className="rounded-full bg-[#f25d0d]/10 px-3 py-1 text-xs font-semibold text-[#b74208]">
                        Live
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ['Batches', '08'],
                        ['Fee follow-ups', '14'],
                        ['Announcements', '03'],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-200 bg-[#fffaf4] p-4"
                        >
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            {label}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f25d0d]">
                    Account status
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    Verified teacher profile
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-[#fffaf4] p-4">
                      <p className="text-sm text-slate-500">Phone number</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {session?.phone || 'Not available'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#fffaf4] p-4">
                      <p className="text-sm text-slate-500">Session token</p>
                      <p className="mt-1 break-all font-medium text-slate-900">
                        {session?.token || 'Not available'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#ffd900]/35 bg-[#ffd900]/10 p-4 text-sm leading-6 text-[#6f5800]">
                      Your dashboard remains available after refresh because the
                      session is restored from localStorage.
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
