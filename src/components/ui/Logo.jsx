export default function Logo({ size = 'md' }) {
  const big = size === 'lg'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? 12 : 8 }}>
      <div style={{
        width: big ? 42 : 30,
        height: big ? 42 : 30,
        borderRadius: big ? 14 : 10,
        background: 'linear-gradient(135deg,#b45309,#f59e0b)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: big ? 20 : 15,
        boxShadow: '0 0 18px rgba(245,158,11,0.3)',
        flexShrink: 0,
      }}>🔥</div>
      <div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: big ? 24 : 17,
          letterSpacing: big ? 3 : 2.5,
          background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>MINDSTREAK</div>
        {big && (
          <div style={{ fontSize: 10, color: '#333', letterSpacing: 2, textTransform: 'uppercase' }}>
            Productivity OS
          </div>
        )}
      </div>
    </div>
  )
}