import { cn } from '../../utils/cn'

/** Base elevated surface. `interactive` adds hover affordance for cards that act as links/buttons. */
export function Card({ interactive = false, className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-default bg-surface-card shadow-sm',
        interactive && 'cursor-pointer transition-all hover:border-strong hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={cn('flex items-center justify-between p-5 pb-0', className)}>{children}</div>
}

export function CardBody({ className = '', children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
