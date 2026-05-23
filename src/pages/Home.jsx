import { Link, Navigate } from 'react-router-dom'
import InstallAppButton from '../components/pwa/InstallAppButton.jsx'
import { getSession } from '../utils/auth'

function Home() {
  const session = getSession()

  if (session?.token) {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,145,0,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(242,93,13,0.08),transparent_24%)]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd900]/40 bg-[#ffd900]/12 px-3 py-1 text-xs font-semibold text-[#6f5800]">
                Student access
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Learn on the go with a premium tuition app experience.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Stay connected with your tuition classes, updates, and learning materials in one fast, mobile-first app.
                Install the app for a smoother experience on your device.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-[#fff8ef] px-4 py-2">Fast access</span>
                <span className="rounded-full bg-[#fff8ef] px-4 py-2">Offline ready</span>
                <span className="rounded-full bg-[#fff8ef] px-4 py-2">App-like feel</span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/login/student"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Student login
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[1.75rem] border border-[#f25d0d]/10 bg-gradient-to-br from-white via-[#fffdf8] to-[#fff4e6] p-6 shadow-[0_20px_60px_rgba(242,93,13,0.12)] sm:p-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f25d0d]/10 px-3 py-1 text-xs font-semibold text-[#b84908]">
                  Install App
                </div>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                  Add the Student App to your home screen.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Launch faster, keep the platform one tap away, and enjoy a polished app-style experience on mobile and
                  desktop browsers that support PWA installation.
                </p>

                <div className="mt-6">
                  <InstallAppButton />
                </div>

                <div className="mt-6 grid gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                    Works with Android Chrome and modern Chromium-based browsers
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                    Uses your tuition brand colors and installs like a native app
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
