import { Sparkles, AlertCircle, Lightbulb } from 'lucide-react'
import { Card } from '../ui/Card'

/**
 * @param {string} summary - a computed narrative built from aggregated stats (NOT an LLM call — see dashboardService.js)
 * @param {{ label: string, product_name?: string }[]} painPoints - AI-extracted per-feedback pain points (Module 4)
 * @param {{ label: string, mentions: number }[]} featureRequests - AI-extracted per-feedback feature requests (Module 4)
 */
export function InsightCard({ summary, painPoints = [], featureRequests = [] }) {
  return (
    <Card className="border-ai-100 bg-gradient-to-br from-ai-50 to-surface-card p-5 dark:border-ai-500/20 dark:from-ai-500/10 dark:to-surface-card">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ai-100 text-ai-700 dark:bg-ai-500/20 dark:text-ai-400">
          <Sparkles size={14} />
        </span>
        <h3 className="text-card-heading text-primary">Insights</h3>
      </div>

      {summary && <p className="text-body mt-3 leading-relaxed text-secondary">{summary}</p>}

      {painPoints.length > 0 && (
        <div className="mt-4">
          <p className="text-caption flex items-center gap-1.5 font-semibold text-secondary">
            <AlertCircle size={13} />
            Priority alerts
          </p>
          <ul className="mt-2 space-y-1.5">
            {painPoints.map((point) => (
              <li key={point.label} className="text-small text-primary">
                {point.label}
                {point.product_name && <span className="text-tertiary"> — {point.product_name}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {featureRequests.length > 0 && (
        <div className="mt-4">
          <p className="text-caption flex items-center gap-1.5 font-semibold text-secondary">
            <Lightbulb size={13} />
            Top recommendations
          </p>
          <ul className="mt-2 space-y-1.5">
            {featureRequests.map((item) => (
              <li key={item.label} className="text-small text-primary">
                {item.label}
                <span className="text-tertiary"> · {item.mentions} mentions</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
