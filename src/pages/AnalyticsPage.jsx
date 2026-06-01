// src/pages/AnalyticsPage.jsx
import { useAnalytics } from '../hooks'
import Card from '../components/ui/Card'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const heatColor = v => {
  if (v === 0) return '#1a1a2e'
  if (v === 1) return '#78350f'
  if (v === 2) return '#b45309'
  if (v === 3) return '#d97706'
  return '#f59e0b'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#ccc' }}>
      <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i}>{p.name}: <span style={{ color: p.color || '#fff' }}>{p.value}</span></div>
      ))}
    </div>
  )
}

// ── Empty state for charts ─────────────────────────────────────────────────────
function ChartEmpty({ icon = '📊', message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
      <span style={{ fontSize: 28, opacity: 0.3 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#333', textAlign: 'center' }}>{message}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const { weekly, heatmap, insights, summary, loading } = useAnalytics()

  const hasWeeklyData  = weekly.some(d => d.score > 0)
  const hasHeatmap     = heatmap.some(week => week.some(c => (typeof c === 'object' ? c.level : c) > 0))
  const hasInsights    = insights.length > 0

  const bestDay   = weekly.length ? weekly.reduce((a, b) => b.score > a.score ? b : a, weekly[0]) : null
  const avgScore  = weekly.length ? Math.round(weekly.reduce((s, d) => s + d.score, 0) / weekly.length) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { icon: '📊', label: 'Today Score',    value: loading ? '...' : `${summary?.productivity_score ?? 0}%`,  color: '#6366f1' },
          { icon: '🔥', label: 'Current Streak', value: loading ? '...' : `${summary?.current_streak ?? 0}d`,      color: '#f59e0b' },
          { icon: '⭐', label: 'Best Day',        value: loading ? '...' : (bestDay?.day || '--'),                  color: '#10b981' },
          { icon: '📈', label: 'Weekly Average',  value: loading ? '...' : `${avgScore}%`,                         color: '#ec4899' },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: 'center', padding: '18px 12px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Bebas Neue', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1.5 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Line chart */}
        <Card>
          <div className="ms-section-title">Productivity Score — This Week</div>
          {loading ? (
            <ChartEmpty message="Loading..." />
          ) : !hasWeeklyData ? (
            <ChartEmpty icon="📉" message="Complete habits and tasks to see your weekly score chart" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weekly}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bar chart */}
        <Card>
          <div className="ms-section-title">Habits vs Tasks Completed</div>
          {loading ? (
            <ChartEmpty message="Loading..." />
          ) : !hasWeeklyData ? (
            <ChartEmpty icon="📊" message="Log habits and tasks daily to see comparison charts" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly} barGap={2}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="habits" fill="#f59e0b88" radius={[4, 4, 0, 0]} maxBarSize={14} name="Habits" />
                <Bar dataKey="tasks"  fill="#6366f188" radius={[4, 4, 0, 0]} maxBarSize={14} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Heatmap ────────────────────────────────────────────────────────── */}
      <Card>
        <div className="ms-section-title">Full Habit Heatmap</div>
        {loading ? (
          <div style={{ fontSize: 12, color: '#333' }}>Loading heatmap...</div>
        ) : !hasHeatmap ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>🟫</div>
            <div style={{ fontSize: 12, color: '#333' }}>Complete habits daily to build your contribution graph</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
              {heatmap.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {week.map((cell, di) => {
                    const level = typeof cell === 'object' ? cell.level : cell
                    const count = typeof cell === 'object' ? cell.count : 0
                    const d     = typeof cell === 'object' ? cell.date  : ''
                    return (
                      <div key={di}
                        title={`${count} habit${count !== 1 ? 's' : ''}${d ? ` on ${d}` : ''}`}
                        style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(level) }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 10, color: '#333' }}>Less</span>
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(v) }} />
              ))}
              <span style={{ fontSize: 10, color: '#333' }}>More</span>
            </div>
          </>
        )}
      </Card>

      {/* ── Insights ───────────────────────────────────────────────────────── */}
      <Card>
        <div className="ms-section-title">Smart Insights</div>
        {loading ? (
          <div style={{ fontSize: 12, color: '#333' }}>Analyzing your patterns...</div>
        ) : !hasInsights ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>💡</div>
            <div style={{ fontSize: 12, color: '#333' }}>
              Keep logging habits for 7+ days to unlock personalized insights
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: 12,
                background: ins.type === 'success' ? '#10b98110' : ins.type === 'warning' ? '#f59e0b0d' : '#6366f10d',
                border: `1px solid ${ins.type === 'success' ? '#10b98120' : ins.type === 'warning' ? '#f59e0b20' : '#6366f120'}`,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
                <span style={{ fontSize: 12.5, color: '#666', lineHeight: 1.6 }}>{ins.text}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  )
}