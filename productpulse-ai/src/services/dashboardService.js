import { delay } from '../lib/helpers'
import { MOCK_DASHBOARD_OVERVIEW, MOCK_DASHBOARD_CHARTS, MOCK_DASHBOARD_INSIGHTS } from '../mocks/dashboard'
import { MOCK_FEEDBACK } from '../mocks/feedback'
import { MOCK_PRODUCTS } from '../mocks/products'

const RECENT_FEEDBACK_LIMIT = 5

/**
 * Returns overview + charts + insights + recent feedback in a single call.
 * Chapter 9 §19 ("Dashboard Rendering Strategy") is explicit that the
 * dashboard should fetch once and render widgets from a single response
 * rather than firing several separate requests — this mirrors that shape
 * even against mocks.
 */
export async function getDashboardData() {
  await delay()

  const recentFeedback = [...MOCK_FEEDBACK]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, RECENT_FEEDBACK_LIMIT)
    .map((item) => ({
      ...item,
      product_name: MOCK_PRODUCTS.find((p) => p.id === item.product_id)?.name ?? 'Unknown product',
    }))

  return {
    overview: MOCK_DASHBOARD_OVERVIEW,
    charts: MOCK_DASHBOARD_CHARTS,
    insights: MOCK_DASHBOARD_INSIGHTS,
    recentFeedback,
  }
}
