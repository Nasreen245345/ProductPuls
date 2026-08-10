import { Menu, Search, Sun, Moon } from 'lucide-react'
import { useSidebar } from '../../store/SidebarContext'
import { useTheme } from '../../hooks/useTheme'

// TODO(Module 6): replace with the authenticated user from useAuth() once
// AuthContext carries a `user` profile object.
const CURRENT_USER = { name: 'Jordan Lee', initials: 'JL' }

export function Header() {
  const { openMobile } = useSidebar()
  const { theme, toggleTheme } = useTheme()

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

        <div className="flex items-center gap-2.5 border-l border-default pl-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ai-100 text-caption font-semibold text-ai-700 dark:bg-ai-500/20 dark:text-ai-400">
            {CURRENT_USER.initials}
          </span>
          <span className="text-small hidden font-medium text-primary md:inline">
            {CURRENT_USER.name}
          </span>
        </div>
      </div>
    </header>
  )
}
