import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, CheckCircle, AlertTriangle, Clock, FolderOpen, Target } from 'lucide-react'
import api from '../services/api'

function StatCard({ label, value, sub, icon: Icon, color, loading }) {
  return (
    <motion.div whileHover={{ y: -2 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        {loading
          ? <div className="h-7 w-16 bg-slate-700 rounded animate-pulse mb-1" />
          : <p className="text-2xl font-bold text-white">{value}</p>
        }
        <p className="text-sm text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

function HBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-semibold text-white">{value} <span className="text-slate-500 text-xs">({pct}%)</span></span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-2.5 rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function Donut({ slices, size = 120 }) {
  const total = slices.reduce((a, s) => a + s.value, 0)
  if (total === 0) return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <p className="text-slate-600 text-xs text-center">No data</p>
    </div>
  )
  let offset = 0
  const radius = 45
  const circ = 2 * Math.PI * radius
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
      {slices.map((s, i) => {
        const pct = s.value / total
        const dash = pct * circ
        const gap = circ - dash
        const rotation = -90 + (offset * 360)
        offset += pct
        return (
          <circle key={i} cx="50" cy="50" r={radius} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={circ * 0.25 - (offset - pct) * circ}
            transform={`rotate(${rotation} 50 50)`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        )
      })}
      <text x="50" y="50" textAnchor="middle" dy="0.35em" fill="white" fontSize="16" fontWeight="bold">{total}</text>
    </svg>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats/detailed')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalTasks = data?.totalTasks || 0
  const taskSlices = [
    { label: 'Pending',     value: data?.tasksByStatus?.pending || 0,    color: '#64748b' },
    { label: 'In Progress', value: data?.tasksByStatus?.inProgress || 0, color: '#3b82f6' },
    { label: 'Blocked',     value: data?.tasksByStatus?.blocked || 0,    color: '#ef4444' },
    { label: 'Completed',   value: data?.tasksByStatus?.completed || 0,  color: '#22c55e' },
  ]

  const prioritySlices = [
    { label: 'Low',      value: data?.tasksByPriority?.low || 0,      color: '#64748b' },
    { label: 'Medium',   value: data?.tasksByPriority?.medium || 0,   color: '#3b82f6' },
    { label: 'High',     value: data?.tasksByPriority?.high || 0,     color: '#f97316' },
    { label: 'Critical', value: data?.tasksByPriority?.critical || 0, color: '#ef4444' },
  ]

  const totalProjects = data?.totalProjects || 0
  const projectSlices = [
    { label: 'Planning',     value: data?.projectsByStatus?.planning || 0,    color: '#eab308' },
    { label: 'In Progress',  value: data?.projectsByStatus?.inProgress || 0,  color: '#3b82f6' },
    { label: 'On Hold',      value: data?.projectsByStatus?.onHold || 0,      color: '#f97316' },
    { label: 'Completed',    value: data?.projectsByStatus?.completed || 0,   color: '#22c55e' },
    { label: 'Archived',     value: data?.projectsByStatus?.archived || 0,    color: '#475569' },
  ]

  const stats = [
    { label: 'Total Tasks',      value: data?.totalTasks ?? '—',     sub: `${data?.completedTasks ?? 0} completed`, icon: CheckCircle,   color: 'bg-green-600' },
    { label: 'Total Projects',   value: data?.totalProjects ?? '—',  sub: `${data?.projectsByStatus?.inProgress ?? 0} in progress`,   icon: FolderOpen,    color: 'bg-blue-600' },
    { label: 'Team Members',     value: data?.totalMembers ?? '—',   sub: 'registered users',                        icon: Users,         color: 'bg-purple-600' },
    { label: 'Completion Rate',  value: `${data?.completionRate ?? 0}%`, sub: 'tasks completed',                   icon: Target,        color: 'bg-orange-600' },
    { label: 'Overdue Tasks',    value: data?.overdueTasks ?? '—',   sub: 'past due date',                          icon: AlertTriangle, color: 'bg-red-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Live metrics from your workspace</p>
        </div>
        <button onClick={() => { setLoading(true); api.get('/stats/detailed').then(r => setData(r.data)).finally(() => setLoading(false)) }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Task Status Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-400" /> Task Status</h2>
          <div className="flex items-center justify-between gap-4">
            {loading
              ? <div className="w-28 h-28 rounded-full bg-slate-700 animate-pulse mx-auto" />
              : <Donut slices={taskSlices} size={130} />
            }
            <div className="flex-1 space-y-2">
              {taskSlices.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{loading ? '—' : s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-orange-400" /> Priority Split</h2>
          <div className="flex items-center justify-between gap-4">
            {loading
              ? <div className="w-28 h-28 rounded-full bg-slate-700 animate-pulse mx-auto" />
              : <Donut slices={prioritySlices} size={130} />
            }
            <div className="flex-1 space-y-2">
              {prioritySlices.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{loading ? '—' : s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FolderOpen size={18} className="text-yellow-400" /> Projects</h2>
          <div className="flex items-center justify-between gap-4">
            {loading
              ? <div className="w-28 h-28 rounded-full bg-slate-700 animate-pulse mx-auto" />
              : <Donut slices={projectSlices} size={130} />
            }
            <div className="flex-1 space-y-2">
              {projectSlices.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{loading ? '—' : s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Bars */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2"><TrendingUp size={18} className="text-blue-400" /> Task Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          <div className="space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">By Status</p>
            {taskSlices.map(s => (
              <HBar key={s.label} label={s.label} value={loading ? 0 : s.value} max={totalTasks} color={`bg-[${s.color}]`} />
            ))}
          </div>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">By Priority</p>
            {prioritySlices.map(s => (
              <HBar key={s.label} label={s.label} value={loading ? 0 : s.value} max={totalTasks} color={`bg-[${s.color}]`} />
            ))}
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Users size={18} className="text-purple-400" /> Team Workload</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-700 rounded animate-pulse" />)}
          </div>
        ) : data?.teamWorkload?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Member', 'Role', 'Total', 'In Progress', 'Completed', 'Blocked', 'Completion'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.teamWorkload.map(m => {
                  const rate = m.total > 0 ? Math.round(m.completed / m.total * 100) : 0
                  return (
                    <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                            {m.fullName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <span className="text-sm text-white">{m.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3"><span className="text-xs text-slate-400">{m.role}</span></td>
                      <td className="py-3 px-3"><span className="text-sm font-semibold text-white">{m.total}</span></td>
                      <td className="py-3 px-3"><span className="text-sm text-blue-400">{m.inProgress}</span></td>
                      <td className="py-3 px-3"><span className="text-sm text-green-400">{m.completed}</span></td>
                      <td className="py-3 px-3"><span className="text-sm text-red-400">{m.blocked}</span></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-blue-500' : 'bg-slate-500'}`}
                              style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Users size={36} className="mx-auto mb-3 text-slate-700" />
            <p>No team data yet. Add members and assign tasks to see workload.</p>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      {data?.recentProjects?.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FolderOpen size={18} className="text-blue-400" /> Recent Projects</h2>
          <div className="space-y-3">
            {data.recentProjects.map(p => {
              const rate = p.taskCount > 0 ? Math.round(p.completedCount / p.taskCount * 100) : p.progress || 0
              return (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-sm font-medium truncate">{p.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        p.status === 'Completed' ? 'bg-green-900/50 text-green-400' :
                        p.status === 'In Progress' ? 'bg-blue-900/50 text-blue-400' :
                        p.status === 'On Hold' ? 'bg-orange-900/50 text-orange-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>{p.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${rate === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{rate}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">{p.taskCount}</p>
                    <p className="text-xs text-slate-500">tasks</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
