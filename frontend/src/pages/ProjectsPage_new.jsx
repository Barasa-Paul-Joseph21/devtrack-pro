import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, MoreVertical } from 'lucide-react'
import api from '../services/api'

export default function ProjectsPage(){
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(()=>{
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(()=> setProjects([]))
  }, [])

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (p.status === filter)
    return matchesSearch && matchesFilter
  })

  const ProjectCard = ({ project }) => (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="inline-block bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded mb-2">
            {project.category || 'PROJECT'}
          </div>
          <h3 className="text-white font-semibold text-lg">{project.name}</h3>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={18} className="text-slate-400 hover:text-white" />
        </button>
      </div>
      
      <p className="text-slate-400 text-sm mb-4">{project.description || 'No description'}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs text-white font-semibold">{project.progress || 45}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
            style={{ width: `${project.progress || 45}%` }}
          ></div>
        </div>
      </div>

      {/* Team Avatars */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {['JD', 'SC', 'MK'].map((initials, i) => (
            <div 
              key={i}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-semibold border-2 border-slate-800"
            >
              {initials}
            </div>
          ))}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          project.status === 'In Progress' ? 'bg-blue-900/40 text-blue-300' :
          project.status === 'Planning' ? 'bg-yellow-900/40 text-yellow-300' :
          project.status === 'On Hold' ? 'bg-orange-900/40 text-orange-300' :
          'bg-green-900/40 text-green-300'
        }`}>
          {project.status || 'In Progress'}
        </span>
      </div>
    </motion.div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'In Progress', 'Planning', 'On Hold', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Projects' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-16">
            <p className="text-slate-400 text-center">
              {search ? 'No projects match your search' : 'No projects found'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">←</button>
          <button className="w-8 h-8 bg-blue-600 text-white rounded font-semibold">1</button>
          <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">2</button>
          <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">3</button>
          <button className="w-8 h-8 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:bg-slate-700">→</button>
        </div>
      )}
    </div>
  )
}
