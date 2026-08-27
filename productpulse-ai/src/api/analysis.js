import { api } from './axios'

/** POST /api/v1/feedback/{id}/analyze */
export function analyzeFeedback(feedbackId) {
  return api.post(`/feedback/${feedbackId}/analyze`)
}

/** GET /api/v1/analysis/{feedbackId} */
export function getAnalysis(feedbackId) {
  return api.get(`/analysis/${feedbackId}`)
}
