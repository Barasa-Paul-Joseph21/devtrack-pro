import React, {useEffect, useState} from 'react'
import ThreeBackground from '../components/ThreeBackground'
import { fetchUsers } from '../services/userService'
import adminImg from '../assets/ui-reference/dashboard-overview.png'

export default function AdminDashboard(){
  const [users, setUsers] = useState([])

  useEffect(()=>{
    fetchUsers().then(r=>setUsers(r.data)).catch(()=>{})
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-300">Manage projects, team and tasks.</p>
        </div>
        <div className="w-full md:col-span-1">
          <img src={adminImg} alt="admin overview" className="rounded-md shadow" />
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-white">Team Members</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="p-4 bg-slate-800 border border-slate-700 rounded shadow-sm">
              <div className="font-bold text-white">{u.fullName}</div>
              <div className="text-sm text-slate-400">{u.email}</div>
              <div className="text-xs text-slate-500">{u.role}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
