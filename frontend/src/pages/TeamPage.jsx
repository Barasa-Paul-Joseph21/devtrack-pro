import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Mail, Shield, Trash2, Download, Search } from 'lucide-react'
import { fetchUsers, updateUserRole, createUser } from '../services/userService'

const ROLES = ['Admin', 'Project Manager', 'Developer']

export default function TeamPage(){
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'Developer' })

  useEffect(()=>{ loadUsers() }, [])
  
  async function loadUsers(){
    try{
      const res = await fetchUsers()
      setUsers(res.data)
    }catch(e){}
  }

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const StatCard = ({ label, value, color }) => (
    <motion.div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <div className="mt-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{color}</p>
      </div>
    </motion.div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        <button onClick={()=>setShowForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow">
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Members" value="1,284" color="+12% vs LY" />
        <StatCard label="Seats Used" value="422/500" color="84% capacity" />
        <StatCard label="Pending Invites" value="18" color="awaiting response" />
        <StatCard label="Active Now" value="89" color="online" />
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 items-center mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="bg-slate-800/50 border border-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition-colors">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-6 rounded-lg mb-6">
          <form onSubmit={async (e)=>{
            e.preventDefault();
            try{ await createUser(newUser); setShowForm(false); setNewUser({ fullName:'', email:'', password:'', role: 'Developer' }); loadUsers(); }catch(e){ alert('Failed to create user') }
          }} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Full Name</label>
              <input value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg mt-1" required />
            </div>
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg mt-1" type="email" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-500 px-4 py-2 rounded-lg text-white">Add</button>
              <button type="button" onClick={()=>setShowForm(false)} className="bg-slate-800 px-4 py-2 rounded-lg text-slate-300">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Team Table */}
      <motion.div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-400">User Directory <span className="ml-2 bg-slate-800/30 text-slate-300 px-2 py-1 rounded">342 Developers</span></div>
          <div className="flex items-center gap-3">
            <button className="bg-slate-800/40 px-3 py-1 rounded text-slate-300">Filter</button>
            <button className="bg-slate-800/40 px-3 py-1 rounded text-slate-300">Export CSV</button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-transparent">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Member</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.fullName}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-900 text-purple-200' :
                      user.role === 'Project Manager' ? 'bg-blue-900 text-blue-200' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {user.role || 'Developer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-slate-300">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-400">2 hours ago</p>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={async ()=>{
                      if(!confirm('Remove user?')) return
                      try{ await api.delete(`/users/${user.id}`); loadUsers(); }catch(e){ alert('Could not delete user') }
                    }} className="text-slate-400 hover:text-white transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  No team members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-400">Showing 1-{Math.min(10, filteredUsers.length)} of {filteredUsers.length} members</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">←</button>
            <button className="w-8 h-8 bg-blue-500 text-white rounded font-semibold">1</button>
            <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">2</button>
            <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">3</button>
            <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">→</button>
          </div>
        </div>
      )}
    </div>
  )
}
