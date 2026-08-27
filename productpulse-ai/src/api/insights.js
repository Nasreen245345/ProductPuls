import { api } from './axios'

export function generateInsights(productId) {
  return api.post(`/products/${productId}/insights/generate`)
}

export function getInsights(productId) {
  return api.get(`/products/${productId}/insights`)
}
