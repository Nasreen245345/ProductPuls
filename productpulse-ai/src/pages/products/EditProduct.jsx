import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { ProductForm } from '../../components/forms/ProductForm'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { fetchProduct, updateProduct } from '../../services/productService'
import { ROUTES } from '../../lib/constants'

export function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    fetchProduct(id)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleSubmit = async (values) => {
    await updateProduct(id, values)
    navigate(`${ROUTES.PRODUCTS}/${id}`)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-page-heading text-primary">Edit Product</h1>
      <p className="text-body mt-1 text-secondary">Update this product's name or description.</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4 rounded-2xl border border-default bg-surface-card p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load this product"
            description={error.message || 'It may have been deleted, or you may not have access to it.'}
          />
        ) : (
          <div className="rounded-2xl border border-default bg-surface-card p-6">
            <ProductForm
              defaultValues={{ name: product.name, description: product.description || '' }}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
              onCancel={() => navigate(`${ROUTES.PRODUCTS}/${id}`)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
