import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ROUTES } from '../lib/constants'

import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { Products } from '../pages/products/Products'
import { ProductDetails } from '../pages/products/ProductDetails'
import { CreateProduct } from '../pages/products/CreateProduct'
import { EditProduct } from '../pages/products/EditProduct'
import { Feedback } from '../pages/feedback/Feedback'
import { FeedbackDetails } from '../pages/feedback/FeedbackDetails'
import { Analytics } from '../pages/analytics/Analytics'
import { Roadmap } from '../pages/roadmap/Roadmap'
import { Profile } from '../pages/profile/Profile'
import { Settings } from '../pages/settings/Settings'
import { NotFound } from '../pages/NotFound'

export function AppRoutes() {
  return (
    <Routes>
      {/* Guest-only: redirects to /dashboard if already authenticated */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
        </Route>
      </Route>

      {/* Authenticated-only: redirects to /login if there's no session */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          <Route path={ROUTES.PRODUCTS} element={<Products />} />
          <Route path={`${ROUTES.PRODUCTS}/create`} element={<CreateProduct />} />
          <Route path={`${ROUTES.PRODUCTS}/edit/:id`} element={<EditProduct />} />
          <Route path={`${ROUTES.PRODUCTS}/:id`} element={<ProductDetails />} />

          <Route path={ROUTES.FEEDBACK} element={<Feedback />} />
          <Route path={`${ROUTES.FEEDBACK}/:id`} element={<FeedbackDetails />} />

          <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
          <Route path={ROUTES.ROADMAP} element={<Roadmap />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
