import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, MoreVertical, Clock, ChevronRight, X, Edit2, Trash2, User,
  AlertTriangle, CheckCircle2, Layers, Search, Filter
} from 'lucide-react'
import api from '../services/api'

const STATUSES = ['Pending', 'In Progress', 'Blocked', 'Completed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const STATUS_STYLES = {
  'Pending':     { header: 'border-slate-600', dot: 'bg-slate-400',  badge: 'bg-slate-700 text-slate-300' },
  'In Progress': { header: 'border-blue-500',  dot: 'bg-blue-400',   badge: 'bg-blue-900/50 text-blue-300' },
  'Blocked':     { header: 'border-red-500',   dot: 'bg-red-400',    badge: 'bg-red-900/50 text-red-300' },
  'Completed':   { header: 'border-green-500', dot: 'bg-green-400',  badge: 'bg-green-900/50 text-green-300' },
}

const PRIORITY_STYLES = {
  'Low':      { bar: 'bg-slate-500',  badge: 'bg-slate-700 text-slate-400',      dot: 'bg-slate-400' },
  'Medium':   { bar: 'bg-blue-500',   badge: 'bg-blue-900/40 text-blue-400',     dot: 'bg-blue-400' },
  'High':     { bar: 'bg-orange-500', badge: 'bg-orange-900/40 text-orange-400', dot: 'bg-orange-400' },
  'Critical': { bar: 'bg-red-600',    badge: 'bg-red-900/40 text-red-400',       dot: 'bg-red-400' },
}

/* Sanitise the form before sending to the API.
   Empty strings MUST become null for int? and DateTime? fields;
   ASP.NET model binding returns 400 otherwise. */
