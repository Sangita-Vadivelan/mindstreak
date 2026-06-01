// src/components/ui/UndoToast.jsx
// Shows a bottom-left undo bar after deletion.
// Usage in a page:
//
//   const [undoItem, setUndoItem] = useState(null)
//
//   const handleDelete = async (id) => {
//     const item = habits.find(h => h.id === id)
//     await deleteHabit(id)
//     setUndoItem(item)
//   }
//
//   const handleUndo = async () => {
//     await addHabit(undoItem)
//     setUndoItem(null)
//   }
//
//   <UndoToast
//     item={undoItem}
//     label="Habit"
//     onUndo={handleUndo}
//     onExpire={() => setUndoItem(null)}
//   />

import { useEffect, useState } from 'react'

export default function UndoToast({ item, label = 'Item', onUndo, onExpire, duration = 5000 }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!item) return

    setProgress(100)
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining === 0) clearInterval(interval)
    }, 50)

    const timeout = setTimeout(() => {
      onExpire?.()
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [item])

  if (!item) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: 28,
      zIndex: 9998,
      background: 'rgba(10,10,18,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minWidth: 280,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(16px)',
      animation: 'fadeUp 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontSize: 13, color: '#ccc' }}>
          🗑 <span style={{ color: '#888' }}>{label}</span> deleted
        </span>
        <button
          onClick={onUndo}
          style={{
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 8,
            color: '#f59e0b',
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 14px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0,
          }}
        >
          Undo
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          borderRadius: 3,
          background: 'linear-gradient(90deg,#b45309,#f59e0b)',
          transition: 'width 0.05s linear',
        }} />
      </div>
    </div>
  )
}