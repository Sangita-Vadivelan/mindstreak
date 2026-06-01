import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAnalytics } from '../../hooks'
import { useState } from 'react'

const PAGE_META = {
  '/dashboard':  { title: 'Dashboard',  sub: 'Your daily command center' },
  '/habits':     { title: 'Habits',     sub: 'Track & build consistency' },
  '/activities': { title: 'Activities', sub: "Today's task list" },
  '/notes':      { title: 'Notes',      sub: 'Your second brain' },
  '/analytics':  { title: 'Analytics',  sub: 'Patterns & performance' },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { summary } = useAnalytics()
  const meta = PAGE_META[pathname] || { title: 'MindStreak', sub: '' }
  const [search, setSearch] = useState('')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  // Streak comes from analytics summary — 0 for new users
  const streak = summary?.current_streak ?? 0

  return (
    <header style={{
      height: 64,
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(5,5,13,0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      gap: 20,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, letterSpacing: 2, color: '#e0e0e8', lineHeight: 1,
        }}>{meta.title}</div>
        <div style={{ fontSize: 11, color: '#333', marginTop: 1 }}>{meta.sub}</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: '#333', fontSize: 14, pointerEvents: 'none',
        }}>⌕</span>
        <input
          className="ms-input"
          style={{ width: 220, paddingLeft: 34, paddingTop: 9, paddingBottom: 9 }}
          placeholder="Search anything..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Date */}
      <div style={{ fontSize: 12, color: '#333', whiteSpace: 'nowrap' }}>{today}</div>

      {/* Streak badge — live from API */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: streak > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${streak > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 20, padding: '5px 12px',
      }}>
        <span style={{ fontSize: 14 }}>{streak > 0 ? '🔥' : '○'}</span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: streak > 0 ? '#f59e0b' : '#333',
          fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1,
        }}>
          {streak} {streak === 1 ? 'DAY' : 'DAYS'}
        </span>
      </div>

      {/* Greeting */}
      <div style={{ fontSize: 12, color: '#444', whiteSpace: 'nowrap' }}>
        {greeting()}, <span style={{ color: '#888' }}>{user?.name?.split(' ')[0] || 'there'}</span>
      </div>
    </header>
  )
}