import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Builds a compact page list with ellipsis gaps, e.g. [1, '…', 4, 5, 6, '…', 12]. */
function buildPageList(currentPage, totalPages) {
  const pages = []
  const windowStart = Math.max(2, currentPage - 1)
  const windowEnd = Math.min(totalPages - 1, currentPage + 1)

  pages.push(1)
  if (windowStart > 2) pages.push('…')
  for (let page = windowStart; page <= windowEnd; page += 1) pages.push(page)
  if (windowEnd < totalPages - 1) pages.push('…')
  if (totalPages > 1) pages.push(totalPages)

  return pages
}

/**
 * @param {number} currentPage - 1-indexed
 * @param {number} totalPages
 * @param {(page: number) => void} onPageChange
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = buildPageList(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-sunken disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) =>
        page === '…' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-small text-tertiary">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-small font-medium transition-colors',
              page === currentPage
                ? 'bg-brand-600 text-white'
                : 'text-secondary hover:bg-surface-sunken hover:text-primary',
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-sunken disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
