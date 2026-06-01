import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

const FEATURES = [
  { icon: '🔥', title: 'Streak Engine',    desc: 'GitHub-style heatmaps across 90 days. Consistency made visual.' },
  { icon: '⚡', title: 'Smart Insights',   desc: 'AI analyzes your best hours, worst days, and breaking patterns.' },
  { icon: '📊', title: 'Live Analytics',   desc: 'Real-time productivity scores update as you complete habits.' },
  { icon: '📝', title: 'Linked Notes',     desc: 'Pin notes to habits. Tag everything. Knowledge that connects.' },
  { icon: '🎯', title: 'Daily Focus',      desc: 'Animated task checklist with a live progress bar. Zero overhead.' },
  { icon: '🔐', title: 'Private & Secure', desc: 'JWT auth. Your data stays yours — no third-party tracking.' },
]

const TESTIMONIALS = [
  { name: 'Priya S.',  role: 'SWE Intern @ Google',   text: 'Replaced 3 apps with this. The heatmap changed how I track DSA.' },
  { name: 'Rohan M.',  role: 'CS Final Year',          text: 'Insights told me I\'m 60% less productive on weekends. Fixed it.' },
  { name: 'Aisha K.',  role: 'Productivity Nerd',      text: 'Notion was overkill. MindStreak is exactly what I needed.' },
]

const STATS = ['10,000+ Habits Tracked', '94% Streak Retention', 'Flask + MongoDB', 'Open Source Ready']

