import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * @param {{ key: string, label: string, options: { value: string, label: string }[] }[]} filters
 * @param {Record<string, string>} values - current value per filter key ('' = not set)
 * @param {(key: string, value: string) => void} onChange
 * @param {() => void} onClear
 */
export function FilterPanel({ filters, values, onChange, onClear }) {
  const hasActiveFilters = Object.values(values).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={values[filter.key] || ''}
          onChange={(event) => onChange(filter.key, event.target.value)}
          className={cn(
            'rounded-lg border bg-surface-card px-3 py-1.5 text-small text-primary transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            values[filter.key] ? 'border-brand-300 text-brand-700' : 'border-default',
          )}
        >
          <option value="">{filter.label}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-small font-medium text-secondary hover:bg-surface-sunken hover:text-primary"
        >
          <X size={14} />
          Clear filters
        </button>
      )}
    </div>
  )
}
