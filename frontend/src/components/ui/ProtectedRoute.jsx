import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { P } from '../../routes/appPaths'

export default function ProtectedRoute({ children, requireAdmin, requireSuperAdmin }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={P.login} replace state={{ from: location.pathname }} />
  }

  if (requireSuperAdmin && role !== 'superadmin') {
    return <Navigate to={role === 'admin' ? P.adminAnalytics : P.userDashboard} replace />
  }

  if (requireAdmin && role !== 'admin' && role !== 'superadmin') {
    return <Navigate to={P.userDashboard} replace />
  }

  return <>{children}</>
}
