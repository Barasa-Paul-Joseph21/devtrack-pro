import React, {createContext, useContext, useEffect, useState} from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(token){
      // we could decode token to extract claims; keep simple
      setUser({ token })
    }
  }, [])

  async function login(email, password){
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser({ token: res.data.token })
    return res
  }

  function logout(){
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
