import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const IMPACT_TONE = { Low: 'neutral', Medium: 'warning', High: 'danger' }
const STATUS_OPTIONS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
]

/**
 * @param {object} item - a RoadmapItemResponse
 * @param {(status: string) => void} onStatusChange
 */
export function RoadmapCard({ item, onStatusChange }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-caption font-bold text-white">
            {item.priority}
          </span>
          <div>
            <h3 className="text-card-heading text-primary">{item.feature}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone={IMPACT_TONE[item.expected_impact] || 'neutral'}>{item.expected_impact} impact</Badge>
              {item.timeline && <Badge tone="neutral">{item.timeline}</Badge>}
            </div>
          </div>
        </div>

        <Select
          value={item.status}
          options={STATUS_OPTIONS}
          onChange={(e) => onStatusChange(e.target.value)}
          className="!py-1.5 !pr-8 !text-caption w-36 shrink-0"
        />
      </div>

      <p className="text-small mt-3 text-secondary">{item.reasoning}</p>

      {item.supporting_evidence && (
        <div className="mt-3 border-t border-default pt-3">
          <p className="text-caption font-semibold text-tertiary">Supporting feedback</p>
          <p className="text-small mt-1 text-secondary">{item.supporting_evidence}</p>
        </div>
      )}

      {item.risks && (
        <div className="mt-3">
          <p className="text-caption font-semibold text-tertiary">Risks</p>
          <p className="text-small mt-1 text-secondary">{item.risks}</p>
        </div>
      )}
    </Card>
  )
}
