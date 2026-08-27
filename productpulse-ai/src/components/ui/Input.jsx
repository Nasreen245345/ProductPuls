import { useId } from 'react'
import { cn } from '../../utils/cn'

/**
 * @param {string} label
 * @param {string} error - validation message; also switches the field into an error visual state
 * @param {string} helperText - shown when there is no error
 * @param {React.ReactNode} icon - optional leading icon
 */
export function Input({ label, error, helperText, icon = null, id, className = '', ref, ...props }) {
  const generatedId = useId()
  const fieldId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="text-small mb-1.5 block font-medium text-primary">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">
            {icon}
          </span>
        )}
        <input
          id={fieldId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          className={cn(
            'w-full rounded-lg border bg-surface-card px-3 py-2 text-small text-primary placeholder:text-tertiary transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            icon && 'pl-9',
            error ? 'border-danger-500 focus:border-danger-500' : 'border-default focus:border-brand-500',
            className,
          )}
          {...props}
        />
      </div>

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
