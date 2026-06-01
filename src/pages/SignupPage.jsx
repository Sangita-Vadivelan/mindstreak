// src/pages/SignupPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo    from '../components/ui/Logo'
import Spinner from '../components/ui/Spinner'

function parseError(err) {
  const msg    = err?.response?.data?.error || ''
  const status = err?.response?.status

  if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists') || status === 409)
    return 'This email is already registered. Try logging in instead.'
  if (msg.toLowerCase().includes('password'))
    return 'Password is too weak. Use at least 8 characters with letters and numbers.'
  if (status === 400 && msg.toLowerCase().includes('email'))
    return 'Please enter a valid email address.'
  if (status === 500)
    return 'Server error. Please try again in a moment.'
  if (!navigator.onLine)
    return 'No internet connection. Check your network.'
  return msg || 'Registration failed. Please try again.'
}

function PasswordStrength({ password }) {
  const score = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)           s++
    if (/[A-Z]/.test(password))         s++
    if (/[0-9]/.test(password))         s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#10b981']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= score ? colors[score] : '#1a1a2e', transition: 'background .3s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</div>
    </div>
  )
}

export default function SignupPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const toast        = useToast()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async () => {
    setError('')

    // Client-side validation with specific messages
    if (!name.trim())    { setError('Please enter your full name.'); return }
    if (!email.trim())   { setError('Please enter your email address.'); return }
    if (!password)       { setError('Please enter a password.'); return }
    if (!confirm)        { setError('Please confirm your password.'); return }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return }

    if (password.length < 8)   { setError('Password must be at least 8 characters long.'); return }
    if (password !== confirm)  { setError("Passwords don't match. Please check and try again."); return }

    setLoading(true)
    try {
      await register(name.trim(), email.trim().toLowerCase(), password)
      toast.success('Account created successfully! Welcome to MindStreak 🔥')
      navigate('/dashboard')
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#07070f', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="ms-ambient"><div className="ms-grid-overlay" /></div>

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, position: 'relative', zIndex: 1, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 380 }}>
          <div className="fade-up" style={{ marginBottom: 44 }}><Logo size="lg" /></div>
          <h2 className="fade-up delay-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 3, color: '#fff', lineHeight: 1.1, marginBottom: 14 }}>
            JOIN THE<br />STREAK BUILDERS.
          </h2>
          <p className="fade-up delay-2" style={{ fontSize: 13, color: '#333', lineHeight: 1.8, marginBottom: 28 }}>
            Free forever. Your data, your dashboard, your rules.
          </p>
          <div className="fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Unlimited habits & tasks', 'Real-time analytics & insights', 'Notes with tag support', 'Contribution heatmap', 'Secure JWT authentication'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#10b981', fontWeight: 900 }}>✓</div>
                <span style={{ fontSize: 13, color: '#555' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ─────────────────────────────────────────────────────── */}
      <div style={{ width: '44%', minWidth: 370, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div className="fade-up" style={{ marginBottom: 26 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 5 }}>Create your account</h1>
            <p style={{ fontSize: 13, color: '#444' }}>Start building habits that actually stick</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="fade-in" style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              ⚠ {error}
            </div>
          )}

          <div className="fade-up delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {/* Name */}
            <div>
              <label className="ms-label">Full Name</label>
              <input className="ms-input" type="text" placeholder="Aditya Kumar"
                value={name} onChange={e => setName(e.target.value)} disabled={loading} />
            </div>

            {/* Email */}
            <div>
              <label className="ms-label">Email Address</label>
              <input className="ms-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>

            {/* Password */}
            <div>
              <label className="ms-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="ms-input" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }} disabled={loading} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#333' }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="ms-label">Confirm Password</label>
              <input className="ms-input" type="password" placeholder="Re-enter password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ borderColor: confirm && confirm !== password ? 'rgba(239,68,68,0.4)' : undefined }}
                disabled={loading}
              />
              {confirm && confirm !== password && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords don't match</div>
              )}
            </div>

            {/* Submit */}
            <button className="ms-btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <><Spinner />Creating Account...</> : 'Create Account →'}
            </button>

            <p style={{ fontSize: 11, color: '#2a2a3a', textAlign: 'center', lineHeight: 1.6 }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          <div className="fade-up delay-2" style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#333' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}