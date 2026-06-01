import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * Wraps all protected routes.
 * - If auth is still loading, show a full-screen loader.
 * - If no user, redirect to /login.
 * - Otherwise render the child routes via <Outlet />.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07070f',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg,#b45309,#f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>🔥</div>
        <div style={{
          width: 24, height: 24,
          border: '2px solid #2a2a3a',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 0.65s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}