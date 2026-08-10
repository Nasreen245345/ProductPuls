import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '../store/SidebarContext'
import { Sidebar } from '../components/layout/Sidebar'
import { MobileSidebar } from '../components/layout/MobileSidebar'
import { Header } from '../components/layout/Header'
import { PageContainer } from '../components/layout/PageContainer'

/**
 * Shared shell for every authenticated page: collapsible sidebar (desktop),
 * off-canvas drawer (mobile), sticky header, and a content area that
 * renders the matched route via <Outlet />.
 *
 * SidebarProvider is scoped here rather than at App.jsx — auth pages have
 * no sidebar and shouldn't carry collapse/drawer state around for nothing.
 */
export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <MobileSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1">
            <PageContainer>
              <Outlet />
            </PageContainer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
