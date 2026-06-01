export default function Spinner({ color = '#0e0a00', size = 15 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid ${color}44`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      verticalAlign: 'middle',
      marginRight: 8,
      flexShrink: 0,
    }} />
  )
}