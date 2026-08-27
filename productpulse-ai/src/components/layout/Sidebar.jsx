import { useNavigate } from 'react-router-dom'
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SidebarItem } from './SidebarItem'
import { useSidebar } from '../../store/SidebarContext'
import { useAuth } from '../../hooks/useAuth'
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from '../../lib/navigation'
import { ROUTES } from '../../lib/constants'
import { cn } from '../../utils/cn'

/** Desktop-only. Hidden below the lg breakpoint — see MobileSidebar for that. */
export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-default bg-surface-card transition-all duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div className="flex h-16 shrink-0 items-center px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-600 text-sm font-bold text-white">
          P
        </span>
        {!collapsed && (
          <span className="text-card-heading ml-2.5 whitespace-nowrap text-primary">
            ProductPulse<span className="text-brand-600"> AI</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        {MAIN_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-default px-3 py-3">
        {FOOTER_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-small font-medium text-secondary transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut size={18} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleCollapsed}
        className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-lg py-2 text-secondary transition-colors hover:bg-surface-sunken hover:text-primary"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </aside>
  )
}
