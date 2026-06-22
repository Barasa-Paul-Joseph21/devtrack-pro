import React, {useEffect, useState} from 'react'
import { fetchUsers, updateUserRole, createUser } from '../services/userService'
import rolesImg from '../assets/ui-reference/roles & permissions-management.png'

const ROLES = ["Admin","Project Manager","Developer"]

export default function UsersPage(){
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'Developer' })

  useEffect(()=>{ load() }, [])
  function load(){ fetchUsers().then(r=>setUsers(r.data)).catch(()=>{}) }

  async function onChangeRole(id, role){
    await updateUserRole(id, role)
    load()
  }

  async function onCreate(e){
    e.preventDefault()
    await createUser(newUser)
    setNewUser({ fullName: '', email: '', password: '', role: 'Developer' })
    load()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-lg font-semibold text-white">Manage Users</h2>
        <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="bg-slate-700 border border-slate-600 text-white px-2 py-1 rounded" placeholder="Full name" value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName: e.target.value})} />
          <input className="bg-slate-700 border border-slate-600 text-white px-2 py-1 rounded" placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} />
          <input className="bg-slate-700 border border-slate-600 text-white px-2 py-1 rounded" placeholder="Password" type="password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} />
          <select className="bg-slate-700 border border-slate-600 text-white px-2 py-1 rounded" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
            {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="col-start-1 md:col-start-3 bg-blue-600 hover:bg-blue-700 text-white border rounded px-4 py-2" type="submit">Create</button>
        </form>

        <div className="mt-6 space-y-2">
          {users.map(u => (
            <div key={u.id} className="p-3 bg-slate-800 border border-slate-700 rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{u.fullName}</div>
                <div className="text-sm text-slate-400">{u.email}</div>
              </div>
              <select value={u.role} onChange={e=>onChangeRole(u.id, e.target.value)} className="bg-slate-700 border border-slate-600 text-white px-2 py-1 rounded">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <img src={rolesImg} alt="roles reference" className="rounded-md shadow" />
      </div>
    </div>
  )
}
