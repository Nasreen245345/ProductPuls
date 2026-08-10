import { Spinner } from './Spinner'
import { cn } from '../../utils/cn'

const VARIANT_CLASSES = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-surface-sunken text-primary hover:bg-surface-card-hover border border-default',
  outline: 'border border-default text-primary hover:bg-surface-sunken',
  ghost: 'text-secondary hover:bg-surface-sunken hover:text-primary',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
}

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-small gap-1.5',
  md: 'h-10 px-4 text-small gap-2',
  lg: 'h-11 px-5 text-body gap-2',
}

/**
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - shows a spinner and disables the button
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon = null,
  rightIcon = null,
  disabled = false,
  className = '',
  children,
  ref,
  ...props
}) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
