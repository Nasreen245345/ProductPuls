import { useParams } from 'react-router-dom'

export function ProductDetails() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-page-heading text-primary">Product Details</h1>
      <p className="text-body mt-1 text-secondary">
        Product <span className="font-mono">{id}</span> — built out in Module 7 — Products.
      </p>
    </div>
  )
}
