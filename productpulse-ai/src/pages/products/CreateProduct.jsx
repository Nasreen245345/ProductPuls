import { useNavigate } from 'react-router-dom'
import { ProductForm } from '../../components/forms/ProductForm'
import { createProduct } from '../../services/productService'
import { ROUTES } from '../../lib/constants'

export function CreateProduct() {
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    await createProduct(values)
    navigate(ROUTES.PRODUCTS)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-page-heading text-primary">Create Product</h1>
      <p className="text-body mt-1 text-secondary">Add a new product to start collecting feedback for it.</p>

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" onCancel={() => navigate(ROUTES.PRODUCTS)} />
      </div>
    </div>
  )
}
