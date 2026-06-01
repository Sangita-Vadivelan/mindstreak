export default function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div
      className={`ms-card ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        transition: onClick ? 'border-color .2s, transform .15s' : undefined,
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      } : undefined}
    >
      {children}
    </div>
  )
}