import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppBootScreen } from '@/components/routing/AppBootScreen'

export const ProtectedRoute = () => {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  if (status === 'unknown') return <AppBootScreen />

  if (status === 'unauthenticated') {
    const redirectTo = `${location.pathname}${location.search}`
    const target = redirectTo === '/' ? '/login' : `/login?redirect=${encodeURIComponent(redirectTo)}`
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
