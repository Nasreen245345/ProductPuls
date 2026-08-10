import * as authApi from '../api/auth'
import { toServiceError } from '../api/axios'

/** Matches POST /api/v1/auth/register (FR-001). Backend validates password strength and confirm match too. */
export async function registerUser({ full_name, email, password, confirm_password }) {
  try {
    const response = await authApi.register({ full_name, email, password, confirm_password })
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

/** Matches POST /api/v1/auth/login (FR-002). */
export async function loginUser({ email, password }) {
  try {
    const response = await authApi.login({ email, password })
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

/**
 * Matches GET /api/v1/auth/me. Unlike the earlier mock version, the token
 * doesn't need to be passed in — the axios request interceptor (api/axios.js)
 * attaches whatever is currently in localStorage automatically.
 */
export async function fetchCurrentUser() {
  try {
    const response = await authApi.getCurrentUser()
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}
