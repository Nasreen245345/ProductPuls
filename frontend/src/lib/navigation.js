import { LayoutDashboard, Package, MessageSquareText, BarChart3, Map, User, Settings } from 'lucide-react'
import { ROUTES } from './constants'

/** Primary navigation — Chapter 3 §12. */
export const MAIN_NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Products', to: ROUTES.PRODUCTS, icon: Package },
  { label: 'Feedback', to: ROUTES.FEEDBACK, icon: MessageSquareText },
  { label: 'Analytics', to: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: 'Roadmap', to: ROUTES.ROADMAP, icon: Map },
]

/** Footer navigation — sits below the primary list, above Logout. */
export const FOOTER_NAV_ITEMS = [
  { label: 'Profile', to: ROUTES.PROFILE, icon: User },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
]
