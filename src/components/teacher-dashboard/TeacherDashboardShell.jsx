import { useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { sidebarItems } from './dashboardConfig'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { getSession, logout } from '../../utils/auth'

function TeacherDashboardShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentLabel = useMemo(() => {
    const activeItem = sidebarItems.find((item) => {
      if (!item.to) {
        return false
      }

      if (item.to === '/teacher/dashboard') {
        return location.pathname === item.to
      }

      return location.pathname.startsWith(item.to)
    })

    return activeItem?.label || 'Dashboard'
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
    return <Navigate to="/login/teacher" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login/teacher', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        open={mobileOpen}
        session={session}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:pl-80">
        <Navbar
          session={session}
          title={session?.coachingName || 'RTC Tuition'}
          currentLabel={currentLabel}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default TeacherDashboardShell
