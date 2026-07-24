import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

export const AppLayout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const closeSidebar = useUiStore((state) => state.closeSidebar)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  const handleLogout = () => {
    setIsLogoutOpen(false)
    closeSidebar()
    logout()
    toast.info('Anda telah keluar dari aplikasi.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <Sidebar onLogout={() => setIsLogoutOpen(true)} />

      <div className="lg:pl-64">
        <Navbar />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        title="Keluar dari aplikasi?"
        description="Anda perlu login kembali untuk mengakses dashboard."
        confirmLabel="Ya, Logout"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </div>
  )
}