export default function LandingPage() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', color: '#c8c8d0', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Ambient */}
      <div className="ms-ambient"><div className="ms-grid-overlay" /></div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Logo />
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Features', 'Analytics', 'Pricing'].map(l => (
            <span key={l} style={{ fontSize: 13, color: '#444', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = '#ccc'}
              onMouseLeave={e => e.target.style.color = '#444'}>{l}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login">
            <button className="ms-btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>Log in</button>
          </Link>
          <Link to="/signup">
            <button className="ms-btn-primary" style={{ width: 'auto', padding: '8px 18px', fontSize: 13 }}>
              Get Started Free
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '160px 24px 80px' }}>
        <div className="fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 100, padding: '5px 16px', marginBottom: 28,
          fontSize: 11, color: '#f59e0b', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          🔥 Build habits that actually stick
        </div>

        <h1 className="fade-up delay-1" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(54px, 9vw, 108px)',
          lineHeight: 0.92, letterSpacing: 4, color: '#fff', marginBottom: 6,
        }}>TRACK YOUR</h1>

        <h1 className="fade-up delay-2" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(54px, 9vw, 108px)',
          lineHeight: 0.92, letterSpacing: 4, marginBottom: 30,
          background: 'linear-gradient(135deg,#f59e0b,#fbbf24,#f59e0b)',
          backgroundSize: '200%',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'shimmer 3s linear infinite',
        }}>STREAKS.</h1>

        <p className="fade-up delay-3" style={{
          fontSize: 'clamp(14px, 2vw, 17px)', color: '#444',
          maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.8,
          fontWeight: 300, fontStyle: 'italic',
        }}>
          The productivity OS for builders, students, and doers. Habits, tasks, notes, and smart insights — all in one dashboard.
        </p>

        <div className="fade-up delay-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup">
            <button style={{
              background: 'linear-gradient(135deg,#b45309,#f59e0b)',
              border: 'none', borderRadius: 14, color: '#0e0a00',
              fontSize: 15, fontWeight: 800, padding: '15px 34px',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 0 40px rgba(245,158,11,0.3)', letterSpacing: 0.3,
            }}>Start Building Streaks →</button>
          </Link>
          <Link to="/dashboard">
            <button className="ms-btn-ghost" style={{ padding: '15px 34px', fontSize: 15 }}>
              View Demo Dashboard
            </button>
          </Link>
        </div>

        {/* Ticker */}
        <div className="fade-up delay-5" style={{ marginTop: 56, overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', gap: 48, animation: 'ticker 22s linear infinite', whiteSpace: 'nowrap' }}>
            {[...STATS, ...STATS].map((s, i) => (
              <span key={i} style={{ fontSize: 11, color: '#2a2a3a', letterSpacing: 2, textTransform: 'uppercase' }}>
                <span style={{ color: '#f59e0b33', marginRight: 18 }}>✦</span>{s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mock Dashboard Preview ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          maxWidth: 860, width: '100%',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, padding: 24,
          boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(245,158,11,0.04)',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Sidebar mockup */}
            <div style={{ width: 130, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg,#b45309,#f59e0b)' }} />
                <div style={{ height: 7, width: 50, borderRadius: 3, background: '#f59e0b55' }} />
              </div>
              {['Dashboard','Habits','Activities','Notes','Analytics'].map((l, i) => (
                <div key={l} style={{
                  display: 'flex', gap: 6, alignItems: 'center',
                  padding: '6px 8px', borderRadius: 7, marginBottom: 3,
                  background: i === 0 ? 'rgba(245,158,11,0.1)' : 'transparent',
                  borderLeft: i === 0 ? '2px solid #f59e0b' : '2px solid transparent',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: i === 0 ? '#f59e0b' : '#2a2a3a' }} />
                  <div style={{ height: 6, width: [52,40,48,30,44][i], borderRadius: 3, background: i === 0 ? '#f59e0b66' : '#2a2a3a' }} />
                </div>
              ))}
            </div>
            {/* Content mockup */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                {[['🔥','12 Day Streak','#f59e0b'],['⚡','84% Score','#6366f1'],['✓','4/6 Done','#10b981']].map(([icon,label,c]) => (
                  <div key={label} style={{ flex: 1, minWidth: 80, padding: '10px 12px', borderRadius: 12, background: `${c}0f`, border: `1px solid ${c}28` }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: '#333', marginBottom: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>Weekly</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 48 }}>
                  {[0.7,0.45,0.9,0.8,1,0.35,0.6].map((v,i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${v*100}%`, background: i===4 ? '#f59e0b' : '#ffffff0d' }} />
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, color: '#333', marginBottom: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>Heatmap</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({length:20}).map((_,w) => (
                    <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {Array.from({length:7}).map((_,d) => {
                        const v = Math.random()
                        return <div key={d} style={{ width:8,height:8,borderRadius:2, background: v>.7?'#f59e0b':v>.5?'#b45309':v>.3?'#78350f':'#1a1a2e' }} />
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: '#f59e0b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Everything you need</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 3, color: '#fff' }}>BUILT FOR BUILDERS</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 14 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '22px 20px', borderRadius: 16, transition: 'all .2s',
                background: hovered===i ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${hovered===i ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.06)'}`,
                transform: hovered===i ? 'translateY(-3px)' : 'none',
              }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e0e0e8', marginBottom: 7 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: '#444', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 3, color: '#fff' }}>WHAT PEOPLE SAY</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="ms-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 16, color: '#f59e0b', marginBottom: 10 }}>★★★★★</div>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#444' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px 100px' }}>
        <div className="ms-card" style={{ maxWidth: 560, margin: '0 auto', padding: '52px 40px' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔥</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 3, color: '#fff', marginBottom: 10 }}>
            START YOUR STREAK
          </h2>
          <p style={{ fontSize: 13, color: '#444', marginBottom: 26, lineHeight: 1.7 }}>
            Free forever. No credit card. Your data stays yours.
          </p>
          <Link to="/signup">
            <button style={{
              background: 'linear-gradient(135deg,#b45309,#f59e0b)',
              border: 'none', borderRadius: 14, color: '#0e0a00',
              fontSize: 15, fontWeight: 800, padding: '15px 36px',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 0 36px rgba(245,158,11,0.3)',
            }}>Create Free Account →</button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '22px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Logo />
        <div style={{ fontSize: 12, color: '#2a2a3a' }}>Built with Flask · MongoDB · React · ❤️</div>
      </footer>
    </div>
  )
}