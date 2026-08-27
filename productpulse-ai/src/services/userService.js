import * as usersApi from '../api/users'
import { toServiceError } from '../api/axios'

export async function updateProfile(payload) {
  try {
    const response = await usersApi.updateProfile(payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function changePassword(payload) {
  try {
    const response = await usersApi.changePassword(payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updatePreferences(payload) {
  try {
    const response = await usersApi.updatePreferences(payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}
