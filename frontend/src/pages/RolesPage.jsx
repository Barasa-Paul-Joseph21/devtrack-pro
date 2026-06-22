import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Plus, Save, Check, X, Users, Lock, Eye, Edit2, Trash2, ChevronRight } from 'lucide-react'
import { fetchUsers } from '../services/userService'
import { useAuth } from '../context/AuthContext'

const PERMISSION_GROUPS = [
  {
    group: 'Projects',
    permissions: [
      { key: 'projects.create',    label: 'Create Projects',          desc: 'Can create new projects' },
      { key: 'projects.edit',      label: 'Edit Projects',            desc: 'Can edit project details and status' },
      { key: 'projects.delete',    label: 'Delete Projects',          desc: 'Can permanently delete projects' },
      { key: 'projects.archive',   label: 'Archive Projects',         desc: 'Can archive and restore projects' },
      { key: 'projects.duplicate', label: 'Duplicate Projects',       desc: 'Can duplicate existing projects' },
    ]
  },
  {
    group: 'Tasks',
    permissions: [
      { key: 'tasks.create',    label: 'Create Tasks',            desc: 'Can create new tasks in any project' },
      { key: 'tasks.edit',      label: 'Edit Tasks',              desc: 'Can edit task details and descriptions' },
      { key: 'tasks.delete',    label: 'Delete Tasks',            desc: 'Can permanently delete tasks' },
      { key: 'tasks.assign',    label: 'Assign Tasks',            desc: 'Can assign tasks to team members' },
      { key: 'tasks.status',    label: 'Change Task Status',      desc: 'Can move tasks between statuses' },
      { key: 'tasks.priority',  label: 'Change Task Priority',    desc: 'Can change task priority levels' },
    ]
  },
  {
    group: 'Team',
    permissions: [
      { key: 'team.view',    label: 'View Team Members',    desc: 'Can see all team members and profiles' },
      { key: 'team.invite',  label: 'Invite Members',       desc: 'Can add new members to the workspace' },
      { key: 'team.edit',    label: 'Edit Member Details',  desc: 'Can update member name, email, role' },
      { key: 'team.remove',  label: 'Remove Members',       desc: 'Can remove members from the workspace' },
    ]
  },
  {
    group: 'Reports & Analytics',
    permissions: [
      { key: 'analytics.view',    label: 'View Analytics',       desc: 'Can access analytics and metrics' },
      { key: 'reports.generate',  label: 'Generate Reports',      desc: 'Can generate and download CSV reports' },
    ]
  },
  {
    group: 'Administration',
    permissions: [
      { key: 'roles.manage',     label: 'Manage Roles',        desc: 'Can create, edit, and delete roles' },
      { key: 'settings.manage',  label: 'Manage Settings',     desc: 'Can change workspace-wide settings' },
      { key: 'api.manage',       label: 'Manage API Keys',     desc: 'Can create and revoke API keys' },
    ]
  },
]

const ALL_PERMS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key))

const DEFAULT_PERMISSIONS = {
  Admin: Object.fromEntries(ALL_PERMS.map(p => [p, true])),
  'Project Manager': Object.fromEntries(ALL_PERMS.map(p => [p,
    !['projects.delete', 'team.remove', 'roles.manage', 'settings.manage', 'api.manage'].includes(p)
  ])),
  Developer: Object.fromEntries(ALL_PERMS.map(p => [p,
    ['projects.create', 'tasks.create', 'tasks.edit', 'tasks.status', 'tasks.priority', 'team.view', 'analytics.view', 'reports.generate'].includes(p)
  ])),
  'QA Engineer': Object.fromEntries(ALL_PERMS.map(p => [p,
    ['tasks.edit', 'tasks.status', 'team.view', 'analytics.view', 'reports.generate'].includes(p)
  ])),
  Designer: Object.fromEntries(ALL_PERMS.map(p => [p,
    ['projects.create', 'tasks.create', 'tasks.edit', 'tasks.status', 'team.view', 'analytics.view'].includes(p)
  ])),
}

const ROLE_COLORS = {
  Admin:           { bg: 'bg-purple-900/40', text: 'text-purple-300', icon: 'text-purple-400', dot: 'bg-purple-400' },
  'Project Manager': { bg: 'bg-blue-900/40',   text: 'text-blue-300',   icon: 'text-blue-400',   dot: 'bg-blue-400' },
  Developer:       { bg: 'bg-slate-700/40',  text: 'text-slate-300',  icon: 'text-slate-400',  dot: 'bg-slate-400' },
  'QA Engineer':   { bg: 'bg-green-900/40',  text: 'text-green-300',  icon: 'text-green-400',  dot: 'bg-green-400' },
  Designer:        { bg: 'bg-pink-900/40',   text: 'text-pink-300',   icon: 'text-pink-400',   dot: 'bg-pink-400' },
}

const STORAGE_KEY = 'role_permissions_v1'

function loadPerms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PERMISSIONS }
  catch { return DEFAULT_PERMISSIONS }
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  )
}

