import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api/client'

export function useAnalytics() {
  const [weekly,   setWeekly]   = useState([])
  const [heatmap,  setHeatmap]  = useState([])
  const [insights, setInsights] = useState([])
  const [summary,  setSummary]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    Promise.all([
      analyticsAPI.weekly(),
      analyticsAPI.heatmap(),
      analyticsAPI.insights(),
      analyticsAPI.summary(),
    ])
      .then(([w, h, i, s]) => {
        setWeekly(w.data)
        setHeatmap(h.data)
        setInsights(i.data)
        setSummary(s.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { weekly, heatmap, insights, summary, loading, error }
}