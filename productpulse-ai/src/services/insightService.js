import * as insightsApi from '../api/insights'
import { toServiceError } from '../api/axios'

export async function generateInsights(productId) {
  try {
    const response = await insightsApi.generateInsights(productId)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function fetchInsights(productId) {
  try {
    const response = await insightsApi.getInsights(productId)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}
