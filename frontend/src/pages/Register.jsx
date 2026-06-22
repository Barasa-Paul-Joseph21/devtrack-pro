import React, {useState} from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const [fullName,setFullName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const { login } = useAuth()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try{
      // call backend directly - register endpoint returns token
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, email, password }) })
      if(!res.ok) throw new Error('Register failed')
      const data = await res.json()
      localStorage.setItem('token', data.token)
      window.location.href = '/'
    }catch(err){
      alert('Register failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-6 mt-8">
      <h1 className="text-3xl font-bold mb-4">Register</h1>

      <form onSubmit={submit} className="grid grid-cols-1 gap-2">
        <input className="border px-2 py-1" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="border px-2 py-1" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border px-2 py-1" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-28 border rounded px-3 py-1">{loading ? '...' : 'Register'}</button>
      </form>
    </div>
  )
}
