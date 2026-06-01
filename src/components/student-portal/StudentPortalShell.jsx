import { useEffect, useMemo, useState } from 'react'
import { Menu, LogOut, ArrowDownToLine } from 'lucide-react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getSession, logout } from '../../utils/auth'
import { studentSidebarItems } from './studentPortalConfig'
import StudentSidebar from './StudentSidebar'

function StudentPortalShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBtn(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallBtn(false)
    }
  }

  const currentLabel = useMemo(() => {
    const activeItem = studentSidebarItems.find((item) => {
      if (!item.to) {
        return false
      }

      if (item.to === '/student/dashboard') {
        return location.pathname === item.to
      }

      return location.pathname.startsWith(item.to)
    })

    return activeItem?.label || 'Student Portal'
  }, [location.pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) {
      return undefined
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileOpen])

  if (!session?.token) {
    return <Navigate to="/login/student" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login/student', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface">
      <StudentSidebar
        open={mobileOpen}
        session={session}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:pl-80">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#2563eb]/25 hover:text-[#2563eb] lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                  Student Workspace
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{currentLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {showInstallBtn && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/50 px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-800"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2563eb]/25 hover:text-[#2563eb]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentPortalShell
