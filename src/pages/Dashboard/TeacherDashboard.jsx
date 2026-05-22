import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { getSession, logout } from '../../utils/auth'

function TeacherDashboard() {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    logout()
    navigate('/login/teacher', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f25d0d]">
                Private staff dashboard placeholder
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Good to see you, {session?.displayName || 'teacher'}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This protected screen is ready for future admin tools, class oversight, and operational controls.
              </p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-[#f25d0d]/10 bg-[#fff8ef] p-5">
              <p className="text-sm font-medium text-slate-600">Today’s coaching snapshot</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Batches</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">08</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Attendance</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">94%</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Alerts</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">03</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-600">Session token</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{session?.token || 'Not available'}</p>
              <div className="mt-5 rounded-2xl border border-[#ffd900]/35 bg-[#ffd900]/10 px-4 py-3 text-sm text-slate-700">
                Teacher navigation remains private and direct-link only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
