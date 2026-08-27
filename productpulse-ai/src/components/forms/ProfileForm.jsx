import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { updateProfile } from '../../services/userService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ProfileForm() {
  const { user, updateUser } = useAuth()
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { full_name: user.full_name, email: user.email } })

  const onSubmit = async (values) => {
    setFormError('')
    setSuccess(false)
    try {
      const res = await updateProfile(values)
      updateUser(res.data)
      setSuccess(true)
    } catch (err) {
      setFormError(err.message || 'Unable to update your profile. Please try again.')
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
          <span>Profile updated.</span>
        </div>
      )}

      <Input
        label="Full name"
        error={errors.full_name?.message}
        {...register('full_name', { required: 'Full name is required.' })}
      />

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required.',
          pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
        })}
      />

      <Button type="submit" loading={isSubmitting}>
        Save Changes
      </Button>
    </form>
  )
}
