import { api } from './axios'

/** GET /api/v1/products */
export function listProducts(params = {}) {
  return api.get('/products', { params })
}

/** GET /api/v1/products/{id} */
export function getProduct(id) {
  return api.get(`/products/${id}`)
}

/** POST /api/v1/products */
export function createProduct(payload) {
  return api.post('/products', payload)
}

/** PUT /api/v1/products/{id} */
export function updateProduct(id, payload) {
  return api.put(`/products/${id}`, payload)
}

/** DELETE /api/v1/products/{id} */
export function deleteProduct(id) {
  return api.delete(`/products/${id}`)
}
