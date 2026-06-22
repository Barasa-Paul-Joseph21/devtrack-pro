import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, Save, Check } from 'lucide-react'

const ROLES_DATA = [
  { name: 'Admin', description: 'Full system access with all permissions', users: 8 },
  { name: 'Manager', description: 'Resource allocation and project management', users: 12 },
  { name: 'Developer', description: 'Code contribution and task execution', users: 45 },
  { name: 'Auditor', description: 'Read-only access for compliance audits', users: 3 }
]

export default function RolesPage(){
  const [selectedRole, setSelectedRole] = useState('Admin')
  const [hasChanges, setHasChanges] = useState(false)
  const [permissions, setPermissions] = useState({
    'Create Projects': true,
    'Archive Projects': true,
    'Delete Projects': false,
    'Force Override Task State': false,
    'Assign Tasks to External': false,
    'Bulk Delete Task History': false
  })

  const handlePermissionChange = (perm) => {
    setPermissions(prev => ({ ...prev, [perm]: !prev[perm] }))
    setHasChanges(true)
  }

  const RoleCard = ({ role, selected }) => (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={() => setSelectedRole(role.name)}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        selected 
          ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' 
          : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-900/40 rounded mt-1">
          <Shield size={16} className="text-blue-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">{role.name}</h3>
          <p className="text-xs text-slate-400 mt-1">{role.description}</p>
          <p className="text-xs text-slate-500 mt-2">{role.users} USERS</p>
        </div>
      </div>
    </motion.button>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Roles & Permissions</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Role Cards */}
        <div className="space-y-3">
          {ROLES_DATA.map(role => (
            <RoleCard key={role.name} role={role} selected={selectedRole === role.name} />
          ))}
        </div>

        {/* Right Panel - Permissions */}
        <motion.div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedRole} Role</h2>
            <p className="text-slate-400 text-sm">Manage permissions for this role</p>
          </div>

          {/* Permissions Groups */}
          <div className="space-y-8">
            {/* Project Access */}
            <div>
              <h3 className="text-white font-semibold mb-4">Project Access</h3>
              <div className="space-y-3">
                {['Create Projects', 'Archive Projects'].map(perm => (
                  <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      permissions[perm] 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-slate-600 group-hover:border-slate-500'
                    }`}>
                      {permissions[perm] && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-slate-300 text-sm">{perm}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Task Actions */}
            <div>
              <h3 className="text-white font-semibold mb-4">Task Actions</h3>
              <div className="space-y-3">
                {['Force Override Task State', 'Assign Tasks to External Vendors', 'Bulk Delete Task History'].map(perm => (
                  <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      permissions[perm] 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-slate-600 group-hover:border-slate-500'
                    }`}>
                      {permissions[perm] && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-slate-300 text-sm">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Unsaved Changes Alert */}
          {hasChanges && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/40 rounded-lg flex items-center justify-between"
            >
              <p className="text-yellow-300 text-sm">Unsaved changes</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Save size={16} />
                Save Changes
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
