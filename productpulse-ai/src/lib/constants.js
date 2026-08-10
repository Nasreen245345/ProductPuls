/** App metadata. */
export const APP_NAME = 'ProductPulse AI'

/**
 * localStorage keys, centralized so a key is never typed twice.
 * Both ThemeContext and AuthContext read from here.
 */
export const STORAGE_KEYS = {
  THEME: 'productpulse_theme',
  AUTH_TOKEN: 'productpulse_token',
}

/** Route paths, centralized so navigation config and redirects can't drift out of sync. */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  FEEDBACK: '/feedback',
  ANALYTICS: '/analytics',
  ROADMAP: '/roadmap',
  PROFILE: '/profile',
  SETTINGS: '/settings',
}
