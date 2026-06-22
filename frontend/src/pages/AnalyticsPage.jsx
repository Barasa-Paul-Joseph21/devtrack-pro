import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react'

export default function AnalyticsPage(){
  const metrics = [
    { label: 'Total Projects', value: '12', change: '+2', color: 'bg-blue-900/30' },
    { label: 'Active Tasks', value: '34', change: '+5', color: 'bg-green-900/30' },
    { label: 'Team Members', value: '8', change: '0', color: 'bg-purple-900/30' },
    { label: 'Completion Rate', value: '78%', change: '+3%', color: 'bg-orange-900/30' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Analytics & Metrics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-slate-800 border border-slate-700 p-6 rounded-lg"
          >
            <p className="text-slate-400 text-xs uppercase tracking-wide">{m.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{m.value}</p>
            <p className="text-xs text-green-400 mt-1">{m.change} vs last month</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800 border border-slate-700 p-6 rounded-lg"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Task Distribution
          </h2>
          <div className="space-y-4">
            {['Pending', 'In Progress', 'Completed', 'Blocked'].map((status, i) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">{status}</span>
                  <span className="font-semibold text-white">{(Math.random() * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800 border border-slate-700 p-6 rounded-lg"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Weekly Trends
          </h2>
          <div className="h-64 flex items-end justify-around gap-2">
            {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t w-8" style={{ height: `${h * 2}px` }}></div>
                <span className="text-xs text-slate-400 mt-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
