import { cn } from '../../utils/cn'

const TONE_CLASSES = {
  neutral: 'bg-surface-sunken text-secondary',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-400',
  ai: 'bg-ai-100 text-ai-700 dark:bg-ai-500/15 dark:text-ai-400',
  success: 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  danger: 'bg-danger-100 text-danger-700 dark:bg-danger-500/15 dark:text-danger-500',
}

/**
 * @param {'neutral'|'brand'|'ai'|'success'|'warning'|'danger'} tone
 * @param {React.ReactNode} icon - optional leading icon
 */
export function Badge({ tone = 'neutral', icon = null, className = '', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
