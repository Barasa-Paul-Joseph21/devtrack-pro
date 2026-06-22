import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const info = decodeToken(token)
      setUser({ token, ...info })
    }
  }, [])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.token
    const info = decodeToken(token)
    localStorage.setItem('token', token)
    setUser({ token, ...info })
    return res
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