function buildPayload(form, defaultStatus) {
  return {
    title:       form.title,
    description: form.description || null,
    priority:    form.priority || 'Medium',
    status:      form.status   || defaultStatus || 'Pending',
    projectId:   parseInt(form.projectId, 10),          // always an int
    assignedTo:  form.assignedTo ? parseInt(form.assignedTo, 10) : null,
    dueDate:     form.dueDate   || null,
  }
}

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Modal wrapper ─────────────────────────────────────────── */
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.15 }}
        className={`relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl ${wide ? 'w-full max-w-xl' : 'w-full max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  )
}

/* ─── Task Form ─────────────────────────────────────────────── */
function TaskForm({ initial, projects, users, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', priority: 'Medium', status: 'Pending',
    projectId: '', assignedTo: '', dueDate: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const activeProjects = projects.filter(p => p.status !== 'Archived')

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      {/* Title */}
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Title *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} required
          placeholder="What needs to be done?"
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500" />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
          placeholder="Add details, context, or acceptance criteria…"
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none" />
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-300 font-medium block mb-1.5">Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-300 font-medium block mb-1.5">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Project */}
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Project *</label>
        <select value={form.projectId} onChange={e => set('projectId', e.target.value)}
          required className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
          <option value="">— Select a project —</option>
          {activeProjects.map(p => (
            <option key={p.id} value={p.id}>{p.name}{p.status !== 'In Progress' ? ` (${p.status})` : ''}</option>
          ))}
        </select>
        {activeProjects.length === 0 && (
          <p className="text-xs text-yellow-400 mt-1">⚠ No active projects. Create a project first.</p>
        )}
      </div>

      {/* Assignee */}
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Assign To</label>
        <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
          <option value="">— Unassigned —</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
          ))}
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Due Date</label>
        <input type="date" value={form.dueDate ? form.dueDate.split('T')[0] : ''}
          onChange={e => set('dueDate', e.target.value || '')}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading || !form.projectId}
          className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : 'Save Task'}
        </button>
      </div>
    </form>
  )
}

/* ─── Task Detail Modal ─────────────────────────────────────── */
function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  if (!task) return null
  const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
  const sStyle = STATUS_STYLES[task.status]   || STATUS_STYLES.Pending
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  return (
    <Modal open={!!task} onClose={onClose} title="Task Details" wide>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-1.5 flex-shrink-0 self-stretch rounded-full ${pStyle.bar}`} style={{ minHeight: 56 }} />
          <div>
            <h3 className="text-white font-semibold text-lg leading-tight">{task.title}</h3>
            {task.description && <p className="text-slate-400 text-sm mt-1">{task.description}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Status',   val: <span className={`text-xs px-2 py-1 rounded-full ${sStyle.badge}`}>{task.status}</span> },
            { label: 'Priority', val: <span className={`text-xs px-2 py-1 rounded-full ${pStyle.badge}`}>{task.priority}</span> },
            { label: 'Project',  val: <span className="text-white text-sm">{task.projectName || '—'}</span> },
            { label: 'Assignee', val: <span className="text-white text-sm">{task.assigneeName || 'Unassigned'}</span> },
            task.dueDate ? { label: 'Due Date', val: (
              <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {isOverdue && ' (overdue)'}
              </span>
            )} : null,
            { label: 'Created', val: <span className="text-white text-sm">{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
          ].filter(Boolean).map(({ label, val }) => (
            <div key={label} className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              {val}
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2 border-t border-slate-700">
          <button onClick={() => { onClose(); onEdit(task) }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
            <Edit2 size={14} /> Edit
          </button>
          <button onClick={() => { onClose(); onDelete(task) }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ─── Task Card 3-dot menu ──────────────────────────────────── */
function TaskCardMenu({ task, onEdit, onDelete, onStatusChange, onPriorityChange }) {
  const [open, setOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setStatusOpen(false); setPriorityOpen(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const action = fn => { setOpen(false); setStatusOpen(false); setPriorityOpen(false); fn() }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        className="p-1 rounded hover:bg-slate-600 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
        <MoreVertical size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.1 }}
            className="absolute right-0 top-7 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 py-1 overflow-hidden">
            <button onClick={() => action(onEdit)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
              <Edit2 size={13} /> Edit Task
            </button>
            <div className="border-t border-slate-700 my-1" />
            {/* Move to → */}
            <button onClick={() => { setStatusOpen(o => !o); setPriorityOpen(false) }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
              <span className="flex items-center gap-3"><Layers size={13} /> Move to</span>
              <ChevronRight size={12} className={`transition-transform ${statusOpen ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {statusOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-900/60 overflow-hidden">
                  {STATUSES.filter(s => s !== task.status).map(s => (
                    <button key={s} onClick={() => action(() => onStatusChange(s))}
                      className="flex items-center gap-2 w-full px-5 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700">
                      <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s]?.dot}`} />{s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Priority → */}
            <button onClick={() => { setPriorityOpen(o => !o); setStatusOpen(false) }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
              <span className="flex items-center gap-3"><AlertTriangle size={13} /> Priority</span>
              <ChevronRight size={12} className={`transition-transform ${priorityOpen ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {priorityOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-900/60 overflow-hidden">
                  {PRIORITIES.filter(p => p !== task.priority).map(p => (
                    <button key={p} onClick={() => action(() => onPriorityChange(p))}
                      className="flex items-center gap-2 w-full px-5 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700">
                      <span className={`w-2 h-2 rounded-full ${PRIORITY_STYLES[p]?.dot}`} />{p}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="border-t border-slate-700 my-1" />
            <button onClick={() => action(onDelete)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
              <Trash2 size={13} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Task Card ─────────────────────────────────────────────── */
function TaskCard({ task, onClick, onEdit, onDelete, onStatusChange, onPriorityChange }) {
  const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }} onClick={() => onClick(task)}
      className="bg-slate-700/60 border border-slate-600/60 rounded-lg p-3.5 cursor-pointer hover:border-slate-500 hover:bg-slate-700 transition-colors group relative">
      <div className="flex items-start gap-2.5">
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${pStyle.bar}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="text-white text-sm font-medium leading-tight line-clamp-2">{task.title}</p>
            <TaskCardMenu task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)}
              onStatusChange={s => onStatusChange(task, s)} onPriorityChange={p => onPriorityChange(task, p)} />
          </div>
          {task.description && <p className="text-xs text-slate-400 line-clamp-1 mb-2">{task.description}</p>}
          <div className="flex items-center justify-between flex-wrap gap-1.5 mt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs px-1.5 py-0.5 rounded ${pStyle.badge}`}>{task.priority}</span>
              {task.projectName && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-600/60 text-slate-400 truncate max-w-[100px]">{task.projectName}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                  <Clock size={11} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {task.assigneeName ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                  title={task.assigneeName}>
                  {task.assigneeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <User size={10} className="text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Kanban Column ─────────────────────────────────────────── */
function Column({ status, tasks, onAddTask, onTaskClick, onEdit, onDelete, onStatusChange, onPriorityChange }) {
  const style = STATUS_STYLES[status]
  const icons = {
    'Pending':     <Layers size={14} />,
    'In Progress': <AlertTriangle size={14} />,
    'Blocked':     <AlertTriangle size={14} />,
    'Completed':   <CheckCircle2 size={14} />,
  }
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col min-h-96">
      <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${style.header}`}>
        <div className="flex items-center gap-2">
          <span className={`${style.badge} text-xs`}>{icons[status]}</span>
          <h3 className="text-white font-semibold text-sm">{status}</h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={() => onAddTask(status)} title="Add task"
          className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded transition-colors">
          <Plus size={15} />
        </button>
      </div>
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        <AnimatePresence>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick}
              onEdit={onEdit} onDelete={onDelete}
              onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 text-slate-600 text-sm gap-2">
            <p>No tasks</p>
            <button onClick={() => onAddTask(status)} className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2">
              + Add task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function TasksPage() {
  const [allTasks, setAllTasks]   = useState([])
  const [projects, setProjects]   = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [formLoading, setFormLoading] = useState(false)

  const [showNew, setShowNew]           = useState(false)
  const [newDefaultStatus, setNewDefaultStatus] = useState('Pending')
  const [editTask, setEditTask]         = useState(null)
  const [detailTask, setDetailTask]     = useState(null)
  const [deleteTask, setDeleteTask]     = useState(null)
  const [toast, setToast]               = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadAll = useCallback(async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users'),
      ])
      setAllTasks(tasksRes.data)
      setProjects(projectsRes.data)
      setUsers(usersRes.data)
    } catch (e) {
      if (e?.response?.status === 401) showToast('Session expired — please log in again', 'error')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  /* filtered + grouped */
  const filteredTasks = allTasks.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.projectName?.toLowerCase().includes(q) ||
      t.assigneeName?.toLowerCase().includes(q)
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchSearch && matchPriority
  })

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filteredTasks.filter(t => t.status === s)
    return acc
  }, {})

  const stats = {
    total:     allTasks.length,
    completed: allTasks.filter(t => t.status === 'Completed').length,
    blocked:   allTasks.filter(t => t.status === 'Blocked').length,
    overdue:   allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
  }

  /* ── CRUD handlers ─────────────────────────────────────────── */
  const handleCreate = async (form) => {
    if (!form.projectId) { showToast('Please select a project', 'error'); return }
    setFormLoading(true)
    try {
      const payload = buildPayload(form, newDefaultStatus)
      await api.post('/tasks', payload)
      setShowNew(false)
      await loadAll()
      showToast('Task created successfully')
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.title || 'Could not create task'
      showToast(msg, 'error')
    } finally { setFormLoading(false) }
  }

  const handleEdit = async (form) => {
    if (!form.projectId) { showToast('Please select a project', 'error'); return }
    setFormLoading(true)
    try {
      const payload = buildPayload(form, form.status)
      await api.put(`/tasks/${editTask.id}`, payload)
      setEditTask(null)
      await loadAll()
      showToast('Task updated')
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.title || 'Could not update task'
      showToast(msg, 'error')
    } finally { setFormLoading(false) }
  }

  const handleStatusChange = async (task, status) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status })
      setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t))
      showToast(`Moved to "${status}"`)
    } catch { showToast('Could not update status', 'error') }
  }

  const handlePriorityChange = async (task, priority) => {
    try {
      await api.patch(`/tasks/${task.id}/priority`, { priority })
      setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority } : t))
      showToast(`Priority set to "${priority}"`)
    } catch { showToast('Could not update priority', 'error') }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteTask.id}`)
      setDeleteTask(null)
      await loadAll()
      showToast('Task deleted')
    } catch { showToast('Could not delete task', 'error') }
  }

  return (
    <div>
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
          <p className="text-slate-400 text-sm mt-1">
            {stats.total} tasks · {stats.completed} completed
            {stats.blocked > 0 && <span className="text-red-400"> · {stats.blocked} blocked</span>}
            {stats.overdue > 0 && <span className="text-orange-400"> · {stats.overdue} overdue</span>}
          </p>
        </div>
        <button onClick={() => { setNewDefaultStatus('Pending'); setShowNew(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium">
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input type="text" placeholder="Search tasks by title, project, or assignee…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...PRIORITIES].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${priorityFilter === p ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map(s => (
            <div key={s} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 animate-pulse min-h-64">
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
              {[1, 2].map(i => <div key={i} className="h-20 bg-slate-800 rounded-lg mb-3" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map(status => (
            <Column key={status} status={status} tasks={tasksByStatus[status] || []}
              onAddTask={s => { setNewDefaultStatus(s); setShowNew(true) }}
              onTaskClick={setDetailTask} onEdit={setEditTask} onDelete={setDeleteTask}
              onStatusChange={handleStatusChange} onPriorityChange={handlePriorityChange} />
          ))}
        </div>
      )}

      {/* New Task Modal */}
      <AnimatePresence>
        {showNew && (
          <Modal open={showNew} onClose={() => setShowNew(false)} title="New Task" wide>
            <TaskForm
              initial={{ title: '', description: '', priority: 'Medium', status: newDefaultStatus, projectId: '', assignedTo: '', dueDate: '' }}
              projects={projects} users={users}
              onSubmit={handleCreate} onClose={() => setShowNew(false)} loading={formLoading}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editTask && (
          <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" wide>
            <TaskForm
              initial={{ ...editTask, projectId: editTask.projectId || '', assignedTo: editTask.assignedTo || '', dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '' }}
              projects={projects} users={users}
              onSubmit={handleEdit} onClose={() => setEditTask(null)} loading={formLoading}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)}
        onEdit={t => { setDetailTask(null); setEditTask(t) }}
        onDelete={t => { setDetailTask(null); setDeleteTask(t) }} />

      {/* Delete Confirm Modal */}
      {deleteTask && (
        <Modal open={!!deleteTask} onClose={() => setDeleteTask(null)} title="Delete Task">
          <p className="text-slate-400 text-sm mb-6">
            Are you sure you want to delete <span className="text-white font-medium">"{deleteTask.title}"</span>?
            This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTask(null)}
              className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Delete Task
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
