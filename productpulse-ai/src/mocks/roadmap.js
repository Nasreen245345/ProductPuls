/**
 * Keyed by product_id. A missing key means no roadmap has been generated
 * for that product yet — matches the real flow where generation is
 * on-demand (POST /roadmap/generate), not automatic.
 */
export const MOCK_ROADMAPS = {
  prod_001: {
    generated_at: '2026-01-21T10:00:00Z',
    items: [
      {
        id: 'rm_001',
        priority: 1,
        feature: 'Dashboard performance overhaul',
        category: 'Performance',
        reasoning:
          'The single most-cited complaint across recent feedback, and the only one flagged High urgency by an Enterprise account — slow load times directly disrupt daily standups.',
        supporting_pain_points: ['Slow dashboard performance with large task counts', 'CSV export is slow and times out on large boards'],
        expected_impact: 'High',
        risks: 'May require query/index changes on the backend; needs load testing against 200+ task boards before release.',
        status: 'In Progress',
      },
      {
        id: 'rm_002',
        priority: 2,
        feature: 'Slack integration',
        category: 'Integrations',
        reasoning:
          'Requested by an Enterprise account with a clear time-cost quantified ("hours every week"), and the same request recurs in MetricStack feedback — likely a cross-product opportunity.',
        supporting_pain_points: ['Manual copying of task updates into Slack'],
        expected_impact: 'High',
        risks: 'Requires OAuth setup and Slack app review; scope to task-update notifications first, not full two-way sync.',
        status: 'Planned',
      },
      {
        id: 'rm_003',
        priority: 3,
        feature: 'Dark mode',
        category: 'UI',
        reasoning: 'Frequently requested quality-of-life improvement with low implementation risk relative to its visibility.',
        supporting_pain_points: ['Eye strain from bright interface during evening use'],
        expected_impact: 'Medium',
        risks: 'Low — primarily a design system/token exercise.',
        status: 'Planned',
      },
      {
        id: 'rm_004',
        priority: 4,
        feature: 'SSO reliability fix',
        category: 'Authentication',
        reasoning: 'High urgency and directly affects Enterprise accounts, but only a single report so far — worth monitoring before a dedicated sprint.',
        supporting_pain_points: ['Intermittent SSO login failures'],
        expected_impact: 'Medium',
        risks: 'Root cause not yet confirmed — may be an upstream identity provider issue rather than a TaskFlow bug.',
        status: 'Planned',
      },
    ],
  },
  prod_002: {
    generated_at: '2026-01-20T16:30:00Z',
    items: [
      {
        id: 'rm_005',
        priority: 1,
        feature: 'Custom sending domain for invoice emails',
        category: 'Notifications',
        reasoning: 'Deliverability directly affects whether customers get paid — this is a revenue-adjacent issue, not just a UX complaint.',
        supporting_pain_points: ['Invoice emails landing in spam folders'],
        expected_impact: 'High',
        risks: 'Requires DNS/DKIM setup guidance for customers; support load may increase during rollout.',
        status: 'Planned',
      },
      {
        id: 'rm_006',
        priority: 2,
        feature: 'Recurring invoices',
        category: 'Billing',
        reasoning: 'Explicitly quantified manual effort ("12 clients every month by hand") — strong evidence of time saved per user if shipped.',
        supporting_pain_points: ['Manually re-sending identical invoices monthly'],
        expected_impact: 'High',
        risks: 'Needs careful handling of edge cases (client cancellations mid-cycle, proration).',
        status: 'Planned',
      },
    ],
  },
}
