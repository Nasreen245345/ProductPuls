import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ROUTES } from '../../lib/constants'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// FR-001: at least 8 characters, uppercase, lowercase, number, special character.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { full_name: '', email: '', password: '', confirm_password: '' } })

  const onSubmit = async ({ full_name, email, password, confirm_password }) => {
    setFormError('')
    try {
      await registerUser({ full_name, email, password, confirm_password })
      navigate(ROUTES.LOGIN, { state: { registered: true, email } })
    } catch (err) {
      setFormError(err.message || 'Unable to create your account. Please try again.')
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
        label="Full name"
        icon={<User size={16} />}
        placeholder="Jordan Lee"
        error={errors.full_name?.message}
        {...register('full_name', { required: 'Full name is required.' })}
      />

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
        helperText={!errors.password ? 'At least 8 characters, with uppercase, lowercase, a number, and a symbol.' : undefined}
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required.',
          pattern: {
            value: PASSWORD_PATTERN,
            message: 'Must include an uppercase letter, lowercase letter, number, and symbol.',
          },
        })}
      />

      <Input
        label="Confirm password"
        type="password"
        icon={<Lock size={16} />}
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        {...register('confirm_password', {
          required: 'Please confirm your password.',
          validate: (value) => value === watch('password') || 'Passwords do not match.',
        })}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Create account
      </Button>

      <p className="text-small text-center text-secondary">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  )
}
