// src/pages/HabitsPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useHabits } from '../hooks'
import { useToast }  from '../context/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import UndoToast     from '../components/ui/UndoToast'
import Spinner       from '../components/ui/Spinner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PRESET_CATEGORIES = ['Fitness', 'Study', 'Coding', 'Reading', 'Meditation', 'Health', 'Other']
const ICONS = ['⚡', '🏃', '📖', '🧘', '🎯', '💪', '🎨', '🌙', '💧', '🧠', '💻', '📝']
const PRESET_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#ef4444']
const CATEGORY_COLORS = {
  Fitness: '#10b981', Study: '#6366f1', Coding: '#f59e0b',
  Reading: '#ec4899', Meditation: '#8b5cf6', Health: '#14b8a6', Other: '#64748b',
}
const HABIT_NAME_MAX = 100

const EMPTY_FORM = {
  title: '', category: '', customCategory: '',
  icon: '⚡', color: '#f59e0b', target_days: 30,
}

// Always returns a valid color string — never undefined/null
function resolveColor(color) {
  if (!color || typeof color !== 'string' || !color.trim()) return '#f59e0b'
  return color.trim()
}

export default function HabitsPage() {
  const { habits, loading, addHabit, deleteHabit, toggleHabit } = useHabits()
  const toast = useToast()

  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState('')
  const [search,    setSearch]    = useState('')

  // ── Confirm delete state ─────────────────────────────────────────────────────
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null) // full habit object

  // ── Undo state ───────────────────────────────────────────────────────────────
  const [undoHabit, setUndoHabit] = useState(null)

  // ── Autofocus habit name when form opens ─────────────────────────────────────
  const titleRef = useRef(null)
  useEffect(() => {
    if (showForm) setTimeout(() => titleRef.current?.focus(), 60)
  }, [showForm])

  const isCustom      = form.category === '__custom__'
  const finalCategory = isCustom ? form.customCategory.trim() : form.category

  // ── Filter habits by search ───────────────────────────────────────────────────
  const filtered = habits.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.category.toLowerCase().includes(search.toLowerCase())
  )

  // ── Add habit ─────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    setFormError('')
    const title = form.title.trim()

    if (!title)         { setFormError('Habit name is required.'); return }
    if (title.length > HABIT_NAME_MAX) { setFormError(`Name must be under ${HABIT_NAME_MAX} characters.`); return }
    if (!finalCategory) { setFormError('Please select or enter a category.'); return }
    if (!form.target_days || Number(form.target_days) < 1) { setFormError('Target days must be at least 1.'); return }

    // Frontend duplicate check (backend also checks)
    const dup = habits.find(h => h.title.toLowerCase() === title.toLowerCase())
    if (dup) { setFormError('A habit with this name already exists.'); return }

    setSaving(true)
    try {
      await addHabit({
        title,
        category:    finalCategory,
        icon:        form.icon,
        color:       resolveColor(form.color), // always send valid color
        target_days: Number(form.target_days),
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Habit created ✓')
    } catch (e) {
      const msg = e.response?.data?.error || ''
      if (msg.toLowerCase().includes('already exists')) {
        setFormError('A habit with this name already exists.')
      } else {
        setFormError(msg || 'Failed to create habit.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Step 1: user clicks delete → show confirm dialog ─────────────────────────
  const requestDelete = (habit) => {
    setPendingDelete(habit)
    setConfirmOpen(true)
  }

  // ── Step 2: user confirms → delete + show undo toast ─────────────────────────
  const confirmDelete = async () => {
    setConfirmOpen(false)
    const habit = pendingDelete
    setPendingDelete(null)
    try {
      await deleteHabit(habit.id)
      setUndoHabit(habit)          // store for undo
      toast.info(`"${habit.title}" deleted`)
    } catch {
      toast.error('Failed to delete habit.')
    }
  }

  // ── Step 3 (optional): user clicks Undo → recreate habit ─────────────────────
  const handleUndo = async () => {
    const h = undoHabit
    setUndoHabit(null)
    try {
      await addHabit({
        title:       h.title,
        category:    h.category,
        icon:        h.icon,
        color:       resolveColor(h.color),
        target_days: h.target_days,
      })
      toast.success(`"${h.title}" restored ✓`)
    } catch {
      toast.error('Could not restore habit.')
    }
  }

  // ── Toggle completion ─────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    const habit = habits.find(h => h.id === id)
    const wasDone = habit?.done_today
    await toggleHabit(id)
    if (!wasDone) toast.success(`${habit?.title || 'Habit'} completed for today 🎉`)
  }

  const handleCategoryChange = (val) => {
    setForm(f => ({
      ...f,
      category: val,
      // Auto-pick color for known categories; keep custom color otherwise
      color: val !== '__custom__' ? (CATEGORY_COLORS[val] || f.color) : f.color,
    }))
  }

  // Pie chart data from real habits
  const pieData = Object.entries(
    habits.reduce((acc, h) => { acc[h.category] = (acc[h.category] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#64748b' }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header card ────────────────────────────────────────────────────── */}
      <div className="ms-card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: showForm ? 16 : 0 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#333', fontSize: 15, pointerEvents: 'none' }}>⌕</span>
            <input className="ms-input" style={{ paddingLeft: 34 }} placeholder="Search habits..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: 12, color: '#444', whiteSpace: 'nowrap' }}>
            {habits.length} habit{habits.length !== 1 ? 's' : ''} · {habits.filter(h => h.done_today).length} done today
          </div>
          <button className="ms-btn-primary" style={{ width: 'auto', padding: '9px 18px' }}
            onClick={() => { setShowForm(!showForm); setFormError('') }}>
            {showForm ? '✕ Cancel' : '+ New Habit'}
          </button>
        </div>

        {/* ── Add form ───────────────────────────────────────────────────── */}
        {showForm && (
          <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: 20 }}>
            {formError && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                ⚠ {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* Title */}
              <div style={{ gridColumn: '1 / 3' }}>
                <label className="ms-label">
                  Habit Name * <span style={{ color: '#333', fontWeight: 400 }}>({form.title.length}/{HABIT_NAME_MAX})</span>
                </label>
                <input ref={titleRef} className="ms-input" type="text"
                  placeholder="e.g. Daily LeetCode, Morning Run, Read 30 Pages"
                  maxLength={HABIT_NAME_MAX}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>

              {/* Category */}
              <div>
                <label className="ms-label">Category *</label>
                <select className="ms-input" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="">-- Select --</option>
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ Custom category...</option>
                </select>
              </div>

              {/* Custom category OR target days */}
              {isCustom ? (
                <div>
                  <label className="ms-label">Custom Category *</label>
                  <input className="ms-input" type="text" autoFocus
                    placeholder="e.g. DSA, Gym, AI Research"
                    value={form.customCategory}
                    onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <label className="ms-label">Target Days *</label>
                  <input className="ms-input" type="number" min={1} max={3650}
                    placeholder="e.g. 7, 21, 30, 66, 100, 365"
                    value={form.target_days}
                    onChange={e => setForm(f => ({ ...f, target_days: e.target.value }))}
                  />
                </div>
              )}

              {/* Target days when custom category shown */}
              {isCustom && (
                <div>
                  <label className="ms-label">Target Days *</label>
                  <input className="ms-input" type="number" min={1} max={3650}
                    placeholder="e.g. 7, 21, 30, 66, 100, 365"
                    value={form.target_days}
                    onChange={e => setForm(f => ({ ...f, target_days: e.target.value }))}
                  />
                </div>
              )}

              {/* Icon picker */}
              <div style={{ gridColumn: '1 / 3' }}>
                <label className="ms-label">Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{ fontSize: 20, width: 40, height: 40, borderRadius: 10, cursor: 'pointer', background: form.icon === ic ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.icon === ic ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker — preset + custom input */}
              <div style={{ gridColumn: '1 / 3' }}>
                <label className="ms-label">
                  Color <span style={{ color: '#555', fontWeight: 400 }}>— selected: </span>
                  <span style={{ color: resolveColor(form.color), fontWeight: 700 }}>{resolveColor(form.color)}</span>
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: c, cursor: 'pointer',
                        border: resolveColor(form.color) === c ? '3px solid #fff' : '2px solid transparent',
                        boxShadow: resolveColor(form.color) === c ? `0 0 0 2px ${c}` : 'none',
                        transition: 'all .15s',
                      }} />
                  ))}

                  {/* Custom color via native picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="color"
                      value={resolveColor(form.color)}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'none', padding: 0 }}
                      title="Pick a custom color"
                    />
                    <span style={{ fontSize: 11, color: '#444' }}>custom</span>
                  </div>

                  {/* Live preview of selected color */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${resolveColor(form.color)}22`,
                    border: `2px solid ${resolveColor(form.color)}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>{form.icon}</div>
                </div>
              </div>
            </div>

            <button className="ms-btn-primary" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleAdd} disabled={saving}>
              {saving ? <><Spinner />Saving...</> : 'Add Habit'}
            </button>
          </div>
        )}
      </div>

      {/* ── Habit grid ─────────────────────────────────────────────────────── */}
      <div className="ms-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#333' }}>Loading habits...</div>
        ) : habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔥</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#555', marginBottom: 6 }}>No habits yet</div>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 20 }}>Create your first habit and start building your streak</div>
            <button className="ms-btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setShowForm(true)}>
              + Create First Habit
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#333', fontSize: 13 }}>
            No habits match "{search}"
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filtered.map(h => (
              <HabitCard
                key={h.id}
                h={h}
                onToggle={handleToggle}
                onDelete={() => requestDelete(h)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      {habits.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ms-card">
            <div className="ms-section-title">Category Distribution</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
          <div className="ms-card">
            <div className="ms-section-title">Streak Leaderboard</div>
            {[...habits].sort((a, b) => b.streak - a.streak).map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #ffffff07' }}>
                <span style={{ fontSize: 12, color: i === 0 ? '#f59e0b' : '#333', fontWeight: 700, width: 20 }}>#{i + 1}</span>
                <span style={{ fontSize: 17 }}>{h.icon || '⚡'}</span>
                <span style={{ fontSize: 13, color: '#bbb', flex: 1 }}>{h.title}</span>
                <span style={{ fontSize: 11, color: '#555' }}>{h.category}</span>
                <span style={{ fontSize: 12, color: resolveColor(h.color), fontFamily: 'monospace' }}>🔥 {h.streak}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Confirm dialog ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Habit?"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? Your streak history will also be removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
        danger
      />

      {/* ── Undo toast ─────────────────────────────────────────────────────── */}
      <UndoToast
        item={undoHabit}
        label="Habit"
        onUndo={handleUndo}
        onExpire={() => setUndoHabit(null)}
      />
    </div>
  )
}

// ── Habit Card — color always from h.color (API) ───────────────────────────────
function HabitCard({ h, onToggle, onDelete }) {
  const c   = resolveColor(h.color)   // never undefined
  const pct = h.target_days > 0
    ? Math.min(100, Math.round((h.streak / h.target_days) * 100))
    : 0

  return (
    <div style={{
      background: h.done_today ? `${c}12` : 'rgba(255,255,255,0.025)',
      border: `1px solid ${h.done_today ? `${c}40` : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 14, padding: 16, transition: 'all .2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
          {/* Icon box uses saved color */}
          <div style={{
            width: 40, height: 40, borderRadius: 12, fontSize: 20, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${c}20`,
            border: `1px solid ${c}33`,
          }}>{h.icon || '⚡'}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: h.done_today ? '#fff' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {h.title}
            </div>
            <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
              {h.category} · {h.target_days}d goal
            </div>
          </div>
        </div>
        <button onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a3a', fontSize: 14, padding: '2px 4px', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a2a3a'}>✕</button>
      </div>

      {/* Progress bar uses saved color */}
      <div style={{ height: 4, borderRadius: 4, background: '#ffffff0d', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${c}88, ${c})`,
          transition: 'width .4s',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#444' }}>{pct}% · 🔥 {h.streak} day streak</span>
        <button onClick={() => onToggle(h.id)} style={{
          fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20,
          background: h.done_today ? `${c}22` : 'transparent',
          border: `1px solid ${h.done_today ? c : '#333'}`,
          color: h.done_today ? c : '#555',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .2s',
        }}>
          {h.done_today ? '✓ Done' : 'Mark Done'}
        </button>
      </div>
    </div>
  )
}