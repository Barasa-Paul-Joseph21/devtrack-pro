import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, MoreVertical, Edit2, Trash2, Shield, Mail,
  Download, X, ChevronDown, CheckCircle, Clock, Layers,
  User, ChevronRight, Eye
} from 'lucide-react'
import { fetchUsers, fetchUser, createUser, updateUser, updateUserRole, deleteUser } from '../services/userService'
import { useAuth } from '../context/AuthContext'

const ROLES = ['Admin', 'Project Manager', 'Developer', 'QA Engineer', 'Designer']

const ROLE_STYLES = {
  'Admin':           { badge: 'bg-purple-900/60 text-purple-300 border border-purple-700/40', dot: 'bg-purple-400' },
  'Project Manager': { badge: 'bg-blue-900/60 text-blue-300 border border-blue-700/40',       dot: 'bg-blue-400' },
  'Developer':       { badge: 'bg-slate-700/60 text-slate-300 border border-slate-600/40',    dot: 'bg-slate-400' },
  'QA Engineer':     { badge: 'bg-green-900/60 text-green-300 border border-green-700/40',    dot: 'bg-green-400' },
  'Designer':        { badge: 'bg-pink-900/60 text-pink-300 border border-pink-700/40',       dot: 'bg-pink-400' },
}

function getRoleStyle(role) {
  return ROLE_STYLES[role] || ROLE_STYLES['Developer']
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function getAvatarColor(name = '') {
  const colors = [
    'from-blue-500 to-blue-700', 'from-purple-500 to-purple-700',
    'from-green-500 to-green-700', 'from-orange-500 to-orange-700',
    'from-pink-500 to-pink-700', 'from-cyan-500 to-cyan-700',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className={`relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[85vh] overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  )
}

function MemberForm({ initial, onSubmit, onClose, loading, isEdit }) {
  const [form, setForm] = useState(
    initial || { fullName: '', email: '', password: '', role: 'Developer' }
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm text-slate-300 font-medium block mb-1.5">Full Name *</label>
          <input value={form.fullName} onChange={e => set('fullName', e.target.value)} required
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            placeholder="Jane Smith" />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-slate-300 font-medium block mb-1.5">Email Address *</label>
          <input value={form.email} onChange={e => set('email', e.target.value)} required type="email"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            placeholder="jane@company.com" />
        </div>
        {!isEdit && (
          <div className="col-span-2">
            <label className="text-sm text-slate-300 font-medium block mb-1.5">Initial Password *</label>
            <input value={form.password} onChange={e => set('password', e.target.value)} required type="password"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              placeholder="Min. 6 characters" minLength={6} />
          </div>
        )}
        <div className="col-span-2">
          <label className="text-sm text-slate-300 font-medium block mb-1.5">Role</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}

function MemberProfileModal({ userId, onClose, onEdit, onDelete, isAdmin }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchUser(userId)
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return null

  const roleStyle = getRoleStyle(profile?.role)
  const completionRate = profile?.taskCount > 0
    ? Math.round(profile.completedTaskCount / profile.taskCount * 100)
    : 0

  return (
    <Modal open={!!userId} onClose={onClose} title="Member Profile" wide>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-slate-700 rounded-lg" />
          <div className="h-10 bg-slate-700 rounded-lg" />
          <div className="h-32 bg-slate-700 rounded-lg" />
        </div>
      ) : profile ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 bg-slate-700/40 rounded-xl">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(profile.fullName)} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
              {getInitials(profile.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg">{profile.fullName}</h3>
              <p className="text-slate-400 text-sm">{profile.email}</p>
              <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full ${roleStyle.badge}`}>{profile.role}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500">Member since</p>
              <p className="text-sm text-slate-300">{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/40 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{profile.taskCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Tasks Assigned</p>
            </div>
            <div className="bg-slate-700/40 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{profile.completedTaskCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Completed</p>
            </div>
            <div className="bg-slate-700/40 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{completionRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Completion Rate</p>
            </div>
          </div>

          {/* Completion Progress */}
          {profile.taskCount > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Task Completion</span>
                <span className="text-white">{completionRate}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 0.6 }}
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
              </div>
            </div>
          )}

          {/* Recent Tasks */}
          {profile.recentTasks?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Recent Tasks</h4>
              <div className="space-y-2">
                {profile.recentTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg">
                    <span className="text-sm text-white truncate flex-1">{t.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                      t.status === 'Completed' ? 'bg-green-900/50 text-green-400' :
                      t.status === 'In Progress' ? 'bg-blue-900/50 text-blue-400' :
                      t.status === 'Blocked' ? 'bg-red-900/50 text-red-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {isAdmin && (
            <div className="flex gap-3 pt-2 border-t border-slate-700">
              <button onClick={() => { onClose(); onEdit(profile) }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                <Edit2 size={14} /> Edit Member
              </button>
              <button onClick={() => { onClose(); onDelete(profile) }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
                <Trash2 size={14} /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8">Failed to load profile</p>
      )}
    </Modal>
  )
}

function RoleDropdown({ user, onRoleChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const style = getRoleStyle(user.role)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (disabled) {
    return <span className={`text-xs px-2.5 py-1 rounded-full ${style.badge}`}>{user.role}</span>
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${style.badge} hover:opacity-80 transition-opacity`}>
        {user.role}
        <ChevronDown size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-8 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 py-1"
          >
            {ROLES.filter(r => r !== user.role).map(r => {
              const rs = getRoleStyle(r)
              return (
                <button key={r} onClick={() => { setOpen(false); onRoleChange(user, r) }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <span className={`w-2 h-2 rounded-full ${rs.dot}`} />{r}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RowMenu({ user, onView, onEdit, onDelete, isAdmin, isSelf }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const action = fn => { setOpen(false); fn() }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors">
        <MoreVertical size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 py-1"
          >
            <button onClick={() => action(onView)}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Eye size={13} /> View Profile
            </button>
            {isAdmin && (
              <>
                <button onClick={() => action(onEdit)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <Edit2 size={13} /> Edit Member
                </button>
                {!isSelf && (
                  <>
                    <div className="border-t border-slate-700 my-1" />
                    <button onClick={() => action(onDelete)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={13} /> Remove Member
                    </button>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TeamPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [formLoading, setFormLoading] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showAdd, setShowAdd] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [deleteMember, setDeleteMember] = useState(null)
  const [profileUserId, setProfileUserId] = useState(null)
  const [toast, setToast] = useState(null)

  const isAdmin = currentUser?.role === 'Admin'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetchUsers()
      setUsers(res.data)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (form) => {
    setFormLoading(true)
    try {
      await createUser(form)
      setShowAdd(false)
      await load()
      showToast(`${form.fullName} added to the team`)
    } catch (e) {
      showToast(e?.response?.data?.message || 'Could not add member', 'error')
    }
    finally { setFormLoading(false) }
  }

  const handleEdit = async (form) => {
    setFormLoading(true)
    try {
      await updateUser(editMember.id, form)
      setEditMember(null)
      await load()
      showToast('Member updated')
    } catch (e) {
      showToast(e?.response?.data?.message || 'Could not update member', 'error')
    }
    finally { setFormLoading(false) }
  }

  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUserRole(user.id, newRole)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      showToast(`${user.fullName} is now a ${newRole}`)
    } catch {
      showToast('Could not update role', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteMember.id)
      setDeleteMember(null)
      await load()
      showToast(`${deleteMember.fullName} removed from team`)
    } catch (e) {
      showToast(e?.response?.data?.message || 'Could not remove member', 'error')
    }
  }

  const exportCSV = () => {
    const header = 'Name,Email,Role,Tasks,Completed,Joined'
    const rows = users.map(u =>
      `"${u.fullName}","${u.email}","${u.role}",${u.taskCount},${u.completedTaskCount},"${new Date(u.createdAt).toLocaleDateString()}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'team-members.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const roleCounts = ROLES.reduce((acc, r) => { acc[r] = users.filter(u => u.role === r).length; return acc }, {})

  const stats = [
    { label: 'Total Members', value: users.length, sub: 'registered accounts' },
    { label: 'Admins', value: roleCounts['Admin'] || 0, sub: 'full access' },
    { label: 'Project Managers', value: roleCounts['Project Manager'] || 0, sub: 'project leads' },
    { label: 'Developers', value: (roleCounts['Developer'] || 0) + (roleCounts['QA Engineer'] || 0) + (roleCounts['Designer'] || 0), sub: 'builders' },
  ]

  const currentUserId = currentUser?.id || currentUser?.nameid || currentUser?.sub

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''} across {Object.values(roleCounts).filter(Boolean).length} roles</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
            <Download size={16} /> Export CSV
          </button>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
            <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Role Filter */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input type="text" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...ROLES].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Member</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Tasks</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Completion</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length > 0 ? paginated.map(user => {
              const isSelf = String(user.id) === String(currentUserId)
              const completionRate = user.taskCount > 0
                ? Math.round(user.completedTaskCount / user.taskCount * 100) : 0

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user.fullName)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                        {getInitials(user.fullName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-white text-sm font-medium">{user.fullName}</p>
                          {isSelf && <span className="text-xs bg-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded">You</span>}
                        </div>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RoleDropdown user={user} onRoleChange={handleRoleChange} disabled={!isAdmin} />
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-300">{user.taskCount}</span>
                    <span className="text-slate-600 mx-1">·</span>
                    <span className="text-sm text-green-400">{user.completedTaskCount} done</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${completionRate >= 80 ? 'bg-green-500' : completionRate >= 50 ? 'bg-blue-500' : 'bg-slate-500'}`}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowMenu
                      user={user}
                      isAdmin={isAdmin}
                      isSelf={isSelf}
                      onView={() => setProfileUserId(user.id)}
                      onEdit={() => setEditMember(user)}
                      onDelete={() => setDeleteMember(user)}
                    />
                  </td>
                </motion.tr>
              )
            }) : (
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center text-slate-500">
                  <User size={40} className="mx-auto mb-3 text-slate-700" />
                  <p>{search ? 'No members match your search' : roleFilter !== 'all' ? `No ${roleFilter}s yet` : 'No team members'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">←</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Team Member">
            <MemberForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} loading={formLoading} />
          </Modal>
        )}
        {editMember && (
          <Modal open={!!editMember} onClose={() => setEditMember(null)} title="Edit Member">
            <MemberForm
              initial={{ fullName: editMember.fullName, email: editMember.email, role: editMember.role }}
              onSubmit={handleEdit}
              onClose={() => setEditMember(null)}
              loading={formLoading}
              isEdit
            />
          </Modal>
        )}
      </AnimatePresence>

      <MemberProfileModal
        userId={profileUserId}
        onClose={() => setProfileUserId(null)}
        onEdit={u => setEditMember(u)}
        onDelete={u => setDeleteMember(u)}
        isAdmin={isAdmin}
      />

      {/* Delete Confirm */}
      {deleteMember && (
        <Modal open={!!deleteMember} onClose={() => setDeleteMember(null)} title="Remove Member">
          <div className="flex items-center gap-4 mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(deleteMember.fullName)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {getInitials(deleteMember.fullName)}
            </div>
            <div>
              <p className="text-white font-semibold">{deleteMember.fullName}</p>
              <p className="text-slate-400 text-sm">{deleteMember.email} · {deleteMember.role}</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Removing this member will not delete their tasks or projects, but they will lose access to the system immediately.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteMember(null)}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">
              Remove Member
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
