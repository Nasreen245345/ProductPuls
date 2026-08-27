import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { changePassword } from '../../services/userService'

// FR-001: at least 8 characters, uppercase, lowercase, number, special character.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function PasswordChangeForm() {
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { current_password: '', new_password: '', confirm_new_password: '' } })

  const onSubmit = async (values) => {
    setFormError('')
    setSuccess(false)
    try {
      await changePassword(values)
      setSuccess(true)
      reset()
    } catch (err) {
      setFormError(err.message || 'Unable to change your password. Please try again.')
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
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2.5 text-small text-success-700 dark:bg-success-500/10 dark:text-success-500">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Password changed.</span>
        </div>
      )}

      <Input
        label="Current password"
        type="password"
        icon={<Lock size={16} />}
        error={errors.current_password?.message}
        {...register('current_password', { required: 'Current password is required.' })}
      />

      <Input
        label="New password"
        type="password"
        icon={<Lock size={16} />}
        helperText={!errors.new_password ? 'At least 8 characters, with uppercase, lowercase, a number, and a symbol.' : undefined}
        error={errors.new_password?.message}
        {...register('new_password', {
          required: 'New password is required.',
          pattern: {
            value: PASSWORD_PATTERN,
            message: 'Must include an uppercase letter, lowercase letter, number, and symbol.',
          },
        })}
      />

      <Input
        label="Confirm new password"
        type="password"
        icon={<Lock size={16} />}
        error={errors.confirm_new_password?.message}
        {...register('confirm_new_password', {
          required: 'Please confirm your new password.',
          validate: (value) => value === watch('new_password') || 'Passwords do not match.',
        })}
      />

      <Button type="submit" loading={isSubmitting}>
        Change Password
      </Button>
    </form>
  )
}
