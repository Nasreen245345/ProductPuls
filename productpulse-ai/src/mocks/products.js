/**
 * Mock products, all owned by MOCK_USERS[0] (usr_001).
 * feedback_count is a computed/joined field — a real API would return it
 * pre-aggregated rather than making the frontend count feedback rows.
 */
export const MOCK_PRODUCTS = [
  {
    id: 'prod_001',
    user_id: 'usr_001',
    name: 'TaskFlow',
    description: 'A project management platform for distributed engineering teams.',
    feedback_count: 8,
    created_at: '2025-11-02T10:00:00Z',
    updated_at: '2026-01-20T14:30:00Z',
  },
  {
    id: 'prod_002',
    user_id: 'usr_001',
    name: 'InvoicePilot',
    description: 'Automated invoicing and billing for small business owners.',
    feedback_count: 6,
    created_at: '2025-11-18T08:15:00Z',
    updated_at: '2026-01-18T11:05:00Z',
  },
  {
    id: 'prod_003',
    user_id: 'usr_001',
    name: 'MetricStack',
    description: 'Self-serve product analytics for early-stage SaaS companies.',
    feedback_count: 5,
    created_at: '2025-12-01T09:30:00Z',
    updated_at: '2026-01-22T16:45:00Z',
  },
  {
    id: 'prod_004',
    user_id: 'usr_001',
    name: 'HelpDeskly',
    description: 'A lightweight customer support inbox for small teams.',
    feedback_count: 3,
    created_at: '2025-12-20T13:00:00Z',
    updated_at: '2026-01-10T09:20:00Z',
  },
]
