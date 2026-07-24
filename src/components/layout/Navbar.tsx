import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/format'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

export const Navbar = () => {
  const user = useAuthStore((state) => state.user)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Buka menu" className="lg:hidden">
        <MenuIcon />
      </Button>

      <div className="hidden lg:block">
        <p className="text-sm font-semibold">Dashboard</p>
        <p className="text-xs text-muted-foreground">Kelola data produk Anda di sini</p>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-pru-red-100 text-sm font-bold text-pru-red-dark">
            {getInitials(user.firstName, user.lastName)}
          </span>
        </div>
      )}
    </header>
  )
}
