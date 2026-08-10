import { useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { LoginForm } from '../../components/forms/LoginForm'

export function Login() {
  const location = useLocation()
  const justRegistered = location.state?.registered

  return (
    <div className="w-full max-w-md rounded-2xl border border-default bg-surface-card p-8">
      <h1 className="text-section-heading text-primary">Log in</h1>
      <p className="text-body mt-1 text-secondary">Welcome back to ProductPulse AI.</p>

      {justRegistered && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2.5 text-small text-success-700 dark:bg-success-500/10 dark:text-success-500">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Account created. Please log in.</span>
        </div>
      )}

      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  )
}
