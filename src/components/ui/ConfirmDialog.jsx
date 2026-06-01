// src/components/ui/ConfirmDialog.jsx
// Reusable confirmation modal.
// Usage:
//   <ConfirmDialog
//     open={showConfirm}
//     title="Delete Habit?"
//     message="Are you sure you want to delete this habit? This cannot be undone."
//     confirmLabel="Delete"
//     onConfirm={handleDelete}
//     onCancel={() => setShowConfirm(false)}
//     danger
//   />

export default function ConfirmDialog({
  open,
  title      = 'Are you sure?',
  message    = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        background: '#0e0e1a',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 18,
        padding: '28px 28px 24px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.2s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, marginBottom: 16,
          background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {danger ? '🗑' : '⚠️'}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 11, color: '#888',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#ccc' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#888' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px',
              background: danger ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#b45309,#f59e0b)',
              border: `1px solid ${danger ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
              borderRadius: 11,
              color: danger ? '#f87171' : '#0e0a00',
              fontSize: 13, fontWeight: 800,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}