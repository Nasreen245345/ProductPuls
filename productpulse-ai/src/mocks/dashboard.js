/** GET /api/v1/dashboard/overview */
export const MOCK_DASHBOARD_OVERVIEW = {
  total_products: 4,
  total_feedback: 22,
  total_feature_requests: 12,
  total_pain_points: 15,
  recent_activity: [
    { id: 'fb_008', type: 'feedback_submitted', product_name: 'TaskFlow', created_at: '2026-01-21T09:00:00Z' },
    { id: 'fb_019', type: 'feedback_submitted', product_name: 'MetricStack', created_at: '2026-01-22T10:00:00Z' },
    { id: 'fb_015', type: 'feedback_analyzed', product_name: 'MetricStack', created_at: '2026-01-21T13:00:05Z' },
    { id: 'fb_009', type: 'feedback_analyzed', product_name: 'InvoicePilot', created_at: '2026-01-20T14:00:05Z' },
  ],
}

/** GET /api/v1/dashboard/charts */
export const MOCK_DASHBOARD_CHARTS = {
  feedback_over_time: [
    { date: '2026-01-16', count: 2 },
    { date: '2026-01-17', count: 3 },
    { date: '2026-01-18', count: 3 },
    { date: '2026-01-19', count: 4 },
    { date: '2026-01-20', count: 5 },
    { date: '2026-01-21', count: 3 },
    { date: '2026-01-22', count: 2 },
  ],
  sentiment_distribution: [
    { sentiment: 'Positive', count: 5 },
    { sentiment: 'Neutral', count: 6 },
    { sentiment: 'Negative', count: 10 },
  ],
  category_breakdown: [
    { category: 'Performance', count: 5 },
    { category: 'UI', count: 4 },
    { category: 'Billing', count: 2 },
    { category: 'Integrations', count: 1 },
    { category: 'Authentication', count: 1 },
    { category: 'Notifications', count: 2 },
    { category: 'Onboarding', count: 2 },
    { category: 'Task Management', count: 2 },
    { category: 'Reporting', count: 1 },
    { category: 'Support', count: 1 },
  ],
}

/** GET /api/v1/dashboard/insights */
export const MOCK_DASHBOARD_INSIGHTS = {
  top_pain_points: [
    { label: 'Slow dashboard performance with large task counts', product_name: 'TaskFlow', mentions: 1 },
    { label: 'Invoice emails landing in spam folders', product_name: 'InvoicePilot', mentions: 1 },
    { label: 'No built-in cohort retention visualization', product_name: 'MetricStack', mentions: 1 },
  ],
  top_feature_requests: [
    { label: 'Slack integration', mentions: 2, products: ['TaskFlow', 'MetricStack'] },
    { label: 'Recurring invoices', mentions: 1, products: ['InvoicePilot'] },
    { label: 'Dark mode', mentions: 1, products: ['TaskFlow'] },
  ],
  ai_summary:
    'Feedback this week skews toward performance complaints (TaskFlow dashboard, InvoicePilot mobile view) and integration requests (Slack, recurring billing). Negative sentiment is concentrated in Enterprise and SMB accounts reporting speed issues — worth prioritizing before new feature work.',
}
