import { HouseIcon, LogOutIcon, PackageIcon, XIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Brand } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onLogout: () => void
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HouseIcon, end: true },
  { to: '/products', label: 'Product', icon: PackageIcon },
]

export const Sidebar = ({ onLogout }: SidebarProps) => {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const closeSidebar = useUiStore((state) => state.closeSidebar)

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Brand />
          <Button variant="ghost" size="icon-sm" onClick={closeSidebar} aria-label="Tutup menu" className="lg:hidden">
            <XIcon />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Menu utama">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-pru-red-100 text-pru-red-dark'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-pru-red-100 hover:text-pru-red-dark"
          >
            <LogOutIcon className="size-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
