export default function Banner({ type = 'error', message }) {
  if (!message) return null

  const isError = type === 'error'
  return (
    <div className="fade-in" style={{
      padding: '11px 14px',
      borderRadius: 10,
      marginBottom: 16,
      fontSize: 13,
      lineHeight: 1.5,
      background: isError ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
      border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
      color: isError ? '#f87171' : '#34d399',
    }}>
      {isError ? '⚠ ' : '✓ '}{message}
    </div>
  )
}