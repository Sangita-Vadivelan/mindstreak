// src/pages/NotesPage.jsx
import { useState, useRef } from 'react'
import { useNotes } from '../hooks'
import { useToast } from '../context/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import UndoToast     from '../components/ui/UndoToast'
import Spinner       from '../components/ui/Spinner'

const NOTE_TITLE_MAX   = 150
const NOTE_CONTENT_MAX = 5000

// ── Styles object (avoids repeating inline styles) ─────────────────────────────
const S = {
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#e0e0e8',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s, box-shadow .2s',
  },
  label: {
    fontSize: 11,
    color: '#444',
    display: 'block',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '2.5px',
    color: '#444',
    marginBottom: 14,
  },
}

// ── Note Form ──────────────────────────────────────────────────────────────────
function NoteForm({ initial, onSave, onCancel, saving }) {
  const [title,   setTitle]   = useState(initial?.title   || '')
  const [content, setContent] = useState(initial?.content || '')
  const [tags,    setTags]    = useState(initial?.tags?.join(', ') || '')
  const [error,   setError]   = useState('')

  const titleRef = useRef(null)

  const handleSave = () => {
    setError('')
    if (!title.trim())               { setError('Title is required.'); return }
    if (title.length > NOTE_TITLE_MAX)   { setError(`Title must be under ${NOTE_TITLE_MAX} characters.`); return }
    if (content.length > NOTE_CONTENT_MAX) { setError(`Content must be under ${NOTE_CONTENT_MAX} characters.`); return }

    onSave({
      title:   title.trim(),
      content: content.trim(),
      tags:    tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <div style={{ ...S.card, border: '1px solid rgba(245,158,11,0.2)', marginBottom: 16 }}>
      <div style={S.sectionTitle}>{initial ? 'Edit Note' : 'New Note'}</div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Title */}
        <div>
          <label style={S.label}>
            Title * <span style={{ color: '#333', fontWeight: 400 }}>({title.length}/{NOTE_TITLE_MAX})</span>
          </label>
          <input
            ref={titleRef}
            autoFocus
            style={S.input}
            type="text"
            placeholder="Note title..."
            maxLength={NOTE_TITLE_MAX}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div>
          <label style={S.label}>
            Content <span style={{ color: content.length > NOTE_CONTENT_MAX * 0.9 ? '#f59e0b' : '#333', fontWeight: 400 }}>({content.length}/{NOTE_CONTENT_MAX})</span>
          </label>
          <textarea
            style={{ ...S.input, resize: 'vertical', minHeight: 140, lineHeight: 1.65 }}
            placeholder="Write your note here..."
            maxLength={NOTE_CONTENT_MAX}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={S.label}>Tags <span style={{ color: '#333', fontWeight: 400 }}>(comma separated)</span></label>
          <input
            style={S.input}
            type="text"
            placeholder="Study, Ideas, Backend, DSA"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              flex: 1, padding: '12px',
              background: saving ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg,#b45309,#f59e0b)',
              border: 'none', borderRadius: 12,
              color: '#0e0a00', fontWeight: 800, fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {saving ? <><Spinner />{initial ? 'Updating...' : 'Saving...'}</> : initial ? 'Update Note' : 'Save Note'}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 20px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
              color: '#666', fontSize: 14, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Note Card ──────────────────────────────────────────────────────────────────
function NoteCard({ note, onPin, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: note.pinned ? 'rgba(245,158,11,0.05)' : hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${note.pinned ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16, padding: 18, transition: 'all .2s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e8', margin: 0, flex: 1 }}>
          {note.title}
        </h3>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onPin(note.id)} title={note.pinned ? 'Unpin' : 'Pin'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 3 }}>
            {note.pinned ? '📌' : '📍'}
          </button>
          <button onClick={() => onEdit(note)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#444', padding: 3 }}
            onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}>✎</button>
          <button onClick={() => onDelete(note)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#333', padding: 3 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}>✕</button>
        </div>
      </div>

      {/* Content preview */}
      {note.content && (
        <p style={{
          fontSize: 12.5, color: '#555', lineHeight: 1.65, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {note.content}
        </p>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {note.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, background: '#ffffff08', border: '1px solid #ffffff12', color: '#555' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <div style={{ fontSize: 10, color: '#2a2a3a' }}>
        {note.updated_at
          ? new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : ''}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const { notes, loading, error, query, search, addNote, updateNote, deleteNote, togglePin } = useNotes()
  const toast = useToast()

  const [showForm,  setShowForm]  = useState(false)
  const [editNote,  setEditNote]  = useState(null)
  const [saving,    setSaving]    = useState(false)

  // Confirm
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  // Undo
  const [undoNote, setUndoNote] = useState(null)

  const pinned   = notes.filter(n => n.pinned)
  const unpinned = notes.filter(n => !n.pinned)

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      if (editNote) {
        await updateNote(editNote.id, payload)
        setEditNote(null)
        toast.success('Note updated ✓')
      } else {
        await addNote(payload)
        setShowForm(false)
        toast.success('Note saved ✓')
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save note.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (note) => {
    setEditNote(note)
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditNote(null)
  }

  const requestDelete = (note) => {
    setPendingDelete(note)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    setConfirmOpen(false)
    const note = pendingDelete
    setPendingDelete(null)
    try {
      await deleteNote(note.id)
      setUndoNote(note)
      toast.info(`"${note.title}" deleted`)
    } catch {
      toast.error('Failed to delete note.')
    }
  }

  const handleUndo = async () => {
    const note = undoNote
    setUndoNote(null)
    try {
      await addNote({
        title:   note.title,
        content: note.content,
        tags:    note.tags,
        pinned:  note.pinned,
      })
      toast.success(`"${note.title}" restored ✓`)
    } catch {
      toast.error('Could not restore note.')
    }
  }

  const handlePin = async (id) => {
    const note = notes.find(n => n.id === id)
    await togglePin(id)
    toast.success(note?.pinned ? 'Note unpinned' : 'Note pinned 📌')
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div style={{ ...S.card, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#333', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
          <input
            style={{ ...S.input, paddingLeft: 36 }}
            type="text"
            placeholder="Search notes by title, content or tag..."
            value={query}
            onChange={e => search(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div style={{ fontSize: 12, color: '#444', whiteSpace: 'nowrap' }}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} · {pinned.length} pinned
        </div>

        {/* New note button */}
        {!showForm && !editNote && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg,#b45309,#f59e0b)',
              border: 'none', borderRadius: 12, color: '#0e0a00',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            + New Note
          </button>
        )}
      </div>

      {/* ── New note form ──────────────────────────────────────────────────── */}
      {showForm && (
        <NoteForm onSave={handleSave} onCancel={handleCancel} saving={saving} />
      )}

      {/* ── Edit form ─────────────────────────────────────────────────────── */}
      {editNote && (
        <NoteForm initial={editNote} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      )}

      {/* ── API Error ─────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 56, color: '#333', fontSize: 14 }}>
          Loading notes...
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!loading && notes.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '52px 24px' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📝</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#555', marginBottom: 6 }}>No notes yet</div>
          <div style={{ fontSize: 13, color: '#333', marginBottom: 20 }}>
            {query ? `No notes match "${query}"` : 'Start writing — click "+ New Note" to begin'}
          </div>
          {!query && (
            <button onClick={() => setShowForm(true)} style={{
              padding: '10px 24px', background: 'linear-gradient(135deg,#b45309,#f59e0b)',
              border: 'none', borderRadius: 12, color: '#0e0a00',
              fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}>
              + Write First Note
            </button>
          )}
        </div>
      )}

      {/* ── No search results ─────────────────────────────────────────────── */}
      {!loading && notes.length > 0 && query && pinned.length === 0 && unpinned.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 24px', color: '#333', fontSize: 13 }}>
          No notes match "{query}"
        </div>
      )}

      {/* ── Pinned section ─────────────────────────────────────────────────── */}
      {!loading && pinned.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...S.sectionTitle, marginBottom: 12 }}>📌 Pinned</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {pinned.map(n => (
              <NoteCard key={n.id} note={n} onPin={handlePin} onEdit={handleEdit} onDelete={requestDelete} />
            ))}
          </div>
        </div>
      )}

      {/* ── All other notes ────────────────────────────────────────────────── */}
      {!loading && unpinned.length > 0 && (
        <div>
          {pinned.length > 0 && <div style={{ ...S.sectionTitle, marginBottom: 12 }}>All Notes</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {unpinned.map(n => (
              <NoteCard key={n.id} note={n} onPin={handlePin} onEdit={handleEdit} onDelete={requestDelete} />
            ))}
          </div>
        </div>
      )}

      {/* ── Confirm dialog ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Note?"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
        danger
      />

      {/* ── Undo toast ─────────────────────────────────────────────────────── */}
      <UndoToast
        item={undoNote}
        label="Note"
        onUndo={handleUndo}
        onExpire={() => setUndoNote(null)}
      />
    </div>
  )
}