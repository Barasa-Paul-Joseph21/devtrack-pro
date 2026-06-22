import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Zap, CheckCircle2, Users, TrendingUp } from 'lucide-react'
import api from '../services/api'

export default function Dashboard(){
  const [stats, setStats] = useState({ projects: 0, tasks: 0, users: 0 })

  useEffect(()=>{
    Promise.all([
      api.get('/projects').then(r => r.data.length),
      api.get('/tasks').then(r => r.data.length),
      api.get('/users').then(r => r.data.length).catch(() => 0)
    ]).then(([projects, tasks, users]) => {
      setStats({ projects, tasks, users })
    }).catch(()=>{})
  }, [])

  const StatCard = ({ icon: Icon, label, value, sublabel, color }) => (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-slate-800 border border-slate-700 p-6 rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={FolderOpen} label="Total Projects" value={stats.projects} sublabel="+2 this month" color="bg-blue-900/30" />
        <StatCard icon={Zap} label="Active Tasks" value={stats.tasks} sublabel="12 urgent" color="bg-green-900/30" />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value="892" sublabel="94% efficiency" color="bg-purple-900/30" />
        <StatCard icon={Users} label="Team Members" value={stats.users} sublabel="4 teams" color="bg-orange-900/30" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <motion.div className="lg:col-span-2 bg-gradient-to-b from-slate-900/50 to-slate-900/30 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Task Completion Trends</h3>
              <p className="text-slate-400 text-sm">Velocity over the last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 rounded">W</button>
              <button className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 rounded">M</button>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            {/* Placeholder curve */}
            <div className="w-full h-40 bg-gradient-to-r from-slate-800 to-slate-850 rounded-lg"></div>
          </div>
        </motion.div>

        {/* Project Progress */}
        <motion.div className="bg-gradient-to-b from-slate-900/50 to-slate-900/30 border border-slate-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-white font-semibold mb-4">Project Progress</h3>
          <p className="text-slate-400 text-sm mb-4">Active workload distribution</p>
          <div className="flex items-center gap-4">
            <div className="relative w-36 h-36">
              <div className="absolute inset-0 rounded-full border-8 border-slate-800"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">68%</div>
                  <div className="text-xs text-slate-400">AVERAGE</div>
                </div>
              </div>
            </div>
            <div className="flex-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-300">Infrastructure</span><span className="text-white">42%</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Refactoring</span><span className="text-white">26%</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Maintenance</span><span className="text-white">32%</span></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 bg-gradient-to-b from-slate-900/50 to-slate-900/30 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <a href="#" className="text-blue-400 text-sm hover:underline">View All →</a>
          </div>
          <div className="space-y-4">
            {[
              { icon: '⚙️', text: 'Merged pull request #4202 into main', time: '2 hours ago', author: 'Alex Rivera' },
              { icon: '⚠️', text: 'New high-priority issue detected: Memory Leak in AuthService', time: '5 hours ago', author: 'System Monitor' },
              { icon: '👥', text: 'Sarah Connor joined the Kernel Engineering team', time: 'Yesterday', author: 'HR Portal' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-800 last:border-0">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">{item.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.time} • {item.author}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="bg-gradient-to-b from-slate-900/50 to-slate-900/30 border border-slate-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-white font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {[
              { title: 'API Documentation v3', project: 'Developer Experience', time: 'IN 2 HOURS', urgent: true },
              { title: 'Database Migration', project: 'Infrastructure Ops', time: 'IN 2 DAYS', urgent: false },
              { title: 'UI Component Library', project: 'Core UI System', time: 'IN 5 DAYS', urgent: false }
            ].map((deadline, i) => (
              <div key={i} className={`p-3 rounded-lg ${deadline.urgent ? 'bg-slate-800/60 border border-red-700/30' : 'bg-slate-800/40 border border-slate-800'}`}>
                <p className="text-white text-sm font-medium">{deadline.title}</p>
                <p className="text-xs text-slate-400">{deadline.project}</p>
                <p className={`text-xs mt-1 ${deadline.urgent ? 'text-red-400' : 'text-slate-400'}`}>{deadline.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

