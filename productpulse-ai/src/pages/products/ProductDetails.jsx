import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AlertTriangle, Pencil, Trash2, Sparkles, RotateCcw, Users, Lightbulb, TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import { fetchProduct, deleteProduct } from '../../services/productService'
import { generateInsights, fetchInsights } from '../../services/insightService'
import { ROUTES } from '../../lib/constants'

const IMPACT_TONE = { Low: 'neutral', Medium: 'warning', High: 'danger' }

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function InsightsSection({ productId }) {
  const [insight, setInsight] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    fetchInsights(productId)
      .then((res) => setInsight(res.data))
      .catch((err) => {
        if (err.code !== 'INSIGHTS_NOT_FOUND') setError(err.message)
      })
      .finally(() => setIsLoading(false))
  }, [productId])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const res = await generateInsights(productId)
      setInsight(res.data)
    } catch (err) {
      setError(err.message || 'Unable to generate insights. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3 rounded-2xl border border-default bg-surface-card p-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-card-heading flex items-center gap-2 text-primary">
          <Sparkles size={16} className="text-ai-600" />
          Product Insights
        </h2>
        <Button variant="outline" size="sm" leftIcon={<RotateCcw size={13} />} loading={isGenerating} onClick={handleGenerate}>
          {insight ? 'Regenerate' : 'Generate Insights'}
        </Button>
      </div>

      {error && <p className="text-small mt-2 text-danger-600">{error}</p>}

      {!insight && !isGenerating && !error && (
        <div className="mt-3 rounded-2xl border border-dashed border-default p-6 text-center">
          <p className="text-small text-tertiary">
            No insights yet. Analyze some feedback for this product, then generate insights to see top pain
            points, user segments, and opportunities.
          </p>
        </div>
      )}

      {isGenerating && !insight && (
        <div className="mt-3 space-y-3 rounded-2xl border border-dashed border-default p-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {insight && (
        <div className="mt-3 space-y-4">
          <div className="rounded-2xl border border-ai-100 bg-gradient-to-br from-ai-50 to-surface-card p-5 dark:border-ai-500/20 dark:from-ai-500/10 dark:to-surface-card">
            <p className="text-body text-secondary">{insight.summary}</p>
            <p className="text-caption mt-3 text-tertiary">
              Based on {insight.feedback_analyzed_count} analyzed feedback item(s) · {insight.model_name}
            </p>
          </div>

          {insight.top_pain_points?.length > 0 && (
            <div className="rounded-2xl border border-default bg-surface-card p-5">
              <h3 className="text-small flex items-center gap-1.5 font-semibold text-primary">
                <AlertTriangle size={14} /> Top Pain Points
              </h3>
              <ul className="mt-3 space-y-3">
                {insight.top_pain_points.map((p) => (
                  <li key={p.theme}>
                    <p className="text-small font-medium text-primary">
                      {p.theme} <span className="text-tertiary">· {p.supporting_count} mention(s)</span>
                    </p>
                    <p className="text-small mt-0.5 text-secondary">{p.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.user_segments?.length > 0 && (
            <div className="rounded-2xl border border-default bg-surface-card p-5">
              <h3 className="text-small flex items-center gap-1.5 font-semibold text-primary">
                <Users size={14} /> User Segments
              </h3>
              <ul className="mt-3 space-y-3">
                {insight.user_segments.map((s) => (
                  <li key={s.segment}>
                    <p className="text-small font-medium text-primary">
                      {s.segment} <span className="text-tertiary">· {s.feedback_count} item(s)</span>
                    </p>
                    <p className="text-small mt-0.5 text-secondary">{s.characteristics}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.feature_opportunities?.length > 0 && (
            <div className="rounded-2xl border border-default bg-surface-card p-5">
              <h3 className="text-small flex items-center gap-1.5 font-semibold text-primary">
                <Lightbulb size={14} /> Feature Opportunities
              </h3>
              <ul className="mt-3 space-y-3">
                {insight.feature_opportunities.map((f) => (
                  <li key={f.opportunity}>
                    <p className="text-small font-medium text-primary">{f.opportunity}</p>
                    <p className="text-small mt-0.5 text-secondary">{f.reasoning}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.revenue_opportunities?.length > 0 && (
            <div className="rounded-2xl border border-default bg-surface-card p-5">
              <h3 className="text-small flex items-center gap-1.5 font-semibold text-primary">
                <TrendingUp size={14} /> Revenue Opportunities
              </h3>
              <ul className="mt-3 space-y-3">
                {insight.revenue_opportunities.map((r) => (
                  <li key={r.opportunity}>
                    <div className="flex items-center gap-2">
                      <p className="text-small font-medium text-primary">{r.opportunity}</p>
                      <Badge tone={IMPACT_TONE[r.potential_impact] || 'neutral'}>{r.potential_impact} impact</Badge>
                    </div>
                    <p className="text-small mt-0.5 text-secondary">{r.reasoning}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    fetchProduct(id)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteProduct(id)
      navigate(ROUTES.PRODUCTS)
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete this product. Please try again.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load this product"
        description={error.message || 'It may have been deleted, or you may not have access to it.'}
      />
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-page-heading text-primary">{product.name}</h1>
          <p className="text-caption mt-1 text-tertiary">
            Created {formatDate(product.created_at)} · Updated {formatDate(product.updated_at)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link to={`${ROUTES.PRODUCTS}/edit/${id}`}>
            <Button variant="outline" leftIcon={<Pencil size={15} />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-danger-600 hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-500/10"
            leftIcon={<Trash2 size={15} />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <h2 className="text-card-heading text-primary">Description</h2>
        <p className="text-body mt-2 text-secondary">{product.description || 'No description yet.'}</p>
      </div>

      <InsightsSection productId={id} />

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setDeleteError('')
        }}
        title="Delete product?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-body text-secondary">
          This will permanently delete <strong className="text-primary">{product.name}</strong>. This action
          cannot be undone.
        </p>
        {deleteError && <p className="text-small mt-3 text-danger-600">{deleteError}</p>}
      </Modal>
    </div>
  )
}
