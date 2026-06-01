// src/hooks/useHabits.js
import { useState, useEffect, useCallback } from "react";
import { habitsAPI } from "../api/client";

export function useHabits() {
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const r = await habitsAPI.getAll();
      setHabits(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addHabit = async (data) => {
    const r = await habitsAPI.create(data);
    setHabits(h => [...h, r.data]);
    return r.data;
  };

  const updateHabit = async (id, data) => {
    const r = await habitsAPI.update(id, data);
    setHabits(h => h.map(x => x.id === id ? r.data : x));
    return r.data;
  };

  const deleteHabit = async (id) => {
    await habitsAPI.remove(id);
    setHabits(h => h.filter(x => x.id !== id));
  };

  // Toggle today's completion — optimistic update
  const toggleHabit = async (id) => {
    setHabits(h => h.map(x => x.id === id ? { ...x, done_today: !x.done_today } : x));
    try {
      const r = await habitsAPI.logToggle(id);
      setHabits(h => h.map(x => x.id === id ? r.data : x));
    } catch {
      // Rollback
      setHabits(h => h.map(x => x.id === id ? { ...x, done_today: !x.done_today } : x));
    }
  };

  return { habits, loading, error, refetch: fetch, addHabit, updateHabit, deleteHabit, toggleHabit };
}

// ─── Activities ────────────────────────────────────────────────────────────────
// src/hooks/useActivities.js
import { activitiesAPI } from "../api/client";

export function useActivities(date = new Date().toISOString().slice(0, 10)) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const r = await activitiesAPI.getAll(date);
    setActivities(r.data);
    setLoading(false);
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  const addActivity = async (title) => {
    const r = await activitiesAPI.create({ title, date });
    setActivities(a => [...a, r.data]);
  };

  const deleteActivity = async (id) => {
    await activitiesAPI.remove(id);
    setActivities(a => a.filter(x => x.id !== id));
  };

  // Optimistic toggle
  const toggleActivity = async (id) => {
    setActivities(a => a.map(x => x.id === id ? { ...x, done: !x.done } : x));
    try {
      const r = await activitiesAPI.toggle(id);
      setActivities(a => a.map(x => x.id === id ? r.data : x));
    } catch {
      setActivities(a => a.map(x => x.id === id ? { ...x, done: !x.done } : x));
    }
  };

  return { activities, loading, refetch: fetch, addActivity, deleteActivity, toggleActivity };
}

// ─── Notes ─────────────────────────────────────────────────────────────────────
import { notesAPI } from "../api/client";

export function useNotes() {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");

  const fetch = useCallback(async (q = query) => {
    setLoading(true);
    const r = await notesAPI.getAll(q);
    setNotes(r.data);
    setLoading(false);
  }, [query]);

  useEffect(() => { fetch(); }, [fetch]);

  const search = (q) => { setQuery(q); fetch(q); };

  const addNote = async (data) => {
    const r = await notesAPI.create(data);
    setNotes(n => [r.data, ...n]);
  };

  const updateNote = async (id, data) => {
    const r = await notesAPI.update(id, data);
    setNotes(n => n.map(x => x.id === id ? r.data : x));
  };

  const deleteNote = async (id) => {
    await notesAPI.remove(id);
    setNotes(n => n.filter(x => x.id !== id));
  };

  const togglePin = async (id) => {
    const r = await notesAPI.togglePin(id);
    setNotes(n => n.map(x => x.id === id ? r.data : x));
  };

  return { notes, loading, query, search, addNote, updateNote, deleteNote, togglePin };
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
import { analyticsAPI } from "../api/client";

export function useAnalytics() {
  const [weekly, setWeekly]     = useState([]);
  const [heatmap, setHeatmap]   = useState([]);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.weekly(),
      analyticsAPI.heatmap(),
      analyticsAPI.insights(),
      analyticsAPI.summary(),
    ]).then(([w, h, i, s]) => {
      setWeekly(w.data);
      setHeatmap(h.data);
      setInsights(i.data);
      setSummary(s.data);
    }).finally(() => setLoading(false));
  }, []);

  return { weekly, heatmap, insights, summary, loading };
}