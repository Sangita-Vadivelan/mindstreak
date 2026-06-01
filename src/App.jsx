import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Public pages
import LandingPage  from '@/pages/LandingPage'
import LoginPage    from '@/pages/LoginPage'
import SignupPage   from '@/pages/SignupPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Protected pages
import DashboardPage  from '@/pages/DashboardPage'
import HabitsPage     from '@/pages/HabitsPage'
import ActivitiesPage from '@/pages/ActivitiesPage'
import NotesPage      from '@/pages/NotesPage'
import AnalyticsPage  from '@/pages/AnalyticsPage'

export default function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────────── */}
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* ── Protected (need auth) ──────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/habits"     element={<HabitsPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/notes"      element={<NotesPage />} />
          <Route path="/analytics"  element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* ── Fallback ───────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}