import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquareText, Plus, AlertTriangle } from 'lucide-react'
import { useFeedback } from '../../hooks/useFeedback'
import { useProducts } from '../../hooks/useProducts'
import { useDebounce } from '../../hooks/useDebounce'
import { createFeedback } from '../../services/feedbackService'
import { FeedbackFilters } from '../../components/feedback/FeedbackFilters'
import { FeedbackForm } from '../../components/forms/FeedbackForm'
import { FeedbackTable } from '../../components/tables/FeedbackTable'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { Pagination } from '../../components/ui/Pagination'
import { ROUTES } from '../../lib/constants'

export function Feedback() {
  const navigate = useNavigate()
  const { products } = useProducts({ limit: 100 })

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [filterValues, setFilterValues] = useState({ product_id: '', source: '' })
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      product_id: filterValues.product_id || undefined,
      source: filterValues.source || undefined,
    }),
    [page, debouncedSearch, filterValues],
  )

  const { items, pagination, isLoading, error, refetch } = useFeedback(queryParams)

  // The backend doesn't (yet) join product name into feedback rows — done client-side for now.
  const productNameById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p.name])), [products])
  const itemsWithProductName = items.map((item) => ({ ...item, product_name: productNameById[item.product_id] || '—' }))

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreate = async (values) => {
    await createFeedback(values)
    setIsModalOpen(false)
    refetch()
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-heading text-primary">Feedback</h1>
          <p className="text-body mt-1 text-secondary">
            Browse, search, and review customer feedback across your products.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          Add Feedback
        </Button>
      </div>

      <FeedbackFilters
        search={search}
        onSearchChange={handleSearchChange}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={() => {
          setFilterValues({ product_id: '', source: '' })
          setPage(1)
        }}
        products={products}
      />

      <div className="mt-4">
        {error ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load feedback"
            description={error.message || 'Something went wrong. Please try again.'}
          />
        ) : isLoading ? (
          <SkeletonTable rows={6} columns={4} />
        ) : itemsWithProductName.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="No feedback found"
            description="No feedback matches your current filters, or none has been submitted yet."
            action={{ label: 'Add Feedback', onClick: () => setIsModalOpen(true) }}
          />
        ) : (
          <>
            <FeedbackTable
              items={itemsWithProductName}
              onRowClick={(id) => navigate(`${ROUTES.FEEDBACK}/${id}`)}
            />
            <div className="mt-4">
              <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Feedback" size="lg">
        <FeedbackForm products={products} onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}
