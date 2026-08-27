import * as feedbackApi from '../api/feedback'
import { toServiceError } from '../api/axios'

export async function fetchFeedback(params) {
  try {
    const response = await feedbackApi.listFeedback(params)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function fetchFeedbackItem(id) {
  try {
    const response = await feedbackApi.getFeedback(id)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

/** @param {{ product_id: string, feedback_text: string, source?: string, customer_type?: string }} payload */
export async function createFeedback(payload) {
  try {
    const response = await feedbackApi.createFeedback(payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updateFeedback(id, payload) {
  try {
    const response = await feedbackApi.updateFeedback(id, payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function deleteFeedback(id) {
  try {
    await feedbackApi.deleteFeedback(id)
  } catch (error) {
    throw toServiceError(error)
  }
}
