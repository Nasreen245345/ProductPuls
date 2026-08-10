import axios from 'axios'
import { STORAGE_KEYS, ROUTES } from '../lib/constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the stored token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Chapter 9 §9: if the token has expired, clear it and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN
      }
    }
    return Promise.reject(error)
  },
)

/** Normalizes an Axios error into a plain Error with .message/.code, matching the shape services already throw. */
export function toServiceError(error) {
  const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
  const code = error.response?.data?.error_code || 'UNKNOWN_ERROR'
  const serviceError = new Error(message)
  serviceError.code = code
  return serviceError
}
