import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

/**
 * @param {string} to
 * @param {React.ComponentType} icon - a lucide-react icon component
 * @param {string} label
 * @param {boolean} collapsed - icon-only mode (desktop rail); ignored on mobile
 * @param {() => void} onNavigate - called after a click, e.g. to close the mobile drawer
 */
export function SidebarItem({ to, icon: Icon, label, collapsed = false, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-small font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-400'
            : 'text-secondary hover:bg-surface-sunken hover:text-primary',
        )
      }
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}
