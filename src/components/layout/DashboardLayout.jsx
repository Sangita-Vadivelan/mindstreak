import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#07070f' }}>
      {/* Left sidebar */}
      <Sidebar />

      {/* Right content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '28px 32px',
          position: 'relative',
        }}>
          {/* Ambient glow behind content */}
          <div style={{
            position: 'fixed',
            top: '15%', left: '40%',
            width: 500, height: 400,
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}