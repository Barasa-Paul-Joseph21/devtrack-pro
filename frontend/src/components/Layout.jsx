import React, { useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { LogOut, Menu, X, LayoutDashboard, FolderOpen, CheckSquare, Users, Shield, BarChart3, FileText, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }){
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  if(isAuthPage) return children

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Projects', icon: FolderOpen, href: '/projects' },
    { label: 'Tasks', icon: CheckSquare, href: '/tasks' },
    { label: 'Team', icon: Users, href: '/team' },
    { label: 'Roles & Perms', icon: Shield, href: '/roles' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Reports', icon: FileText, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <MotionConfig transition={{ duration: 0.2 }}>
  <div className="flex h-screen bg-slate-900">
        {/* Sidebar */}
        <motion.aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 border-r border-slate-800 flex flex-col`} initial={false}>
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen && <div className="text-lg font-bold">TaskManager</div>}
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map(item => (
              <Link key={item.href} to={item.href} className={`flex items-center gap-3 px-3 py-2 rounded ${location.pathname === item.href ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-800 rounded text-sm">
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              {user && <span className="text-sm text-slate-400">Welcome back</span>}
            </div>
          </header>
          <motion.main className="flex-1 overflow-y-auto px-6 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {children}
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  )
}
