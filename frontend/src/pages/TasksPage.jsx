import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, GripVertical, Clock, AlertCircle } from 'lucide-react'
import api from '../services/api'

export default function TasksPage(){
  const [tasks, setTasks] = useState({})
  const [allTasks, setAllTasks] = useState([])

  useEffect(()=>{
    api.get('/tasks')
      .then(r => {
        setAllTasks(r.data)
        organizeTasks(r.data)
      })
      .catch(()=> {})
  }, [])

  const organizeTasks = (taskList) => {
    const organized = {
      BACKLOG: taskList.filter(t => t.status === 'BACKLOG' || !t.status) || [],
      'IN PROGRESS': taskList.filter(t => t.status === 'IN PROGRESS') || [],
      'CODE REVIEW': taskList.filter(t => t.status === 'CODE REVIEW') || [],
      DONE: taskList.filter(t => t.status === 'DONE') || []
    }
    setTasks(organized)
  }

  const getPriorityColor = (priority) => {
    switch(priority?.toUpperCase()){
      case 'CRITICAL':
        return 'bg-red-600'
      case 'HIGH':
        return 'bg-orange-600'
      case 'MEDIUM':
        return 'bg-blue-600'
      case 'LOW':
        return 'bg-slate-600'
      default:
        return 'bg-slate-600'
    }
  }

  const TaskCard = ({ task }) => (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-slate-700 border border-slate-600 rounded p-4 cursor-move hover:border-slate-500 transition-colors"
    >
      <div className="flex gap-2 items-start mb-3">
        <div className={`w-1 h-12 rounded-full ${getPriorityColor(task.priority)}`}></div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{task.title || task.name}</p>
          <p className="text-xs text-slate-400 mt-1">{task.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={14} />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-semibold">
          {task.assignedTo?.[0]?.toUpperCase() || '?'}
        </div>
      </div>
    </motion.div>
  )

  const Column = ({ title, count, columnTasks }) => (
    <motion.div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-full min-h-96">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-xs text-slate-400">{count} tasks</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {columnTasks && columnTasks.length > 0 ? (
          columnTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            No tasks
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kanban Board</h1>
          <p className="text-slate-400 text-sm">Active Sprint: 24-B • Sep 15 - Sep 29</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Filters</button>
        <button className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
          Sort By: Due Date
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Column title="BACKLOG" count={tasks['BACKLOG']?.length || 0} columnTasks={tasks['BACKLOG']} />
        <Column title="IN PROGRESS" count={tasks['IN PROGRESS']?.length || 0} columnTasks={tasks['IN PROGRESS']} />
        <Column title="CODE REVIEW" count={tasks['CODE REVIEW']?.length || 0} columnTasks={tasks['CODE REVIEW']} />
        <Column title="DONE" count={tasks['DONE']?.length || 0} columnTasks={tasks['DONE']} />
      </div>
    </div>
  )
}
