import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('fm_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('fm_token'))

  useEffect(() => {
    if (token) localStorage.setItem('fm_token', token); else localStorage.removeItem('fm_token')
  }, [token])
  useEffect(() => {
    if (user) localStorage.setItem('fm_user', JSON.stringify(user)); else localStorage.removeItem('fm_user')
  }, [user])

  const login = ({ token, refreshToken, user }) => {
    setToken(token)
    setUser(user)
    localStorage.setItem('fm_refresh', refreshToken)
  }

  const logout = () => {
    setToken(null); setUser(null); localStorage.removeItem('fm_refresh');
  }

  const refresh = async () => {
    const refreshToken = localStorage.getItem('fm_refresh')
    if (!refreshToken) return null
    try{
      const res = await api.post('/auth/refresh', { refreshToken })
      setToken(res.data.token)
      return res.data.token
    }catch(e){ logout(); return null }
  }

  return <AuthContext.Provider value={{ user, token, login, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuthContext(){ return useContext(AuthContext) }
