import { Menu, Search, Sun, Moon } from 'lucide-react'
import { useSidebar } from '../../store/SidebarContext'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'

export function Header() {
  const { openMobile } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-default bg-surface-card/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={openMobile}
        className="rounded-lg p-2 text-secondary hover:bg-surface-sunken hover:text-primary lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
        />
        <input
          type="search"
          placeholder="Search feedback, products…"
          className="w-full rounded-lg border border-default bg-surface-sunken py-2 pl-9 pr-3 text-small text-primary placeholder:text-tertiary focus:border-brand-500 focus:bg-surface-card focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-secondary transition-colors hover:bg-surface-sunken hover:text-primary"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div className="flex items-center gap-2.5 border-l border-default pl-3">
            <Avatar name={user.full_name} />
            <span className="text-small hidden font-medium text-primary md:inline">{user.full_name}</span>
          </div>
        )}
      </div>
    </header>
  )
}
