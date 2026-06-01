// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo    from '../components/ui/Logo'
import Spinner from '../components/ui/Spinner'

// Map backend error messages to friendly specific ones
function parseError(err) {
  const msg = err?.response?.data?.error || ''
  const status = err?.response?.status

  if (status === 401)                              return 'Invalid email or password. Please try again.'
  if (status === 404)                              return 'No account found with this email.'
  if (msg.toLowerCase().includes('invalid'))      return 'Invalid email or password. Please try again.'
  if (msg.toLowerCase().includes('not found'))    return 'No account found with this email.'
  if (msg.toLowerCase().includes('credentials'))  return 'Invalid credentials. Check your email and password.'
  if (status === 500)                              return 'Server error. Please try again in a moment.'
  if (!navigator.onLine)                           return 'No internet connection. Check your network.'
  return msg || 'Login failed. Please try again.'
}

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const toast      = useToast()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!password)     { setError('Please enter your password.'); return }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return }

    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      toast.success('Login successful! Welcome back 👋')
      navigate('/dashboard')
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#07070f', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Ambient */}
      <div className="ms-ambient"><div className="ms-grid-overlay" /></div>

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, position: 'relative', zIndex: 1, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 380 }}>
          <div className="fade-up" style={{ marginBottom: 44 }}><Logo size="lg" /></div>
          <h2 className="fade-up delay-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 3, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
            YOUR HABITS.<br />YOUR DATA.<br />YOUR STREAK.
          </h2>
          <p className="fade-up delay-2" style={{ fontSize: 13, color: '#333', lineHeight: 1.8, marginBottom: 32 }}>
            The focused productivity platform for people who actually want to improve — not just plan to.
          </p>
          <div className="fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['🔥', 'Streak Tracking',  'Never lose sight of your consistency'],
              ['📊', 'Live Analytics',   'Real scores based on real behavior'],
              ['🔐', 'JWT Secured',      'Your data belongs to you, always'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 1 }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: '#333' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ─────────────────────────────────────────────────────── */}
      <div style={{ width: '44%', minWidth: 370, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div className="fade-up" style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 5 }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: '#444' }}>Log in to your MindStreak dashboard</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="fade-in" style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              ⚠ {error}
            </div>
          )}

          <div className="fade-up delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label className="ms-label">Email Address</label>
              <input className="ms-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="ms-label" style={{ margin: 0 }}>Password</label>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="ms-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ paddingRight: 44 }} disabled={loading}
                />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#333' }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button className="ms-btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <><Spinner />Signing In...</> : 'Sign In →'}
            </button>
          </div>

          {/* Divider */}
          <div className="fade-up delay-2" style={{ margin: '24px 0', position: 'relative' }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#07070f', padding: '0 12px', fontSize: 11, color: '#2a2a3a' }}>
              or continue with
            </span>
          </div>

          <button className="ms-btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 17 }}>🌐</span> Continue with Google
          </button>

          <div className="fade-up delay-3" style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: '#333' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}