import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Filter, Plus } from 'lucide-react'

export default function ReportsPage(){
  const [filterType, setFilterType] = useState('all')

  const reports = [
    { id: 1, title: 'Project Summary', date: '2026-06-22', type: 'project', size: '2.4 MB' },
    { id: 2, title: 'Task Completion Report', date: '2026-06-21', type: 'task', size: '1.8 MB' },
    { id: 3, title: 'Team Performance', date: '2026-06-20', type: 'team', size: '3.2 MB' },
    { id: 4, title: 'Monthly Overview', date: '2026-06-15', type: 'project', size: '2.1 MB' },
    { id: 5, title: 'Resource Allocation', date: '2026-06-10', type: 'team', size: '1.5 MB' }
  ]

  const filtered = filterType === 'all' ? reports : reports.filter(r => r.type === filterType)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Reports & Documentation</h1>
        <div className="flex items-center gap-3">
          <button className="bg-slate-800/40 border border-slate-700 text-white px-4 py-2 rounded-lg">Filter</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Custom Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Sprint Summary</h3>
              <p className="text-slate-400 text-sm mt-2">Comprehensive review of velocity, burn-down metrics, and completed vs. planned tasks for the current cycle.</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg"><FileText className="text-blue-400" /></div>
          </div>
          <div className="mt-4"><button className="bg-slate-800/40 px-3 py-1 rounded text-slate-300">Generate</button></div>
        </div>

        <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Resource Allocation</h3>
              <p className="text-slate-400 text-sm mt-2">Analyze team distribution across projects. Identify bottlenecks and under-utilized resources.</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg"><FileText className="text-purple-400" /></div>
          </div>
          <div className="mt-4"><button className="bg-slate-800/40 px-3 py-1 rounded text-slate-300">Generate</button></div>
        </div>

        <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Security Audit</h3>
              <p className="text-slate-400 text-sm mt-2">Deep scan of infrastructure vulnerabilities, access logs, and compliance drift across all clusters.</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg"><FileText className="text-red-400" /></div>
          </div>
          <div className="mt-4"><button className="bg-slate-800/40 px-3 py-1 rounded text-slate-300">Generate</button></div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Generated Reports</h3>
          <div className="text-xs text-slate-400">AUTO-REFRESH: ENABLED</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-800">
                <th className="px-4 py-3">REPORT NAME</th>
                <th className="px-4 py-3">FORMAT</th>
                <th className="px-4 py-3">DATE GENERATED</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-white">{r.title}</td>
                  <td className="px-4 py-3 text-slate-400">PDF</td>
                  <td className="px-4 py-3 text-slate-400">{r.date}</td>
                  <td className="px-4 py-3"><span className="bg-green-800 text-green-300 px-2 py-1 rounded-full text-xs">SUCCESS</span></td>
                  <td className="px-4 py-3 text-slate-400"> <button className="px-2 py-1 hover:text-white">↴</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
