import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { getSession, logout } from '../../utils/auth'

function StudentDashboard() {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    logout()
    navigate('/login/student', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f25d0d]">
                Student dashboard placeholder
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Welcome back, {session?.displayName || 'student'}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This is a protected placeholder screen that will later become the full student dashboard.
              </p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#f25d0d]/10 bg-[#fff8ef] p-5">
              <p className="text-sm font-medium text-slate-600">Next class</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">30 min</p>
            </div>
            <div className="rounded-3xl border border-[#ffd900]/25 bg-[#ffd900]/10 p-5">
              <p className="text-sm font-medium text-slate-600">Focus streak</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">12 days</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-600">Session token</p>
              <p className="mt-2 truncate text-sm font-medium text-slate-900">{session?.token || 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
