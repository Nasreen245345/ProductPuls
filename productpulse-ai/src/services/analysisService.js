import * as analysisApi from '../api/analysis'
import { toServiceError } from '../api/axios'

/** Triggers AI analysis for a feedback item. May take a few seconds — the caller should show a loading state. */
export async function analyzeFeedback(feedbackId) {
  try {
    const response = await analysisApi.analyzeFeedback(feedbackId)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function fetchAnalysis(feedbackId) {
  try {
    const response = await analysisApi.getAnalysis(feedbackId)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}
