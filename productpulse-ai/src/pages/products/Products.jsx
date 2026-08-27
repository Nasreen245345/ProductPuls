import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, AlertTriangle } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useDebounce } from '../../hooks/useDebounce'
import { ProductCard } from '../../components/cards/ProductCard'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { SearchBar } from '../../components/ui/SearchBar'
import { Pagination } from '../../components/ui/Pagination'
import { ROUTES } from '../../lib/constants'

export function Products() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [page, setPage] = useState(1)

  const queryParams = useMemo(
    () => ({ page, limit: 9, search: debouncedSearch || undefined }),
    [page, debouncedSearch],
  )
  const { products, pagination, isLoading, error, removeProduct } = useProducts(queryParams)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await removeProduct(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete this product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-heading text-primary">Products</h1>
          <p className="text-body mt-1 text-secondary">
            Manage the products you&apos;re collecting customer feedback for.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate(`${ROUTES.PRODUCTS}/create`)}>
          Create Product
        </Button>
      </div>

      <SearchBar value={search} onChange={handleSearchChange} placeholder="Search products…" className="mb-4 max-w-xs" />

      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load products"
          description={error.message || 'Something went wrong. Please try again.'}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search ? 'No products match your search' : 'No products yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Create your first product to start collecting and analyzing customer feedback.'
          }
          action={search ? undefined : { label: 'Create Product', onClick: () => navigate(`${ROUTES.PRODUCTS}/create`) }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={setPendingDelete} />
            ))}
          </div>
          <div className="mt-6">
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          setPendingDelete(null)
          setDeleteError('')
        }}
        title="Delete product?"
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={isDeleting}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-body text-secondary">
          This will permanently delete <strong className="text-primary">{pendingDelete?.name}</strong>. This
          action cannot be undone.
        </p>
        {deleteError && <p className="text-small mt-3 text-danger-600">{deleteError}</p>}
      </Modal>
    </div>
  )
}
