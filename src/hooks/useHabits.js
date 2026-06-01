import { useState, useEffect, useCallback } from 'react'
import { habitsAPI } from '../api/client'

export function useHabits() {
  const [habits,  setHabits]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    try {
      const r = await habitsAPI.getAll()
      setHabits(r.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const addHabit = async (data) => {
    const r = await habitsAPI.create(data)
    setHabits((prev) => [...prev, r.data])
    return r.data
  }

  const updateHabit = async (id, data) => {
    const r = await habitsAPI.update(id, data)
    setHabits((prev) => prev.map((h) => (h.id === id ? r.data : h)))
    return r.data
  }

  const deleteHabit = async (id) => {
    await habitsAPI.remove(id)
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  // Optimistic toggle — UI updates instantly, syncs with server
  const toggleHabit = async (id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done_today: !h.done_today } : h))
    )
    try {
      const r = await habitsAPI.logToggle(id)
      setHabits((prev) => prev.map((h) => (h.id === id ? r.data : h)))
    } catch {
      // Rollback on error
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, done_today: !h.done_today } : h))
      )
    }
  }

  return {
    habits,
    loading,
    error,
    refetch: fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
  }
}