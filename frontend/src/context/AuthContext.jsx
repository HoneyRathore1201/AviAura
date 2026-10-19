import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('aviaura_user')
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('aviaura_token'))

  useEffect(() => {
    if (!token) return
    api
      .get('/api/me')
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('aviaura_user', JSON.stringify(res.data))
      })
      .catch(() => {
        localStorage.removeItem('aviaura_token')
        localStorage.removeItem('aviaura_user')
        setToken(null)
        setUser(null)
      })
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      login: (payload) => {
        localStorage.setItem('aviaura_token', payload.token)
        localStorage.setItem('aviaura_user', JSON.stringify(payload.user))
        setToken(payload.token)
        setUser(payload.user)
      },
      logout: () => {
        localStorage.removeItem('aviaura_token')
        localStorage.removeItem('aviaura_user')
        setToken(null)
        setUser(null)
      },
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
