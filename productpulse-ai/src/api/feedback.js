import { api } from './axios'

/**
 * GET /api/v1/feedback
 * @param {{ page?, limit?, search?, product_id?, source?, customer_type? }} params
 */
export function listFeedback(params = {}) {
  return api.get('/feedback', { params })
}

export function getFeedback(id) {
  return api.get(`/feedback/${id}`)
}

export function createFeedback(payload) {
  return api.post('/feedback', payload)
}

export function updateFeedback(id, payload) {
  return api.put(`/feedback/${id}`, payload)
}

export function deleteFeedback(id) {
  return api.delete(`/feedback/${id}`)
}
