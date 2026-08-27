/**
 * Mock users. `password` exists only so Module 6's mock authService can
 * validate a login without a real backend — a real API response would
 * never include it (see Chapter 6 §10, "never return the password field").
 */
export const MOCK_USERS = [
  {
    id: 'usr_001',
    full_name: 'Jordan Lee',
    email: 'demo@productpulse.ai',
    password: 'Demo@1234',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z',
  },
]

/** Returns a user with `password` stripped — matches what GET /api/v1/auth/me would return. */
export function toPublicUser(user) {
  const { password: _password, ...publicUser } = user
  return publicUser
}
