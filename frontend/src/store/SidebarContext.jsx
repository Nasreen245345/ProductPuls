import { createContext, useContext, useMemo, useState } from 'react'

const SidebarContext = createContext(null)

/**
 * Two independent pieces of UI state, both scoped to the dashboard shell:
 *   - collapsed  → desktop: full sidebar vs. icon-only rail
 *   - mobileOpen → mobile/tablet: off-canvas drawer visibility
 *
 * Lives in its own provider (mounted by DashboardLayout, not App.jsx)
 * because auth pages have no sidebar and shouldn't carry this state.
 */
export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((prev) => !prev),
      mobileOpen,
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }),
    [collapsed, mobileOpen],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

/** Reads sidebar collapse/drawer state. Must be used within <SidebarProvider>. */
export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }

  return context
}
