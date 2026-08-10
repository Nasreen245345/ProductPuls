import { cn } from '../../utils/cn'

/** A single skeleton block. Compose these into card/table/chart-shaped placeholders. */
export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton-pulse rounded-md', className)} />
}

/** Shape of a KPI/stat card while loading — mirrors StatsCard's layout so there's no shift on load. */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-default bg-surface-card p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  )
}

/** Shape of a table while loading. */
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-default bg-surface-card">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-default px-5 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className={cn('h-4', colIndex === 0 ? 'w-1/3' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}
