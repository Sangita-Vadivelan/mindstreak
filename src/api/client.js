import axios from 'axios'

const BASE_URL = 'https://mindstreak-backend.onrender.com'

// ── Axios instance ─────────────────────────────────────────────────────────────
const client = axios.create({ baseURL: BASE_URL })

// Attach JWT token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear token and send user to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ms_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => client.post('/api/auth/register', data),
  login:    (data) => client.post('/api/auth/login', data),
  me:       ()     => client.get('/auth/me'),
}

// ── Habits ─────────────────────────────────────────────────────────────────────
export const habitsAPI = {
  getAll:    ()         => client.get('/habits/'),
  create:    (data)     => client.post('/habits/', data),
  update:    (id, data) => client.put(`/habits/${id}`, data),
  remove:    (id)       => client.delete(`/habits/${id}`),
  logToggle: (id)       => client.post(`/habits/${id}/log`),
}

// ── Activities ─────────────────────────────────────────────────────────────────
export const activitiesAPI = {
  getAll: (date)        => client.get('/activities/', { params: { date } }),
  create: (data)        => client.post('/activities/', data),
  update: (id, data)    => client.put(`/activities/${id}`, data),
  remove: (id)          => client.delete(`/activities/${id}`),
  toggle: (id)          => client.post(`/activities/${id}/toggle`),
}

// ── Notes ──────────────────────────────────────────────────────────────────────
export const notesAPI = {
  getAll:    (q = '')   => client.get('/notes/', { params: { q } }),
  create:    (data)     => client.post('/notes/', data),
  update:    (id, data) => client.put(`/notes/${id}`, data),
  remove:    (id)       => client.delete(`/notes/${id}`),
  togglePin: (id)       => client.post(`/notes/${id}/pin`),
}

// ── Analytics ──────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  weekly:   ()           => client.get('/analytics/weekly'),
  heatmap:  (weeks = 15) => client.get('/analytics/heatmap', { params: { weeks } }),
  insights: ()           => client.get('/analytics/insights'),
  summary:  ()           => client.get('/analytics/summary'),
}