import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, MoreVertical } from 'lucide-react'
import api from '../services/api'

export default function ProjectsPage(){
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'In Progress', progress: 0 })

  const loadProjects = async () => {
    try{
      const res = await api.get('/projects')
      setProjects(res.data)
    }catch(e){ setProjects([]) }
  }

  useEffect(()=>{ loadProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try{
      await api.post('/projects', newProject)
      setNewProject({ name: '', description: '', status: 'In Progress', progress: 0 })
      setShowForm(false)
      loadProjects()
    }catch(e){ alert('Could not create project') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this project?')) return
    try{
      await api.delete(`/projects/${id}`)
      loadProjects()
    }catch(e){ alert('Could not delete project') }
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
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
        <button onClick={()=>handleDelete(project.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
          <MoreVertical size={18} />
        </button>
      </div>
      <p className="text-slate-400 text-sm mb-4">{project.description || 'No description'}</p>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs text-white font-semibold">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {(project.team || []).slice(0,3).map((m,i)=> (
            <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-semibold border-2 border-slate-800">{(m.fullName||m).split(' ')[0]?.slice(0,2).toUpperCase()}</div>
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
        <button onClick={()=>setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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

        <div className="flex gap-2 flex-wrap">
          {['all','In Progress','Planning','On Hold','Completed'].map(status => (
            <button key={status} onClick={()=>setFilter(status)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter===status? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              {status==='all' ? 'All Projects' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Create Form Modal (simple inline) */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 border border-slate-700 p-6 rounded-lg mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Project Name</label>
              <input value={newProject.name} onChange={e=>setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg mt-1" placeholder="Project name" required />
            </div>
            <div>
              <label className="text-sm text-slate-300">Description</label>
              <textarea value={newProject.description} onChange={e=>setNewProject({...newProject, description: e.target.value})} className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg mt-1 h-24" placeholder="Short description" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg text-white">Create</button>
              <button type="button" onClick={()=>setShowForm(false)} className="bg-slate-700 px-4 py-2 rounded-lg text-slate-300">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProjects.length > 0 ? filteredProjects.map(p => <ProjectCard key={p.id} project={p} />) : (
          <div className="col-span-full flex items-center justify-center py-16">
            <p className="text-slate-400 text-center">{search ? 'No projects match your search' : 'No projects found'}</p>
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
