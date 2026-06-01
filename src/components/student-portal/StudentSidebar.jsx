import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { studentSidebarItems } from './studentPortalConfig'
import BrandLogo from '../BrandLogo'

function getInitials(name = 'Student') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StudentSidebar({ open, session, onClose, onLogout }) {
  const initials = getInitials(session?.displayName || session?.student?.name || 'Student')

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-30 bg-slate-950/30 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-80 border-r border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1 shadow-[0_14px_28px_rgba(37,99,235,0.24)]">
                <BrandLogo className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Raj Tuition Classes , Durg</p>
                <p className="text-xs text-slate-500">Student portal</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-brand/20 hover:bg-slate-50 hover:text-brand lg:hidden"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1">
                {session?.student?.photo ? (
                  <img
                    src={session.student.photo}
                    alt={session?.displayName || 'Student'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {session?.displayName || session?.student?.name || 'Student'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  Class {session?.className || session?.student?.className || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="space-y-1">
              {studentSidebarItems.map((item) => {
                const Icon = item.icon

                if (item.action === 'logout') {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={onLogout}
                      className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  )
                }

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.to === '/student/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.95))] text-white shadow-[0_14px_34px_rgba(37,99,235,0.2)]'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-brand',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={[
                            'flex h-10 w-10 items-center justify-center rounded-2xl',
                            isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default StudentSidebar
