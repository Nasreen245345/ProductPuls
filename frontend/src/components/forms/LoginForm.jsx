import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ROUTES } from '../../lib/constants'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async ({ email, password }) => {
    setFormError('')
    try {
      await login(email, password)
      const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Unable to log in. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && (
        <div className="flex items-start gap-2 rounded-lg bg-danger-50 px-3 py-2.5 text-small text-danger-700 dark:bg-danger-500/10 dark:text-danger-500">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        icon={<Mail size={16} />}
        placeholder="you@company.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required.',
          pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
        })}
      />

      <Input
        label="Password"
        type="password"
        icon={<Lock size={16} />}
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password', { required: 'Password is required.' })}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Log in
      </Button>

      <p className="text-small text-center text-secondary">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>

      
    </form>
  )
}
