// src/components/ui/ProfileDropdown.jsx
// Drop-in component used inside Sidebar.jsx
// Shows Profile / Settings / Logout menu when user chip is clicked.

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ProfileDropdown() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const toast            = useToast()
  const [open, setOpen]  = useState(false)
  const ref              = useRef(null)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const MENU_ITEMS = [
    {
      icon: '👤',
      label: 'Profile',
      sub: user?.email || '',
      onClick: () => { setOpen(false); toast.info('Profile page coming soon') },
    },
    {
      icon: '⚙️',
      label: 'Settings',
      sub: 'Preferences & account',
      onClick: () => { setOpen(false); toast.info('Settings page coming soon') },
    },
    { divider: true },
    {
      icon: '⎋',
      label: 'Log Out',
      sub: '',
      onClick: handleLogout,
      danger: true,
    },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* User chip — click to open */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 10px',
          background: open ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${open ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 12,
          cursor: 'pointer',
          transition: 'all .15s',
          userSelect: 'none',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#b45309,#f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#111',
        }}>{initials}</div>

        {/* Name */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 10, color: '#333' }}>Pro Plan</div>
        </div>

        {/* Chevron */}
        <span style={{ fontSize: 10, color: '#333', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▼</span>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: 0, right: 0,
          background: '#0e0e1a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '6px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          zIndex: 200,
          animation: 'fadeUp 0.15s ease',
        }}>
          {MENU_ITEMS.map((item, i) => {
            if (item.divider) {
              return <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            }
            return (
              <button
                key={i}
                onClick={item.onClick}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'transparent',
                  border: 'none', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .15s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: item.danger ? '#f87171' : '#ccc' }}>
                    {item.label}
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: 10, color: '#444', marginTop: 1, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.sub}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}