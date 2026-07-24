import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppBootScreen } from '@/components/routing/AppBootScreen'

export const PublicOnlyRoute = () => {
  const status = useAuthStore((state) => state.status)

  if (status === 'unknown') return <AppBootScreen />
  if (status === 'authenticated') return <Navigate to="/" replace />

  return <Outlet />
}
