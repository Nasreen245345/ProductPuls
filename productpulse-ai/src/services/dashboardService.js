import * as analyticsApi from '../api/analytics'
import { toServiceError } from '../api/axios'

/**
 * Returns overview + charts + insights + recentFeedback in a single call,
 * matching Chapter 9 §19's single-request dashboard principle — now backed
 * by the real GET /api/v1/analytics/dashboard endpoint instead of mocks.
 */
export async function getDashboardData() {
  try {
    const response = await analyticsApi.getDashboard()
    const payload = response.data?.data || response.data
    const { overview, charts, insights, recent_feedback } = payload || {}

    return {
      overview: overview || { total_products: 0, total_feedback: 0, total_feature_requests: 0, total_pain_points: 0 },
      charts: charts || { feedback_over_time: [], sentiment_distribution: [], category_breakdown: [] },
      insights: insights || { top_pain_points: [], top_feature_requests: [], summary: '' },
      // FeedbackTable expects `analysis.sentiment` (matching the real feedback
      // list endpoint's shape) — the dashboard endpoint returns a flat
      // `sentiment` field instead, so adapt it here rather than changing a
      // shared component to accommodate one caller.
      recentFeedback: (recent_feedback || []).map((item) => ({
        ...item,
        analysis: item.sentiment ? { sentiment: item.sentiment } : null,
      })),
    }
  } catch (error) {
    throw toServiceError(error)
  }
}
