import { useHabits }     from '../hooks'
import { useActivities } from '../hooks'
import { useAnalytics }  from '../hooks'
import { useAuth }       from '../context/AuthContext'
import Card from '../components/ui/Card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
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

export default function DashboardPage() {
  const { user }                               = useAuth()
  const { habits, toggleHabit }               = useHabits()
  const { activities, toggleActivity }        = useActivities()
  const { weekly, heatmap, insights, summary } = useAnalytics()

  const today      = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const firstName  = user?.name?.split(' ')[0] || 'there'

  const doneHabits  = habits.filter(h => h.done_today).length
  const doneTasks   = activities.filter(a => a.done).length
  const score       = summary?.productivity_score ?? 0
  const streak      = summary?.current_streak ?? 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

      {/* ── Welcome bar ────────────────────────────────────────────────────── */}
      <Card style={{ gridColumn: '1 / 4', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{today}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1.5, color: '#fff' }}>
            Welcome back, {firstName}
          </div>
        </div>

        {/* Streak — 0 for new users */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: streak > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${streak > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 12, padding: '10px 18px',
        }}>
          <span style={{ fontSize: 26, filter: streak > 0 ? 'drop-shadow(0 0 8px #f59e0b)' : 'none' }}>
            {streak > 0 ? '🔥' : '○'}
          </span>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: streak > 0 ? '#f59e0b' : '#333', fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>
              {streak}
            </div>
            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1.5 }}>Day Streak</div>
          </div>
        </div>

        <StatBadge value={`${score}%`}              label="Score Today"  color="#6366f1" />
        <StatBadge value={`${doneHabits}/${habits.length}`} label="Habits Done"  color="#10b981" />
        <StatBadge value={`${doneTasks}/${activities.length}`} label="Tasks Done" color="#f59e0b" />
      </Card>

      {/* ── Weekly chart ───────────────────────────────────────────────────── */}
      <Card style={{ gridColumn: '1 / 3' }}>
        <div className="ms-section-title">Weekly Performance</div>
        {weekly.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#333', fontSize: 13 }}>
            Complete habits and tasks to see your weekly chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekly} barGap={4}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={28} name="Score">
                {weekly.map((e, i) => (
                  <Cell key={i} fill={e.date === new Date().toISOString().slice(0, 10) ? '#f59e0b' : '#ffffff10'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Smart Insights ─────────────────────────────────────────────────── */}
      <Card>
        <div className="ms-section-title">Smart Insights</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.length === 0 ? (
            <div style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>
              Log habits for a few days to unlock personalized insights 💡
            </div>
          ) : insights.map((ins, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              padding: '8px 10px', borderRadius: 10,
              background: ins.type === 'success' ? '#10b98110' : ins.type === 'warning' ? '#f59e0b0d' : '#6366f10d',
              border: `1px solid ${ins.type === 'success' ? '#10b98120' : ins.type === 'warning' ? '#f59e0b20' : '#6366f120'}`,
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{ins.icon}</span>
              <span style={{ fontSize: 11.5, color: '#666', lineHeight: 1.5 }}>{ins.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Habits preview ─────────────────────────────────────────────────── */}
      <Card style={{ gridColumn: '1 / 3' }}>
        <div className="ms-section-title">Today's Habits</div>
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#333', fontSize: 13 }}>
            No habits yet — go to Habits page to add your first one 🔥
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.slice(0, 5).map(h => (
              <HabitRow key={h.id} h={h} onToggle={toggleHabit} />
            ))}
            {habits.length > 5 && (
              <div style={{ fontSize: 11, color: '#444', textAlign: 'center', paddingTop: 4 }}>
                +{habits.length - 5} more habits — view all in Habits page
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Activities preview ─────────────────────────────────────────────── */}
      <Card>
        <div className="ms-section-title">Today's Tasks</div>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#333', fontSize: 13 }}>
            No tasks yet — go to Activities to add some 🎯
          </div>
        ) : (
          <>
            <div>
              {activities.slice(0, 6).map(a => (
                <ActivityRow key={a.id} a={a} onToggle={toggleActivity} />
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: '#444', marginBottom: 5 }}>
                {doneTasks}/{activities.length} completed
              </div>
              <div style={{ height: 5, borderRadius: 5, background: '#ffffff08' }}>
                <div style={{
                  height: '100%', borderRadius: 5, transition: 'width .4s',
                  width: activities.length ? `${(doneTasks / activities.length) * 100}%` : '0%',
                  background: 'linear-gradient(90deg,#b45309,#f59e0b)',
                }} />
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ── Heatmap ────────────────────────────────────────────────────────── */}
      <Card style={{ gridColumn: '1 / 4' }}>
        <div className="ms-section-title">Contribution Heatmap</div>
        {heatmap.length === 0 ? (
          <div style={{ fontSize: 12, color: '#333' }}>Start completing habits to build your heatmap</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap', overflowX: 'auto' }}>
              {heatmap.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {week.map((cell, di) => {
                    const level = typeof cell === 'object' ? cell.level : cell
                    const count = typeof cell === 'object' ? cell.count : 0
                    const d     = typeof cell === 'object' ? cell.date  : ''
                    return (
                      <div key={di} title={`${count} habit${count !== 1 ? 's' : ''} on ${d}`}
                        style={{ width: 11, height: 11, borderRadius: 3, background: heatColor(level) }} />
                    )
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: '#333' }}>Less</span>
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} style={{ width: 11, height: 11, borderRadius: 3, background: heatColor(v) }} />
              ))}
              <span style={{ fontSize: 10, color: '#333' }}>More</span>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatBadge({ value, label, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: `${color}12`, border: `1px solid ${color}28`,
      borderRadius: 12, padding: '10px 16px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: `${color}80`, textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</div>
      </div>
    </div>
  )
}

function HabitRow({ h, onToggle }) {
  const pct = h.target_days > 0 ? Math.min(100, Math.round((h.streak / h.target_days) * 100)) : 0
  const c   = h.color || '#f59e0b'
  return (
    <div onClick={() => onToggle(h.id)} style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '11px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
      background: h.done_today ? `${c}12` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${h.done_today ? `${c}33` : 'rgba(255,255,255,0.06)'}`,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}18`, flexShrink: 0 }}>
        {h.icon || '⚡'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: h.done_today ? '#fff' : '#888' }}>{h.title}</span>
          <span style={{ fontSize: 11, color: c, fontFamily: 'monospace' }}>🔥{h.streak}d</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: '#ffffff0d', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: `linear-gradient(90deg,${c}88,${c})` }} />
        </div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${h.done_today ? c : '#333'}`,
        background: h.done_today ? c : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: '#111', fontWeight: 900, transition: 'all .2s',
      }}>{h.done_today ? '✓' : ''}</div>
    </div>
  )
}

function ActivityRow({ a, onToggle }) {
  return (
    <div onClick={() => onToggle(a.id)} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 0', borderBottom: '1px solid #ffffff07', cursor: 'pointer',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        border: `2px solid ${a.done ? '#f59e0b' : '#333'}`,
        background: a.done ? '#f59e0b' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: '#111', fontWeight: 900, transition: 'all .2s',
      }}>{a.done ? '✓' : ''}</div>
      <span style={{ fontSize: 12.5, color: a.done ? '#444' : '#bbb', textDecoration: a.done ? 'line-through' : 'none', transition: 'all .2s' }}>
        {a.title}
      </span>
    </div>
  )
}