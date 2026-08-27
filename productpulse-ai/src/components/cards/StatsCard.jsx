import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'

/**
 * @param {React.ComponentType} icon
 * @param {string} label
 * @param {string|number} value
 * @param {{ direction: 'up'|'down', label: string }} trend - optional
 */
export function StatsCard({ icon: Icon, label, value, trend }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-small font-medium text-secondary">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
            <Icon size={16} />
          </span>
        )}
      </div>

      <p className="text-hero mt-3 text-primary">{value}</p>

      {trend && (
        <p
          className={cn(
            'text-caption mt-2 flex items-center gap-1 font-medium',
            trend.direction === 'up' ? 'text-success-600' : 'text-danger-600',
          )}
        >
          {trend.direction === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {trend.label}
        </p>
      )}
    </Card>
  )
}