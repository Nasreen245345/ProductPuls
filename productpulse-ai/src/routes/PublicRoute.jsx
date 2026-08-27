import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui/Spinner'
import { ROUTES } from '../lib/constants'

export function PublicRoute() {
  const { isAuthenticated, status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
