import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

/**
 * @param {{ name: string, description: string }} defaultValues
 * @param {(values) => Promise<void>} onSubmit
 * @param {string} submitLabel
 * @param {() => void} onCancel
 */
export function ProductForm({ defaultValues = { name: '', description: '' }, onSubmit, submitLabel, onCancel }) {
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  const submit = async (values) => {
    setFormError('')
    try {
      await onSubmit(values)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {formError && (
        <div className="flex items-start gap-2 rounded-lg bg-danger-50 px-3 py-2.5 text-small text-danger-700 dark:bg-danger-500/10 dark:text-danger-500">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <Input
        label="Product name"
        placeholder="TaskFlow"
        error={errors.name?.message}
        {...register('name', { required: 'Product name is required.' })}
      />

      <Textarea
        label="Description"
        placeholder="What does this product do, and who is it for?"
        {...register('description')}
      />

      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
