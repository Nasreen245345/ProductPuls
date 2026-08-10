import { Badge } from '../ui/Badge'

const SENTIMENT_TONE = { Positive: 'success', Neutral: 'neutral', Negative: 'danger' }

function truncate(text, max = 80) {
  if (!text || text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * @param {Array<{ id, feedback_text, product_name, analysis, created_at }>} items
 * @param {(id: string) => void} onRowClick - optional; makes rows interactive when provided
 */
export function FeedbackTable({ items, onRowClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-default bg-surface-card">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-default">
            <th className="text-caption px-5 py-3 font-semibold text-tertiary">Product</th>
            <th className="text-caption px-5 py-3 font-semibold text-tertiary">Feedback</th>
            <th className="text-caption px-5 py-3 font-semibold text-tertiary">Sentiment</th>
            <th className="text-caption px-5 py-3 font-semibold text-tertiary">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const sentiment = item.analysis?.sentiment
            return (
              <tr
                key={item.id}
                onClick={onRowClick ? () => onRowClick(item.id) : undefined}
                className={`border-b border-default last:border-b-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-sunken' : ''}`}
              >
                <td className="text-small whitespace-nowrap px-5 py-3.5 font-medium text-primary">
                  {item.product_name}
                </td>
                <td className="text-small px-5 py-3.5 text-secondary">{truncate(item.feedback_text)}</td>
                <td className="px-5 py-3.5">
                  {sentiment ? (
                    <Badge tone={SENTIMENT_TONE[sentiment]}>{sentiment}</Badge>
                  ) : (
                    <Badge tone="neutral">Pending</Badge>
                  )}
                </td>
                <td className="text-small whitespace-nowrap px-5 py-3.5 text-tertiary">{formatDate(item.created_at)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
