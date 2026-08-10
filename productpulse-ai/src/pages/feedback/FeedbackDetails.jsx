import { useParams } from 'react-router-dom'

export function FeedbackDetails() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-page-heading text-primary">Feedback Details</h1>
      <p className="text-body mt-1 text-secondary">
        Feedback <span className="font-mono">{id}</span> — built out in Module 8 — Feedback.
      </p>
    </div>
  )
}
