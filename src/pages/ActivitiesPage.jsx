// src/pages/ActivitiesPage.jsx
import { useState, useRef } from 'react'
import { useActivities } from '../hooks'
import { useToast }      from '../context/ToastContext'
import ConfirmDialog     from '../components/ui/ConfirmDialog'
import UndoToast         from '../components/ui/UndoToast'
import Spinner           from '../components/ui/Spinner'

export default function ActivitiesPage() {
  const today = new Date().toISOString().slice(0, 10)
  const { activities, loading, addActivity, deleteActivity, toggleActivity } = useActivities(today)
  const toast = useToast()

  const [newTitle, setNewTitle] = useState('')
  const [adding,   setAdding]   = useState(false)
  const [search,   setSearch]   = useState('')

  // ── Confirm delete state ─────────────────────────────────────────────────────
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null) // full activity object

  // ── Undo state ───────────────────────────────────────────────────────────────
  const [undoActivity, setUndoActivity] = useState(null)

  const inputRef = useRef(null)

  const done  = activities.filter(a => a.done).length
  const total = activities.length
  const pct   = total ? Math.round((done / total) * 100) : 0

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  // ── Add task ─────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const title = newTitle.trim()
    if (!title) return

    // Duplicate check
    const exists = activities.find(a => a.title.toLowerCase() === title.toLowerCase())
    if (exists) { toast.warning('This task already exists today.'); return }

    setAdding(true)
    try {
      await addActivity(title)
      setNewTitle('')
      toast.success('Task added ✓')
      inputRef.current?.focus()
    } catch {
      toast.error('Failed to add task.')
    } finally {
      setAdding(false)
    }
  }

  // ── Toggle completion ─────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    const act = activities.find(a => a.id === id)
    const wasDone = act?.done
    await toggleActivity(id)
    if (!wasDone) toast.success(`"${act?.title}" completed ✓`)
  }

  // ── Step 1: click delete → show confirm dialog ────────────────────────────────
  const requestDelete = (activity) => {
    setPendingDelete(activity)
    setConfirmOpen(true)
  }

  // ── Step 2: user confirms → delete + show undo toast ─────────────────────────
  const confirmDelete = async () => {
    setConfirmOpen(false)
    const act = pendingDelete
    setPendingDelete(null)
    try {
      await deleteActivity(act.id)
      setUndoActivity(act)
      toast.info(`"${act.title}" deleted`)
    } catch {
      toast.error('Failed to delete task.')
    }
  }

  // ── Step 3 (optional): user clicks Undo → recreate task ──────────────────────
  const handleUndo = async () => {
    const act = undoActivity
    setUndoActivity(null)
    try {
      await addActivity(act.title)
      toast.success(`"${act.title}" restored ✓`)
    } catch {
      toast.error('Could not restore task.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Progress header ─────────────────────────────────────────────────── */}
      <div className="ms-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div className="ms-section-title" style={{ margin: 0, marginBottom: 4 }}>Today's Activities</div>
            <div style={{ fontSize: 12, color: '#444' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48, lineHeight: 1,
            color: pct === 100 ? '#10b981' : '#f59e0b',
          }}>{pct}%</div>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: '#ffffff07', marginBottom: 6 }}>
          <div style={{
            height: '100%', borderRadius: 6, transition: 'width .5s',
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg,#059669,#10b981)'
              : 'linear-gradient(90deg,#b45309,#f59e0b)',
          }} />
        </div>
        <div style={{ fontSize: 11, color: '#444' }}>{done} of {total} tasks complete</div>
      </div>

      {/* ── Add task ────────────────────────────────────────────────────────── */}
      <div className="ms-card">
        <div className="ms-section-title">Add Task</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            ref={inputRef}
            className="ms-input"
            placeholder="What do you need to do today?"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1 }}
          />
          <button
            className="ms-btn-primary"
            style={{ width: 'auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
          >
            {adding ? <Spinner /> : '+ Add'}
          </button>
        </div>
      </div>

      {/* ── Task list ────────────────────────────────────────────────────────── */}
      <div className="ms-card">

        {/* Search — only show if there are enough tasks */}
        {activities.length > 3 && (
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#333', fontSize: 15, pointerEvents: 'none' }}>⌕</span>
            <input
              className="ms-input"
              style={{ paddingLeft: 34 }}
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        <div className="ms-section-title">Tasks ({total})</div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#333' }}>Loading tasks...</div>

        /* Empty state */
        ) : total === 0 ? (
          <div style={{ textAlign: 'center', padding: 52 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#555', marginBottom: 6 }}>No activities yet</div>
            <div style={{ fontSize: 13, color: '#333' }}>Add your first task above to get started</div>
          </div>

        /* No search results */
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#333', fontSize: 13 }}>
            No tasks match "{search}"
          </div>

        /* Task rows — incomplete first */
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...filtered].sort((a, b) => a.done - b.done).map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: a.done ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${a.done ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all .2s',
              }}>
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(a.id)}
                  style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    border: `2px solid ${a.done ? '#f59e0b' : '#333'}`,
                    background: a.done ? '#f59e0b' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#111', fontWeight: 900,
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                >{a.done ? '✓' : ''}</button>

                {/* Title */}
                <span style={{
                  flex: 1, fontSize: 13.5,
                  color: a.done ? '#444' : '#ccc',
                  textDecoration: a.done ? 'line-through' : 'none',
                  transition: 'all .2s',
                }}>
                  {a.title}
                </span>

                {/* Delete button — triggers confirm dialog */}
                <button
                  onClick={() => requestDelete(a)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a3a', fontSize: 14, padding: 2, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#2a2a3a'}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm dialog ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Task?"
        message={`Are you sure you want to delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
        danger
      />

      {/* ── Undo toast ─────────────────────────────────────────────────────── */}
      <UndoToast
        item={undoActivity}
        label="Task"
        onUndo={handleUndo}
        onExpire={() => setUndoActivity(null)}
      />
    </div>
  )
}