import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bell, Lock, Palette, Key, AlertTriangle, Eye, EyeOff, Check, Copy, Trash2, Save, Shield } from 'lucide-react'
import api from '../services/api'

const TABS = [
  { id: 'general',       label: 'General',       icon: Settings },
  { id: 'security',      label: 'Security',       icon: Lock },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'api',           label: 'API Keys',        icon: Key },
  { id: 'danger',        label: 'Danger Zone',    icon: AlertTriangle },
]

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) || def } catch { return def }
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}>
      <motion.div animate={{ x: checked ? 22 : 3 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
    </button>
  )
}

function Section({ title, description, children }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-white font-semibold">{title}</h3>
        {description && <p className="text-slate-400 text-sm mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

/* ─── General ──────────────────────────────────────────────── */
function GeneralTab({ showToast }) {
  const KEY = 'workspace_general'
  const DEF = { name: 'My Workspace', timezone: 'UTC', language: 'en', dateFormat: 'MM/DD/YYYY' }
  const [form, setForm] = useState(() => load(KEY, DEF))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(form))
    showToast('General settings saved')
  }

  return (
    <div className="space-y-5">
      <Section title="Workspace" description="Basic identity and regional settings">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium block mb-1.5">Workspace Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full max-w-md bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300 font-medium block mb-1.5">Timezone</label>
              <select value={form.timezone} onChange={e => set('timezone', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
                {['UTC', 'UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+0 (GMT)', 'UTC+1 (CET)', 'UTC+3 (EAT)', 'UTC+5:30 (IST)', 'UTC+8 (CST)', 'UTC+9 (JST)'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium block mb-1.5">Language</label>
              <select value={form.language} onChange={e => set('language', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium block mb-1.5">Date Format</label>
              <select value={form.dateFormat} onChange={e => set('dateFormat', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
                {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <button onClick={save} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </Section>
    </div>
  )
}

/* ─── Security ─────────────────────────────────────────────── */
function SecurityTab({ showToast }) {
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [show, setShow] = useState({})
  const [busy, setBusy] = useState(false)

  const KEY = 'security_prefs'
  const DEF = { twoFactor: false, sessionTimeout: '30', loginAlerts: true }
  const [prefs, setPrefs] = useState(() => load(KEY, DEF))

  const setPref = (k, v) => {
    const u = { ...prefs, [k]: v }
    setPrefs(u)
    localStorage.setItem(KEY, JSON.stringify(u))
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) { showToast('New passwords do not match', 'error'); return }
    if (pwForm.newPw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
    setBusy(true)
    try {
      await api.put('/users/me/password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      setPwForm({ current: '', newPw: '', confirm: '' })
      showToast('Password updated successfully')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update password', 'error')
    } finally { setBusy(false) }
  }

  const fields = [
    { key: 'current', label: 'Current Password' },
    { key: 'newPw',   label: 'New Password' },
    { key: 'confirm', label: 'Confirm New Password' },
  ]

  return (
    <div className="space-y-5">
      <Section title="Change Password" description="Update your account password">
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-sm text-slate-300 font-medium block mb-1.5">{f.label}</label>
              <div className="relative">
                <input type={show[f.key] ? 'text' : 'password'} value={pwForm[f.key]} required
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-blue-500" />
                <button type="button" onClick={() => setShow(s => ({ ...s, [f.key]: !s[f.key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {show[f.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            <Lock size={14} /> {busy ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </Section>

      <Section title="Security Preferences">
        <div className="space-y-5">
          {[
            { key: 'twoFactor',   label: 'Two-Factor Authentication', desc: 'Require a second factor when signing in' },
            { key: 'loginAlerts', label: 'Login Alerts',              desc: 'Get notified when a new session starts' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={!!prefs[item.key]} onChange={() => setPref(item.key, !prefs[item.key])} />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Session Timeout</p>
              <p className="text-xs text-slate-500 mt-0.5">Auto-sign out after inactivity</p>
            </div>
            <select value={prefs.sessionTimeout} onChange={e => setPref('sessionTimeout', e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="480">8 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ─── Notifications ────────────────────────────────────────── */
function NotificationsTab({ showToast }) {
  const KEY = 'notification_prefs'
  const DEF = {
    taskAssigned: true, taskCompleted: true, taskOverdue: true, taskBlocked: true,
    projectCreated: false, projectStatusChange: true, projectCompleted: true,
    teamMemberAdded: false, teamMemberRemoved: false,
    emailDigest: true, digestFrequency: 'daily', browserPush: false, inAppBell: true,
  }
  const [prefs, setPrefs] = useState(() => load(KEY, DEF))

  const set = (k, v) => {
    const u = { ...prefs, [k]: v }
    setPrefs(u)
    localStorage.setItem(KEY, JSON.stringify(u))
    showToast('Notification preferences saved')
  }

  const groups = [
    { title: 'Tasks', items: [
      { key: 'taskAssigned',  label: 'Task assigned to me',  desc: 'When a task is assigned to you' },
      { key: 'taskCompleted', label: 'Task completed',         desc: 'When a task you created is completed' },
      { key: 'taskOverdue',   label: 'Task overdue alert',    desc: 'When a task passes its due date' },
      { key: 'taskBlocked',   label: 'Task blocked',           desc: 'When a task is marked as Blocked' },
    ]},
    { title: 'Projects', items: [
      { key: 'projectCreated',      label: 'New project created',     desc: 'When a new project is added' },
      { key: 'projectStatusChange', label: 'Project status change',   desc: 'When project status updates' },
      { key: 'projectCompleted',    label: 'Project completed',       desc: 'When project reaches Completed' },
    ]},
    { title: 'Team', items: [
      { key: 'teamMemberAdded',   label: 'New team member',  desc: 'When someone joins the workspace' },
      { key: 'teamMemberRemoved', label: 'Member removed',   desc: 'When someone is removed' },
    ]},
  ]

  return (
    <div className="space-y-5">
      {groups.map(g => (
        <Section key={g.title} title={g.title}>
          <div className="space-y-4">
            {g.items.map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <Toggle checked={!!prefs[item.key]} onChange={() => set(item.key, !prefs[item.key])} />
              </div>
            ))}
          </div>
        </Section>
      ))}
      <Section title="Delivery" description="How and how often to receive notifications">
        <div className="space-y-5">
          {[
            { key: 'inAppBell',   label: 'In-app notifications', desc: 'Show bell icon in the header' },
            { key: 'browserPush', label: 'Browser push',          desc: 'Desktop push notifications' },
            { key: 'emailDigest', label: 'Email digest',          desc: 'Receive a summary email' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={!!prefs[item.key]} onChange={() => set(item.key, !prefs[item.key])} />
            </div>
          ))}
          {prefs.emailDigest && (
            <div className="flex items-center justify-between gap-4 pl-4 border-l-2 border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-300">Digest Frequency</p>
                <p className="text-xs text-slate-500">How often to send the email digest</p>
              </div>
              <select value={prefs.digestFrequency} onChange={e => set('digestFrequency', e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="realtime">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

/* ─── Appearance ───────────────────────────────────────────── */
function AppearanceTab({ showToast }) {
  const KEY = 'appearance_prefs'
  const DEF = { accentColor: 'blue', density: 'comfortable', animationsEnabled: true }
  const [prefs, setPrefs] = useState(() => load(KEY, DEF))

  const set = (k, v) => {
    const u = { ...prefs, [k]: v }
    setPrefs(u)
    localStorage.setItem(KEY, JSON.stringify(u))
    showToast('Appearance updated')
  }

  const COLORS = [
    { id: 'blue',   label: 'Blue',   cls: 'bg-blue-500' },
    { id: 'purple', label: 'Purple', cls: 'bg-purple-500' },
    { id: 'green',  label: 'Green',  cls: 'bg-green-500' },
    { id: 'orange', label: 'Orange', cls: 'bg-orange-500' },
    { id: 'red',    label: 'Red',    cls: 'bg-red-500' },
    { id: 'cyan',   label: 'Cyan',   cls: 'bg-cyan-500' },
  ]

  return (
    <div className="space-y-5">
      <Section title="Accent Color" description="Primary color used throughout the interface">
        <div className="flex gap-3 flex-wrap">
          {COLORS.map(c => (
            <button key={c.id} onClick={() => set('accentColor', c.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${prefs.accentColor === c.id ? 'border-white' : 'border-slate-700 hover:border-slate-500'}`}>
              <span className={`w-4 h-4 rounded-full ${c.cls}`} />
              <span className="text-sm text-white">{c.label}</span>
              {prefs.accentColor === c.id && <Check size={13} className="text-white" />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Layout">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-white mb-3">Density</p>
            <div className="flex gap-3 flex-wrap">
              {['compact', 'comfortable', 'spacious'].map(d => (
                <button key={d} onClick={() => set('density', d)}
                  className={`px-4 py-2.5 rounded-lg border text-sm capitalize transition-colors ${prefs.density === d ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Animations</p>
              <p className="text-xs text-slate-500 mt-0.5">Enable smooth transitions and motion effects</p>
            </div>
            <Toggle checked={!!prefs.animationsEnabled} onChange={() => set('animationsEnabled', !prefs.animationsEnabled)} />
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ─── API Keys ─────────────────────────────────────────────── */
function APIKeysTab({ showToast }) {
  const KEY = 'api_keys_v1'
  const [keys, setKeys] = useState(() => load(KEY, []))
  const [name, setName] = useState('')
  const [revealed, setRevealed] = useState({})

  const save = (k) => { setKeys(k); localStorage.setItem(KEY, JSON.stringify(k)) }

  const generate = () => {
    if (!name.trim()) { showToast('Enter a key name first', 'error'); return }
    const key = 'tm_live_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')
    const entry = { id: Date.now(), name: name.trim(), key, created: new Date().toISOString() }
    const updated = [entry, ...keys]
    save(updated)
    setName('')
    setRevealed(r => ({ ...r, [entry.id]: true }))
    showToast(`API key "${entry.name}" generated`)
  }

  const revoke = (id) => { save(keys.filter(k => k.id !== id)); showToast('Key revoked') }

  const copy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
    showToast('Copied to clipboard')
  }

  return (
    <div className="space-y-5">
      <Section title="Create API Key" description="API keys allow external tools to authenticate against the workspace">
        <div className="flex gap-3 max-w-md">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Key name (e.g. CI Pipeline)"
            onKeyDown={e => e.key === 'Enter' && generate()}
            className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500 text-sm" />
          <button onClick={generate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            <Key size={14} /> Generate
          </button>
        </div>
      </Section>

      <Section title={`API Keys (${keys.length})`} description="Never share your API keys — treat them like passwords">
        {keys.length > 0 ? (
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k.id} className="flex items-center gap-3 p-4 bg-slate-700/40 border border-slate-600 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Key size={13} className="text-blue-400" />
                    <span className="text-white font-medium text-sm">{k.name}</span>
                    <span className="text-xs text-slate-500">· {new Date(k.created).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                      {revealed[k.id] ? k.key : k.key.slice(0, 12) + '•'.repeat(20)}
                    </code>
                    <button onClick={() => setRevealed(r => ({ ...r, [k.id]: !r[k.id] }))}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors flex-shrink-0">
                      {revealed[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => copy(k.key)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors flex-shrink-0">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <button onClick={() => revoke(k.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500 text-sm">No API keys yet. Generate one above.</p>
          </div>
        )}
      </Section>
    </div>
  )
}

/* ─── Danger Zone ──────────────────────────────────────────── */
function DangerZoneTab({ showToast }) {
  return (
    <div className="space-y-4">
      <div className="bg-red-900/10 border border-red-700/40 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-400" />
          <h3 className="text-red-400 font-semibold">Danger Zone</h3>
        </div>
        <p className="text-slate-400 text-sm">These actions are irreversible. Please be absolutely certain before proceeding.</p>
        {[
          { title: 'Clear All Tasks',       desc: 'Permanently delete all tasks. Projects and members are preserved.', btn: 'Clear Tasks', red: false },
          { title: 'Reset Workspace Data',  desc: 'Remove all projects, tasks. Users keep their accounts.',          btn: 'Reset Data',  red: false },
          { title: 'Delete Workspace',      desc: 'Permanently delete this workspace and all associated data.',        btn: 'Delete Workspace', red: true },
        ].map(item => (
          <div key={item.title} className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${item.red ? 'bg-red-900/20 border-red-700/50' : 'bg-slate-800 border-slate-700'}`}>
            <div>
              <p className="text-white font-medium text-sm">{item.title}</p>
              <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
            </div>
            <button onClick={() => showToast('Disabled in demo mode', 'error')}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex-shrink-0 transition-colors ${item.red ? 'bg-red-600 hover:bg-red-700 text-white' : 'border border-red-700/30 text-red-400 hover:bg-red-900/20'}`}>
              {item.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-xl flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {toast.type === 'error' ? <AlertTriangle size={14} /> : <Check size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage workspace preferences, security, and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 h-fit space-y-1">
          {TABS.map(t => {
            const active = t.id === activeTab
            const danger = t.id === 'danger'
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? danger ? 'bg-red-900/30 text-red-400' : 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                    : danger ? 'text-red-400/70 hover:bg-red-900/10' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}>
                <t.icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}>
              {activeTab === 'general'       && <GeneralTab       showToast={showToast} />}
              {activeTab === 'security'      && <SecurityTab      showToast={showToast} />}
              {activeTab === 'notifications' && <NotificationsTab showToast={showToast} />}
              {activeTab === 'appearance'    && <AppearanceTab    showToast={showToast} />}
              {activeTab === 'api'           && <APIKeysTab       showToast={showToast} />}
              {activeTab === 'danger'        && <DangerZoneTab    showToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
