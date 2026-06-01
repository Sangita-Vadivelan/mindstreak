import { useState, useEffect, useCallback } from 'react'
import { notesAPI } from '../api/client'

export function useNotes() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [query,   setQuery]   = useState('')

  const fetchNotes = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const r = await notesAPI.getAll(q)
      setNotes(r.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const search = (q) => {
    setQuery(q)
    fetchNotes(q)
  }

  const addNote = async (data) => {
    const r = await notesAPI.create(data)
    setNotes((prev) => [r.data, ...prev])
  }

  const updateNote = async (id, data) => {
    const r = await notesAPI.update(id, data)
    setNotes((prev) => prev.map((n) => (n.id === id ? r.data : n)))
  }

  const deleteNote = async (id) => {
    await notesAPI.remove(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const togglePin = async (id) => {
    const r = await notesAPI.togglePin(id)
    setNotes((prev) => prev.map((n) => (n.id === id ? r.data : n)))
  }

  return {
    notes,
    loading,
    error,
    query,
    search,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
  }
}