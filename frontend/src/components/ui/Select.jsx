import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Wraps a native <select> rather than building a custom listbox — full
 * accessibility and mobile behavior for free, at zero extra weight.
 * @param {string} label
 * @param {string} error
 * @param {string} helperText
 * @param {{ value: string, label: string }[]} options
 * @param {string} placeholder - rendered as a disabled first option
 */
export function Select({
  label,
  error,
  helperText,
  options = [],
  placeholder,
  id,
  className = '',
  ref,
  ...props
}) {
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
        <select
          id={fieldId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          defaultValue={props.defaultValue ?? ''}
          className={cn(
            'w-full appearance-none rounded-lg border bg-surface-card px-3 py-2 pr-9 text-small text-primary transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            error ? 'border-danger-500 focus:border-danger-500' : 'border-default focus:border-brand-500',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
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
