import { useId } from 'react'
import { cn } from '../../utils/cn'

/**
 * @param {string} label
 * @param {string} error
 * @param {string} helperText
 */
export function Textarea({ label, error, helperText, id, className = '', ref, ...props }) {
  const generatedId = useId()
  const fieldId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="text-small mb-1.5 block font-medium text-primary">
          {label}
        </label>
      )}

      <textarea
        id={fieldId}
        ref={ref}
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        className={cn(
          'w-full resize-y rounded-lg border bg-surface-card px-3 py-2 text-small text-primary placeholder:text-tertiary transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error ? 'border-danger-500 focus:border-danger-500' : 'border-default focus:border-brand-500',
          className,
        )}
        {...props}
      />

      {error ? (
        <p id={`${fieldId}-error`} className="text-caption mt-1.5 text-danger-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${fieldId}-helper`} className="text-caption mt-1.5 text-tertiary">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
