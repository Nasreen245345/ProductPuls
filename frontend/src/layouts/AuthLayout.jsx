import { Outlet } from 'react-router-dom'

/** Shared shell for login/register. Sidebar-free, header-free by design. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Outlet />
    </div>
  )
}
