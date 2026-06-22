import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Plus, CheckCircle, Clock, FolderOpen, Users, X, Loader } from 'lucide-react'
import api from '../services/api'

const REPORT_TEMPLATES = [
  {
    id: 'projects',
    title: 'Project Summary',
    description: 'All projects with status, progress, task counts, and creation date.',
    icon: FolderOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-700/30',
  },
  {
    id: 'tasks',
    title: 'Task Report',
    description: 'All tasks with status, priority, assignee, project, and due date.',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/30',
    border: 'border-green-700/30',
  },
  {
    id: 'team',
    title: 'Team Performance',
    description: 'All team members with role, tasks assigned, completed, and completion rate.',
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-700/30',
  },
  {
    id: 'overdue',
    title: 'Overdue Tasks',
    description: 'Tasks past their due date that are not yet completed.',
    icon: Clock,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-700/30',
  },
]

function downloadCSV(filename, rows, headers) {
  const lines = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [generated, setGenerated] = useState(() => {
    try { return JSON.parse(localStorage.getItem('generated_reports') || '[]') } catch { return [] }
  })
  const [generating, setGenerating] = useState(null)
  const [toast, setToast] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const saveGenerated = (reports) => {
    setGenerated(reports)
    localStorage.setItem('generated_reports', JSON.stringify(reports))
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const generateReport = async (templateId) => {
    setGenerating(templateId)
    try {
      let filename, headers, rows

      if (templateId === 'projects') {
        const res = await api.get('/projects')
        const projects = res.data
        headers = ['ID', 'Name', 'Status', 'Progress', 'Total Tasks', 'Completed Tasks', 'Created At']
        rows = projects.map(p => [p.id, p.name, p.status, `${p.progress}%`, p.totalTasks, p.completedTasks, new Date(p.createdAt).toLocaleDateString()])
        filename = `projects-report-${new Date().toISOString().split('T')[0]}.csv`
      } else if (templateId === 'tasks') {
        const res = await api.get('/tasks')
        const tasks = res.data
        headers = ['ID', 'Title', 'Status', 'Priority', 'Project', 'Assignee', 'Due Date', 'Created At']
        rows = tasks.map(t => [t.id, t.title, t.status, t.priority, t.projectName || '', t.assigneeName || '', t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '', new Date(t.createdAt).toLocaleDateString()])
        filename = `tasks-report-${new Date().toISOString().split('T')[0]}.csv`
      } else if (templateId === 'team') {
        const res = await api.get('/users')
        const users = res.data
        headers = ['ID', 'Full Name', 'Email', 'Role', 'Tasks Assigned', 'Tasks Completed', 'Completion Rate', 'Joined']
        rows = users.map(u => {
          const rate = u.taskCount > 0 ? Math.round(u.completedTaskCount / u.taskCount * 100) : 0
          return [u.id, u.fullName, u.email, u.role, u.taskCount, u.completedTaskCount, `${rate}%`, new Date(u.createdAt).toLocaleDateString()]
        })
        filename = `team-report-${new Date().toISOString().split('T')[0]}.csv`
      } else if (templateId === 'overdue') {
        const res = await api.get('/tasks')
        const now = new Date()
        const overdue = res.data.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed')
        headers = ['ID', 'Title', 'Status', 'Priority', 'Project', 'Assignee', 'Due Date', 'Days Overdue']
        rows = overdue.map(t => {
          const daysOverdue = Math.floor((now - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
          return [t.id, t.title, t.status, t.priority, t.projectName || '', t.assigneeName || '', new Date(t.dueDate).toLocaleDateString(), daysOverdue]
        })
        filename = `overdue-tasks-${new Date().toISOString().split('T')[0]}.csv`
      }

      downloadCSV(filename, rows, headers)

      const template = REPORT_TEMPLATES.find(t => t.id === templateId)
      const newReport = {
        id: Date.now(),
        title: template.title,
        type: templateId,
        filename,
        rows: rows.length,
        generatedAt: new Date().toISOString(),
      }
      const updated = [newReport, ...generated].slice(0, 20)
      saveGenerated(updated)
      showToast(`"${template.title}" downloaded (${rows.length} rows)`)
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to generate report. Make sure you are logged in.', 'error')
    }
    finally { setGenerating(null) }
  }

  const deleteReport = (id) => {
    saveGenerated(generated.filter(r => r.id !== id))
    showToast('Report removed from history')
  }

  const filteredHistory = filterType === 'all' ? generated : generated.filter(r => r.type === filterType)

  const typeColors = {
    projects: 'bg-blue-900/30 text-blue-300',
    tasks:    'bg-green-900/30 text-green-300',
    team:     'bg-purple-900/30 text-purple-300',
    overdue:  'bg-red-900/30 text-red-300',
  }

  return (
    <div className="space-y-6">
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
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Generate and download CSV reports from live workspace data</p>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TEMPLATES.map(t => (
            <motion.div key={t.id} whileHover={{ y: -2 }}
              className={`bg-slate-800 border ${t.border} rounded-xl p-5 flex flex-col gap-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`p-2.5 rounded-lg ${t.bg}`}>
                  <t.icon size={20} className={t.color} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{t.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.description}</p>
              </div>
              <button
                onClick={() => generateReport(t.id)}
                disabled={generating === t.id}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {generating === t.id
                  ? <><Loader size={14} className="animate-spin" /> Generating…</>
                  : <><Download size={14} /> Generate CSV</>
                }
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Report History</h2>
          <div className="flex gap-2">
            {['all', 'projects', 'tasks', 'team', 'overdue'].map(f => (
              <button key={f} onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === f ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                {f === 'all' ? 'All' : REPORT_TEMPLATES.find(t => t.id === f)?.title || f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          {filteredHistory.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  {['Report', 'Type', 'Rows', 'Filename', 'Generated', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(r => (
                  <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-slate-500" />
                        <span className="text-sm text-white font-medium">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[r.type] || 'bg-slate-700 text-slate-400'}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-300">{r.rows} rows</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500 font-mono">{r.filename}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-400">
                        {new Date(r.generatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => generateReport(r.type)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors">
                          <Download size={14} />
                        </button>
                        <button onClick={() => deleteReport(r.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <FileText size={40} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500">No reports generated yet.</p>
              <p className="text-slate-600 text-sm mt-1">Click "Generate CSV" above to create your first report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
