import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Lock, User, Save } from 'lucide-react'

export default function SettingsPage(){
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    twoFactor: false
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
    setHasChanges(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-4 rounded-lg">
          <h2 className="text-sm text-slate-300 mb-4">Workspace</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded bg-slate-800/40 text-white">General</button>
            <button className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/30">Security</button>
            <button className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/30">Notifications</button>
            <button className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/30">Billing</button>
            <button className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/30">API Keys</button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Workspace Settings</h1>
          <p className="text-slate-400 mt-2">Manage your organization's environment, security protocols, and integration credentials from a central dashboard.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-400">WORKSPACE NAME</label>
              <input className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded mt-2" defaultValue="DevStack Pro Production" />
            </div>
            <div>
              <label className="text-xs text-slate-400">WORKSPACE LOGO</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-800 rounded flex items-center justify-center">Logo</div>
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded">Upload New</button>
                  <button className="px-3 py-1 bg-slate-800 text-slate-300 rounded">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm text-slate-300">Regional & Localization</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded">
                <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
              </select>
              <select className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded">
                <option>English (US)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-red-900/20 to-red-900/10 border border-red-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Delete Workspace</h3>
              <p className="text-slate-400 text-sm mt-1">Permanently delete this workspace and all associated data.</p>
            </div>
            <button className="bg-red-400 text-red-900 px-4 py-2 rounded">Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
