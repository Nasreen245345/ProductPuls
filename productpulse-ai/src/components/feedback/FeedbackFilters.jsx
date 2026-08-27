import { SearchBar } from '../ui/SearchBar'
import { FilterPanel } from '../ui/FilterPanel'

const SOURCE_OPTIONS = [
  { value: 'Email', label: 'Email' },
  { value: 'Support', label: 'Support' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Survey', label: 'Survey' },
]

/**
 * @param {string} search
 * @param {(value: string) => void} onSearchChange
 * @param {{ product_id: string, source: string }} filterValues
 * @param {(key: string, value: string) => void} onFilterChange
 * @param {() => void} onClearFilters
 * @param {{ id: string, name: string }[]} products
 */
export function FeedbackFilters({ search, onSearchChange, filterValues, onFilterChange, onClearFilters, products }) {
  const filters = [
    { key: 'product_id', label: 'All products', options: products.map((p) => ({ value: p.id, label: p.name })) },
    { key: 'source', label: 'All sources', options: SOURCE_OPTIONS },
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search feedback…" className="sm:max-w-xs" />
      <FilterPanel filters={filters} values={filterValues} onChange={onFilterChange} onClear={onClearFilters} />
    </div>
  )
}
