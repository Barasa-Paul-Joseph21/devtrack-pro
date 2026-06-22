import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MoreVertical, Edit2, Trash2, Copy, CheckCircle, Clock, PauseCircle, Archive, FolderOpen, ChevronRight, X, AlertCircle } from 'lucide-react'
import api from '../services/api'

const STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Archived']

const STATUS_STYLES = {
  'Planning':    { bg: 'bg-yellow-900/40', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  'In Progress': { bg: 'bg-blue-900/40',   text: 'text-blue-300',   dot: 'bg-blue-400' },
  'On Hold':     { bg: 'bg-orange-900/40', text: 'text-orange-300', dot: 'bg-orange-400' },
  'Completed':   { bg: 'bg-green-900/40',  text: 'text-green-300',  dot: 'bg-green-400' },
  'Archived':    { bg: 'bg-slate-700/40',  text: 'text-slate-400',  dot: 'bg-slate-500' },
}

const STATUS_ICONS = {
  'Planning':    <Clock size={14} />,
  'In Progress': <AlertCircle size={14} />,
  'On Hold':     <PauseCircle size={14} />,
  'Completed':   <CheckCircle size={14} />,
  'Archived':    <Archive size={14} />,
}

function Modal({ open, onClose, title, children }) {
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
        className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </div>
  )
}

function ConfirmModal({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          Confirm
        </button>
      </div>
    </Modal>
  )
}

function ProjectForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || { name: '', description: '', status: 'Planning', progress: 0 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Project Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} required
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          placeholder="e.g. Backend Refactor" />
      </div>
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
          placeholder="What is this project about?" />
      </div>
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">Status</label>
        <select value={form.status} onChange={e => set('status', e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-300 font-medium block mb-1.5">
          Manual Progress — <span className="text-blue-400">{form.progress}%</span>
        </label>
        <input type="range" min={0} max={100} value={form.progress} onChange={e => set('progress', +e.target.value)}
          className="w-full accent-blue-500" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : 'Save Project'}
        </button>
      </div>
    </form>
  )
}

