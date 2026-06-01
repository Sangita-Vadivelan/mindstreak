import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, verify any stored token
  useEffect(() => {
    const token = localStorage.getItem('ms_token')
    if (!token) {
      setLoading(false)
      return
    }
    authAPI.me()
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('ms_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password })
    localStorage.setItem('ms_token', r.data.token)
    setUser(r.data.user)
    return r.data
  }

  const register = async (name, email, password) => {
    const r = await authAPI.register({ name, email, password })
    localStorage.setItem('ms_token', r.data.token)
    setUser(r.data.user)
    return r.data
  }

  const logout = () => {
    localStorage.removeItem('ms_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}