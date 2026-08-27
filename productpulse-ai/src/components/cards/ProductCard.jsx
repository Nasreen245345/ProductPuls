import { Link } from 'react-router-dom'
import { Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ROUTES } from '../../lib/constants'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** @param {{ id, name, description, updated_at }} product */
export function ProductCard({ product, onDelete }) {
  return (
    <Card className="flex flex-col p-5">
      <h3 className="text-card-heading text-primary">{product.name}</h3>
      <p className="text-small mt-1.5 flex-1 text-secondary">
        {product.description || 'No description yet.'}
      </p>
      <p className="text-caption mt-4 text-tertiary">Updated {formatDate(product.updated_at)}</p>

      <div className="mt-4 flex items-center gap-2 border-t border-default pt-4">
        <Link
          to={`${ROUTES.PRODUCTS}/${product.id}`}
          className="text-small flex flex-1 items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
        >
          View <ArrowRight size={14} />
        </Link>
        <Link
          to={`${ROUTES.PRODUCTS}/edit/${product.id}`}
          className="rounded-lg p-1.5 text-secondary hover:bg-surface-sunken hover:text-primary"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil size={15} />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="!p-1.5 text-danger-600 hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-500/10"
          onClick={() => onDelete(product)}
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </Card>
  )
}
