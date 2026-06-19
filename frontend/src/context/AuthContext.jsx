import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Token lives in sessionStorage (per-tab), NOT localStorage (shared across tabs)
  // so you can be signed into different accounts in different tabs — and reloading
  // one tab keeps its own session instead of picking up another tab's login.
  const [token, setToken] = useState(sessionStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadUser = useCallback(async () => {
    const storedToken = sessionStorage.getItem('token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user || res.data)
    } catch {
      sessionStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token, loadUser])

  // register/login return the user fields flat alongside the token
  // (getMe nests them under `user`); normalise both into a user object.
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, ...userData } = res.data
    sessionStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { token: newToken, ...userData } = res.data
    sessionStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
