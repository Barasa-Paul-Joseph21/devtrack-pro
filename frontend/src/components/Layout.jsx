import React, { useState, useRef, useEffect } from 'react'
import { MotionConfig, motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, FolderOpen, CheckSquare, Users, Shield, BarChart3, FileText, Settings, LogOut, User, ChevronDown, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  if (isAuthPage) return children

  const navItems = [
    { label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Projects',    icon: FolderOpen,      href: '/projects' },
    { label: 'Tasks',       icon: CheckSquare,     href: '/tasks' },
    { label: 'Team',        icon: Users,           href: '/team' },
    { label: 'Roles & Perms', icon: Shield,        href: '/roles' },
    { label: 'Analytics',   icon: BarChart3,       href: '/analytics' },
    { label: 'Reports',     icon: FileText,        href: '/reports' },
    { label: 'Settings',    icon: Settings,        href: '/settings' },
  ]

  const pageTitle = navItems.find(n => n.href === location.pathname)?.label
    || (location.pathname === '/profile' ? 'Profile' : 'Dashboard')

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <MotionConfig transition={{ duration: 0.2 }}>
      <div className="flex h-screen bg-slate-900">
        {/* Sidebar */}
        <motion.aside
          className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 border-r border-slate-800 flex flex-col`}
          initial={false}
        >
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen && <div className="text-lg font-bold">TaskManager</div>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${location.pathname === item.href ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">{pageTitle}</h1>

              {/* Profile Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                    {user.name && (
                      <span className="text-sm text-slate-300 hidden md:block">{user.name}</span>
                    )}
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-slate-700">
                          <p className="text-white text-sm font-semibold truncate">{user.name || 'User'}</p>
                          <p className="text-slate-400 text-xs truncate">{user.email || ''}</p>
                          {user.role && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-600/30 text-blue-400 rounded-full">{user.role}</span>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <User size={16} />
                            Profile
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <Settings size={16} />
                            Settings
                          </Link>
                          <div className="border-t border-slate-700 my-1" />
                          <button
                            onClick={() => { setProfileOpen(false); logout() }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </header>

          <motion.main
            className="flex-1 overflow-y-auto px-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  )
}
