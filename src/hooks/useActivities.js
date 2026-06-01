import { useState, useEffect, useCallback } from 'react'
import { activitiesAPI } from '../api/client'

export function useActivities(date = new Date().toISOString().slice(0, 10)) {
  const [activities, setActivities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const r = await activitiesAPI.getAll(date)
      setActivities(r.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const addActivity = async (title) => {
    const r = await activitiesAPI.create({ title, date })
    setActivities((prev) => [...prev, r.data])
  }

  const deleteActivity = async (id) => {
    await activitiesAPI.remove(id)
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  // Optimistic toggle
  const toggleActivity = async (id) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
    )
    try {
      const r = await activitiesAPI.toggle(id)
      setActivities((prev) => prev.map((a) => (a.id === id ? r.data : a)))
    } catch {
      // Rollback
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
      )
    }
  }

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    addActivity,
    deleteActivity,
    toggleActivity,
  }
}