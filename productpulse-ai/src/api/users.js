import { api } from './axios'

export function updateProfile(payload) {
  return api.put('/users/me', payload)
}

export function changePassword(payload) {
  return api.put('/users/me/password', payload)
}

export function updatePreferences(payload) {
  return api.put('/users/me/preferences', payload)
}
