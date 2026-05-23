import { Bell, Menu, LogOut } from 'lucide-react'
import { useMemo } from 'react'

function getInitials(name = 'Teacher') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Navbar({ session, title, currentLabel, onMenuClick, onLogout }) {
  const initials = useMemo(() => getInitials(session?.displayName || session?.fullName || 'Teacher'), [session])

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#f25d0d]/25 hover:text-[#f25d0d] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f25d0d]">
              {title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{currentLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#f25d0d]/25 hover:text-[#f25d0d]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f25d0d]" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(242,93,13,0.95),rgba(255,145,0,0.9))] text-sm font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {session?.displayName || session?.fullName || 'Teacher'}
              </p>
              <p className="text-xs text-slate-500">
                {session?.coachingName || 'Verified staff account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#f25d0d]/25 hover:text-[#f25d0d]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
