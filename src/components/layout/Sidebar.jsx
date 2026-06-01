// src/components/layout/Sidebar.jsx
// CHANGE: Replaced the plain logout button + user chip with <ProfileDropdown />
// which gives Profile / Settings / Logout menu on click.

import { NavLink } from 'react-router-dom'
import ProfileDropdown from '../ui/ProfileDropdown'

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '⬡' },
  { path: '/habits',     label: 'Habits',     icon: '🔥' },
  { path: '/activities', label: 'Activities', icon: '✓'  },
  { path: '/notes',      label: 'Notes',      icon: '◈'  },
  { path: '/analytics',  label: 'Analytics',  icon: '◎'  },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 210,
      background: '#05050d',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      flexShrink: 0,
    }}>

      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div style={{ paddingLeft: 8, marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg,#b45309,#f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 0 16px rgba(245,158,11,0.3)', flexShrink: 0,
          }}>🔥</div>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18, letterSpacing: 2.5,
              background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>MINDSTREAK</div>
            <div style={{ fontSize: 9, color: '#333', letterSpacing: 2, textTransform: 'uppercase' }}>
              Productivity OS
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, color: '#2a2a3a', letterSpacing: 2, textTransform: 'uppercase', paddingLeft: 12, marginBottom: 8 }}>
          Menu
        </div>

        {NAV_ITEMS.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 10,
              textDecoration: 'none',
              background: isActive ? 'rgba(245,158,11,0.10)' : 'transparent',
              color: isActive ? '#f59e0b' : '#444',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'all .15s',
              fontFamily: "'DM Sans', sans-serif",
            })}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />

      {/* ── Profile dropdown (replaces old logout button + user chip) ──────── */}
      {/* CHANGED: This used to be a plain logout button + static user chip.
          Now it's a dropdown with Profile / Settings / Logout options. */}
      <ProfileDropdown />
    </aside>
  )
}