export default function RolesPage() {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'Admin'

  const [roles, setRoles] = useState(['Admin', 'Project Manager', 'Developer', 'QA Engineer', 'Designer'])
  const [selectedRole, setSelectedRole] = useState('Admin')
  const [permissions, setPermissions] = useState(loadPerms)
  const [usersByRole, setUsersByRole] = useState({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchUsers().then(r => {
      const grouped = {}
      r.data.forEach(u => {
        if (!grouped[u.role]) grouped[u.role] = []
        grouped[u.role].push(u)
      })
      setUsersByRole(grouped)
    }).catch(() => {})
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const togglePerm = (perm) => {
    if (!isAdmin) return
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], [perm]: !prev[selectedRole]?.[perm] }
    }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions))
    setHasChanges(false)
    setSaved(true)
    showToast(`Permissions for "${selectedRole}" saved`)
    setTimeout(() => setSaved(false), 3000)
  }

  const grantAll = () => {
    if (!isAdmin) return
    const all = Object.fromEntries(ALL_PERMS.map(p => [p, true]))
    setPermissions(prev => ({ ...prev, [selectedRole]: all }))
    setHasChanges(true)
  }

  const revokeAll = () => {
    if (!isAdmin) return
    const none = Object.fromEntries(ALL_PERMS.map(p => [p, false]))
    setPermissions(prev => ({ ...prev, [selectedRole]: none }))
    setHasChanges(true)
  }

  const resetToDefault = () => {
    if (!isAdmin) return
    setPermissions(prev => ({ ...prev, [selectedRole]: DEFAULT_PERMISSIONS[selectedRole] || {} }))
    setHasChanges(true)
    showToast('Reset to defaults')
  }

  const currentPerms = permissions[selectedRole] || {}
  const grantedCount = Object.values(currentPerms).filter(Boolean).length
  const totalCount = ALL_PERMS.length
  const roleStyle = ROLE_COLORS[selectedRole] || ROLE_COLORS.Developer
  const members = usersByRole[selectedRole] || []

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-slate-400 text-sm mt-1">{roles.length} roles · {isAdmin ? 'Full edit access' : 'View only'}</p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <Lock size={14} className="text-yellow-400" />
            <span className="text-xs text-yellow-300">Only Admins can modify permissions</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Role List */}
        <div className="space-y-2">
          {roles.map(role => {
            const style = ROLE_COLORS[role] || ROLE_COLORS.Developer
            const count = (usersByRole[role] || []).length
            const active = role === selectedRole
            const rolePerms = permissions[role] || {}
            const granted = Object.values(rolePerms).filter(Boolean).length
            return (
              <motion.button key={role} whileHover={{ x: 3 }}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${active ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${style.bg}`}>
                    <Shield size={14} className={style.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{role}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{count} member{count !== 1 ? 's' : ''} · {granted}/{totalCount} perms</p>
                  </div>
                  {active && <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Permission Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Role Header */}
          <div className={`${roleStyle.bg} border border-slate-700/50 rounded-xl p-5`}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${roleStyle.bg} border border-slate-700/50`}>
                  <Shield size={22} className={roleStyle.icon} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedRole}</h2>
                  <p className={`text-sm ${roleStyle.text}`}>{grantedCount} of {totalCount} permissions granted</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={resetToDefault} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">Reset to Default</button>
                  <button onClick={revokeAll} className="px-3 py-1.5 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors">Revoke All</button>
                  <button onClick={grantAll} className="px-3 py-1.5 text-xs bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 rounded-lg transition-colors">Grant All</button>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <motion.div
                  animate={{ width: `${(grantedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-1.5 rounded-full bg-blue-500"
                />
              </div>
            </div>

            {/* Members in this role */}
            {members.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-500">Members:</span>
                <div className="flex -space-x-1.5">
                  {members.slice(0, 6).map(m => (
                    <div key={m.id} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-slate-800 flex items-center justify-center text-xs text-white font-bold"
                      title={m.fullName}>
                      {m.fullName?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {members.length > 6 && <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-xs text-slate-400">+{members.length - 6}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Permission Groups */}
          <div className="space-y-3">
            {PERMISSION_GROUPS.map(group => (
              <div key={group.group} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">{group.group}</h3>
                  <span className="text-xs text-slate-500">
                    {group.permissions.filter(p => currentPerms[p.key]).length}/{group.permissions.length} enabled
                  </span>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {group.permissions.map(perm => {
                    const enabled = !!currentPerms[perm.key]
                    return (
                      <div key={perm.key} className={`flex items-center justify-between px-5 py-3.5 ${isAdmin ? 'hover:bg-slate-700/30 cursor-pointer' : ''} transition-colors`}
                        onClick={() => togglePerm(perm.key)}>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={`text-sm font-medium ${enabled ? 'text-white' : 'text-slate-400'}`}>{perm.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{perm.desc}</p>
                        </div>
                        <Toggle checked={enabled} onChange={() => togglePerm(perm.key)} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Unsaved changes bar */}
          <AnimatePresence>
            {hasChanges && isAdmin && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="sticky bottom-0 bg-slate-800 border border-yellow-600/40 rounded-xl p-4 flex items-center justify-between gap-4 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <p className="text-yellow-300 text-sm font-medium">Unsaved changes to "{selectedRole}" permissions</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setPermissions(loadPerms()); setHasChanges(false) }}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                    Discard
                  </button>
                  <button onClick={handleSave}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <Save size={14} /> Save Permissions
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {saved && !hasChanges && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm px-5 py-3 bg-green-900/20 border border-green-700/30 rounded-xl">
              <Check size={16} /> Permissions saved successfully
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
