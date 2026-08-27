import { api } from './axios'

export function generateRoadmap(productId) {
  return api.post(`/products/${productId}/roadmap/generate`)
}

export function getRoadmap(productId) {
  return api.get(`/products/${productId}/roadmap`)
}

export function updateRoadmapItemStatus(itemId, status) {
  return api.patch(`/roadmap/${itemId}`, { status })
}
