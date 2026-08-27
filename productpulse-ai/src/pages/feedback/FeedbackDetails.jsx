import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AlertTriangle, Trash2, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { FeedbackSummary } from '../../components/feedback/FeedbackSummary'
import { useProducts } from '../../hooks/useProducts'
import { fetchFeedbackItem, deleteFeedback } from '../../services/feedbackService'
import { analyzeFeedback } from '../../services/analysisService'
import { ROUTES } from '../../lib/constants'

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function FeedbackDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products } = useProducts({ limit: 100 })

  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    fetchFeedbackItem(id)
      .then((res) => setFeedback(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await analyzeFeedback(id)
      setFeedback((prev) => ({ ...prev, analysis: res.data }))
    } catch (err) {
      setAnalyzeError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteFeedback(id)
      navigate(ROUTES.FEEDBACK)
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete this feedback. Please try again.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load this feedback"
        description={error.message || 'It may have been deleted, or you may not have access to it.'}
      />
    )
  }

  const productName = products.find((p) => p.id === feedback.product_id)?.name || '—'
  const analysis = feedback.analysis

  return (
    <div className="max-w-2xl">
      <Link to={ROUTES.FEEDBACK} className="text-small mb-4 inline-flex items-center gap-1 text-secondary hover:text-primary">
        <ArrowLeft size={14} /> Back to Feedback
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-page-heading text-primary">{productName}</h1>
            {feedback.source && <Badge tone="brand">{feedback.source}</Badge>}
            {feedback.customer_type && <Badge tone="neutral">{feedback.customer_type}</Badge>}
          </div>
          <p className="text-caption mt-1 text-tertiary">Submitted {formatDate(feedback.created_at)}</p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 text-danger-600 hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-500/10"
          leftIcon={<Trash2 size={15} />}
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-default bg-surface-card p-6">
        <h2 className="text-card-heading text-primary">Feedback</h2>
        <p className="text-body mt-2 whitespace-pre-wrap text-secondary">{feedback.feedback_text}</p>
      </div>

      <div className="mt-6">
        {isAnalyzing ? (
          <div className="rounded-2xl border border-dashed border-default p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : analysis?.analysis_status === 'success' ? (
          <FeedbackSummary analysis={analysis} />
        ) : analysis?.analysis_status === 'failed' ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-50 p-6 dark:border-danger-500/20 dark:bg-danger-500/10">
            <p className="text-small font-semibold text-danger-700 dark:text-danger-500">Analysis failed</p>
            <p className="text-small mt-1 text-danger-600 dark:text-danger-500">
              {analysis.error_message || 'Something went wrong while analyzing this feedback.'}
            </p>
            <Button variant="outline" size="sm" className="mt-3" leftIcon={<RotateCcw size={14} />} onClick={handleAnalyze}>
              Retry Analysis
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-default p-6 text-center">
            <p className="text-small mb-3 text-tertiary">This feedback hasn&apos;t been analyzed yet.</p>
            <Button leftIcon={<Sparkles size={15} />} onClick={handleAnalyze}>
              Analyze Feedback
            </Button>
          </div>
        )}
        {analyzeError && <p className="text-small mt-2 text-danger-600">{analyzeError}</p>}
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setDeleteError('')
        }}
        title="Delete this feedback?"
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
        <p className="text-body text-secondary">This action cannot be undone.</p>
        {deleteError && <p className="text-small mt-3 text-danger-600">{deleteError}</p>}
      </Modal>
    </div>
  )
}
