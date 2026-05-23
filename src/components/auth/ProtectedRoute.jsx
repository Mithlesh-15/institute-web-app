import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getSession } from '../../utils/auth'

function ProtectedRoute({ allowedRole, requireVerified = false }) {
  const location = useLocation()
  const session = getSession()

  if (!session?.token) {
    return <Navigate to={`/login/${allowedRole}`} replace state={{ from: location.pathname }} />
  }

  if (allowedRole && session.role !== allowedRole) {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  if (requireVerified && session.role === 'teacher' && !session.verified) {
    return <Navigate to="/login/teacher" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