function CardMenu({ project, onEdit, onDuplicate, onChangeStatus, onArchive, onDelete }) {
  const [open, setOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setStatusOpen(false) } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const action = (fn) => { setOpen(false); setStatusOpen(false); fn() }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded hover:bg-slate-600 text-slate-400 hover:text-white transition-colors">
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 py-1 overflow-hidden"
          >
            <button onClick={() => action(onEdit)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Edit2 size={14} /> Edit Project
            </button>
            <button onClick={() => action(onDuplicate)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Copy size={14} /> Duplicate
            </button>

            <div className="border-t border-slate-700 my-1" />
            <div className="relative">
              <button onClick={() => setStatusOpen(o => !o)}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="flex items-center gap-3"><CheckCircle size={14} /> Change Status</span>
                <ChevronRight size={14} className={`transition-transform ${statusOpen ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {statusOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/80 overflow-hidden"
                  >
                    {STATUSES.filter(s => s !== 'Archived' && s !== project.status).map(s => (
                      <button key={s} onClick={() => action(() => onChangeStatus(s))}
                        className="flex items-center gap-3 w-full px-6 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s]?.dot}`} />
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-slate-700 my-1" />
            <button onClick={() => action(onArchive)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Archive size={14} /> Archive
            </button>

            <div className="border-t border-slate-700 my-1" />
            <button onClick={() => action(onDelete)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 size={14} /> Delete Project
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectCard({ project, onEdit, onDuplicate, onChangeStatus, onArchive, onDelete }) {
  const totalTasks = project.totalTasks || 0
  const completedTasks = project.completedTasks || 0
  const progress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : (project.progress || 0)
  const style = STATUS_STYLES[project.status] || STATUS_STYLES['Planning']

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -3 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors group flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full mb-2 ${style.bg} ${style.text}`}>
            {STATUS_ICONS[project.status]}
            {project.status || 'Planning'}
          </div>
          <h3 className="text-white font-semibold text-base leading-tight truncate">{project.name}</h3>
        </div>
        <CardMenu
          project={project}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onChangeStatus={onChangeStatus}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description provided.'}
      </p>

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs text-white font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-1.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <FolderOpen size={13} />
          <span>{totalTasks} task{totalTasks !== 1 ? 's' : ''}</span>
          {totalTasks > 0 && <span className="text-slate-600">·</span>}
          {totalTasks > 0 && <span className="text-green-400">{completedTasks} done</span>}
        </div>
        <span className="text-xs text-slate-500">
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)

  const [showNew, setShowNew] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [deleteProject, setDeleteProject] = useState(null)

  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    setFormLoading(true)
    try {
      await api.post('/projects', form)
      setShowNew(false)
      await load()
      showToast('Project created successfully')
    } catch { showToast('Could not create project', 'error') }
    finally { setFormLoading(false) }
  }

  const handleEdit = async (form) => {
    setFormLoading(true)
    try {
      await api.put(`/projects/${editProject.id}`, form)
      setEditProject(null)
      await load()
      showToast('Project updated')
    } catch { showToast('Could not update project', 'error') }
    finally { setFormLoading(false) }
  }

  const handleChangeStatus = async (project, status) => {
    try {
      await api.patch(`/projects/${project.id}/status`, { status })
      await load()
      showToast(`Moved to "${status}"`)
    } catch { showToast('Could not update status', 'error') }
  }

  const handleArchive = async (project) => {
    try {
      await api.patch(`/projects/${project.id}/status`, { status: 'Archived' })
      await load()
      showToast('Project archived')
    } catch { showToast('Could not archive project', 'error') }
  }

  const handleDuplicate = async (project) => {
    try {
      await api.post(`/projects/${project.id}/duplicate`)
      await load()
      showToast('Project duplicated')
    } catch { showToast('Could not duplicate', 'error') }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteProject.id}`)
      setDeleteProject(null)
      await load()
      showToast('Project deleted')
    } catch { showToast('Could not delete project', 'error') }
  }

  const filtered = projects.filter(p => {
    const matchesSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || p.status === filter
    return matchesSearch && matchesFilter
  })

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = projects.filter(p => p.status === s).length
    return acc
  }, {})

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {STATUSES.map(s => {
          const style = STATUS_STYLES[s]
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`p-3 rounded-lg border text-left transition-colors ${filter === s ? 'border-blue-500 bg-blue-600/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
              <div className={`text-2xl font-bold ${filter === s ? 'text-white' : style.text}`}>{counts[s]}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s}</div>
            </button>
          )
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
              <div className="h-5 bg-slate-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-full mb-1" />
              <div className="h-3 bg-slate-700 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onEdit={() => setEditProject(p)}
                onDuplicate={() => handleDuplicate(p)}
                onChangeStatus={(s) => handleChangeStatus(p, s)}
                onArchive={() => handleArchive(p)}
                onDelete={() => setDeleteProject(p)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 text-lg font-medium">
            {search ? 'No projects match your search' : filter !== 'all' ? `No ${filter} projects` : 'No projects yet'}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {!search && filter === 'all' && 'Create your first project to get started'}
          </p>
          {!search && filter === 'all' && (
            <button onClick={() => setShowNew(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              + New Project
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showNew && (
          <Modal open={showNew} onClose={() => setShowNew(false)} title="New Project">
            <ProjectForm onSubmit={handleCreate} onClose={() => setShowNew(false)} loading={formLoading} />
          </Modal>
        )}
        {editProject && (
          <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
            <ProjectForm initial={editProject} onSubmit={handleEdit} onClose={() => setEditProject(null)} loading={formLoading} />
          </Modal>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteProject?.name}"? All tasks within it will also be deleted. This cannot be undone.`}
        danger
      />
    </div>
  )
}
