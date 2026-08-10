import { useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { SidebarItem } from './SidebarItem'
import { useSidebar } from '../../store/SidebarContext'
import { useAuth } from '../../hooks/useAuth'
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from '../../lib/navigation'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../utils/cn'

/** Off-canvas drawer, lg:hidden. Renders even when closed so the slide transition works both ways. */
export function MobileSidebar() {
  const { mobileOpen, closeMobile } = useSidebar()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    closeMobile()
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-zinc-950/40 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-default bg-surface-card transition-transform duration-200 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-600 text-sm font-bold text-white">
              P
            </span>
            <span className="text-card-heading text-primary">
              ProductPulse<span className="text-brand-600"> AI</span>
            </span>
          </div>
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-1.5 text-secondary hover:bg-surface-sunken"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
          {MAIN_NAV_ITEMS.map((item) => (
            <SidebarItem key={item.to} {...item} onNavigate={closeMobile} />
          ))}
        </nav>

        <div className="space-y-1 border-t border-default px-3 py-3">
          {FOOTER_NAV_ITEMS.map((item) => (
            <SidebarItem key={item.to} {...item} onNavigate={closeMobile} />
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-secondary transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10"
          >
            <LogOut size={18} strokeWidth={2} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
