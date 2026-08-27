import { Sparkles } from 'lucide-react'
import { Badge } from '../ui/Badge'

const SENTIMENT_TONE = { Positive: 'success', Neutral: 'neutral', Negative: 'danger' }
const URGENCY_TONE = { Low: 'neutral', Medium: 'warning', High: 'danger' }

/** @param {object} analysis - an AnalysisResponse with analysis_status === 'success' */
export function FeedbackSummary({ analysis }) {
  return (
    <div className="rounded-2xl border border-ai-100 bg-gradient-to-br from-ai-50 to-surface-card p-6 dark:border-ai-500/20 dark:from-ai-500/10 dark:to-surface-card">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ai-100 text-ai-700 dark:bg-ai-500/20 dark:text-ai-400">
          <Sparkles size={14} />
        </span>
        <h2 className="text-card-heading text-primary">AI Analysis</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="brand">{analysis.category}</Badge>
        <Badge tone={SENTIMENT_TONE[analysis.sentiment] || 'neutral'}>{analysis.sentiment}</Badge>
        <Badge tone={URGENCY_TONE[analysis.urgency] || 'neutral'}>{analysis.urgency} urgency</Badge>
        {analysis.user_type && <Badge tone="neutral">{analysis.user_type}</Badge>}
        {analysis.business_impact && (
          <Badge tone={URGENCY_TONE[analysis.business_impact] || 'neutral'}>{analysis.business_impact} impact</Badge>
        )}
      </div>

      <p className="text-body mt-4 text-secondary">{analysis.summary}</p>

      {analysis.pain_point && (
        <div className="mt-4">
          <p className="text-caption font-semibold text-secondary">Pain point</p>
          <p className="text-small mt-1 text-primary">{analysis.pain_point}</p>
        </div>
      )}

      {analysis.feature_request && (
        <div className="mt-4">
          <p className="text-caption font-semibold text-secondary">Feature request</p>
          <p className="text-small mt-1 text-primary">{analysis.feature_request}</p>
        </div>
      )}

      <p className="text-caption mt-5 border-t border-ai-100 pt-3 text-tertiary dark:border-ai-500/20">
        Analyzed by {analysis.model_name}
        {analysis.processing_time_ms != null && ` · ${analysis.processing_time_ms}ms`}
      </p>
    </div>
  )
}
