import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

// FR-009: Source (Email, Support, Interview, Survey).
const SOURCE_OPTIONS = [
  { value: 'Email', label: 'Email' },
  { value: 'Support', label: 'Support' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Survey', label: 'Survey' },
]

/**
 * @param {{ id: string, name: string }[]} products
 * @param {(values) => Promise<void>} onSubmit
 * @param {() => void} onCancel
 */
export function FeedbackForm({ products, onSubmit, onCancel }) {
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { product_id: '', feedback_text: '', source: '', customer_type: '' } })

  const submit = async (values) => {
    setFormError('')
    try {
      // Empty optional fields shouldn't be sent as empty strings.
      await onSubmit({
        product_id: values.product_id,
        feedback_text: values.feedback_text,
        source: values.source || undefined,
        customer_type: values.customer_type || undefined,
      })
    } catch (err) {
      setFormError(err.message || 'Unable to submit feedback. Please try again.')
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

      <Select
        label="Product"
        placeholder="Select a product"
        options={products.map((p) => ({ value: p.id, label: p.name }))}
        error={errors.product_id?.message}
        {...register('product_id', { required: 'Please select a product.' })}
      />

      <Textarea
        label="Feedback"
        placeholder="What did the customer say?"
        error={errors.feedback_text?.message}
        {...register('feedback_text', {
          required: 'Feedback text is required.',
          maxLength: { value: 5000, message: 'Feedback text cannot exceed 5000 characters.' },
        })}
      />

      <Select label="Source" placeholder="Select a source (optional)" options={SOURCE_OPTIONS} {...register('source')} />

      <Input label="Customer type" placeholder="e.g. Enterprise, SMB (optional)" {...register('customer_type')} />

      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          Submit Feedback
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
