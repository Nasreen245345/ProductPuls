import { api } from './axios'

/** POST /api/v1/auth/register */
export function register(payload) {
  return api.post('/auth/register', payload)
}

/** POST /api/v1/auth/login */
export function login(payload) {
  return api.post('/auth/login', payload)
}

/** GET /api/v1/auth/me — token is attached automatically by the axios request interceptor. */
export function getCurrentUser() {
  return api.get('/auth/me')
}
