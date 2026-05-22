import { Link, Navigate } from 'react-router-dom'
import { getSession } from '../utils/auth'

function Home() {
  const session = getSession()

  if (session?.token) {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="w-full rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd900]/40 bg-[#ffd900]/12 px-3 py-1 text-xs font-semibold text-[#6f5800]">
            Student access
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            A premium coaching platform built for everyday learning.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Mobile-first, calm, and easy to use. The student login path is public, while the teacher portal stays private.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login/student"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f25d0d] to-[#ff9100] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(242,93,13,0.22)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Student login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
