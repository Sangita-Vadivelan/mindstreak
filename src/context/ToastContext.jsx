// src/context/ToastContext.jsx
// Global toast notification system.
// Wrap <App> with <ToastProvider> in main.jsx, then use useToast() anywhere.

import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg)  => addToast(msg, 'success'),
    error:   (msg)  => addToast(msg, 'error'),
    info:    (msg)  => addToast(msg, 'info'),
    warning: (msg)  => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ── Toast Container (rendered at root level) ───────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

const TOAST_STYLES = {
  success: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#34d399', icon: '✓' },
  error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#f87171', icon: '✕' },
  info:    { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  color: '#818cf8', icon: 'ℹ' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24', icon: '⚠' },
}

function Toast({ toast, onRemove }) {
  const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info

  return (
    <div
      style={{
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 12,
        background: 'rgba(10,10,18,0.95)',
        border: `1px solid ${s.border}`,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 260,
        maxWidth: 380,
        animation: 'fadeUp 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={() => onRemove(toast.id)}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
        background: s.bg, border: `1px solid ${s.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 900, color: s.color,
      }}>{s.icon}</div>
      <span style={{ fontSize: 13, color: '#e0e0e8', flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <span style={{ fontSize: 16, color: '#333', flexShrink: 0 }}>×</span>
    </div>
  )
}