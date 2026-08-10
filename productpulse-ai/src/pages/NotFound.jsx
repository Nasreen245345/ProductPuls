import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/constants'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-caption text-brand-600">404</p>
      <h1 className="text-page-heading mt-2 text-primary">Page not found</h1>
      <p className="text-body mt-2 max-w-sm text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-small font-medium text-white transition-colors hover:bg-brand-700"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
