import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#07070f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 24,
    }}>
      <div className="ms-ambient"><div className="ms-grid-overlay" /></div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 28 }}><Logo size="lg" /></div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 120, letterSpacing: 8,
          background: 'linear-gradient(135deg,#1a1a2e,#2a2a3a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: 16,
        }}>404</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#555', marginBottom: 8 }}>Streak not found</h2>
        <p style={{ fontSize: 14, color: '#333', marginBottom: 32 }}>This page doesn't exist — but your habits can.</p>
        <Link to="/dashboard">
          <button className="ms-btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  )
}


