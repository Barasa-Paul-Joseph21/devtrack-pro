import React, { useState, useRef, useEffect } from 'react'
import { MotionConfig, motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, FolderOpen, CheckSquare, Users, Shield, BarChart3, FileText, Settings, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

const mainNav = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Projects',      icon: FolderOpen,      href: '/projects' },
  { label: 'Tasks',         icon: CheckSquare,     href: '/tasks' },
  { label: 'Team',          icon: Users,           href: '/team' },
  { label: 'Roles & Perms', icon: Shield,          href: '/roles' },
  { label: 'Analytics',     icon: BarChart3,       href: '/analytics' },
  { label: 'Reports',       icon: FileText,        href: '/reports' },
]

const bottomNav = [
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  if (isAuthPage) return children

  const allNav = [...mainNav, ...bottomNav]
  const pageTitle = allNav.find(n => n.href === location.pathname)?.label
    || (location.pathname === '/profile' ? 'Profile' : 'Dashboard')

  useEffect(() => {
    const h = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const NavLink = ({ item }) => {
    const active = location.pathname === item.href
    return (
      <Link
        to={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
          active
            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        title={!sidebarOpen ? item.label : undefined}
      >
        <item.icon size={18} className={`flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
        {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
      </Link>
    )
  }

  return (
    <MotionConfig transition={{ duration: 0.2 }}>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 240 : 72 }}
          className="bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 overflow-hidden"
        >
          {/* Logo */}
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-4 border-b border-slate-800 h-16`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">TM</span>
                </div>
                <span className="text-white font-bold text-sm">TaskManager Pro</span>
              </div>
            )}
            <button onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex-shrink-0">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Main Nav */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen && <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest px-3 pb-2">Main</p>}
            {mainNav.map(item => <NavLink key={item.href} item={item} />)}
          </nav>

          {/* Bottom Nav - Settings */}
          <div className="px-2 pb-4 pt-2 border-t border-slate-800 space-y-1">
            {sidebarOpen && <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest px-3 pb-2">System</p>}
            {bottomNav.map(item => <NavLink key={item.href} item={item} />)}
          </div>
        </motion.aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <header className="bg-slate-900 border-b border-slate-800 px-6 h-16 flex items-center justify-between flex-shrink-0">
            <h1 className="text-lg font-bold text-white">{pageTitle}</h1>

            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm text-white font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.role || 'Member'}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-white text-sm font-semibold truncate">{user.name || 'User'}</p>
                        <p className="text-slate-400 text-xs truncate">{user.email || ''}</p>
                        {user.role && (
                          <span className="inline-block mt-1.5 text-xs px-2 py-0.5 bg-blue-600/30 text-blue-400 rounded-full border border-blue-600/20">{user.role}</span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          <User size={15} /> Profile
                        </Link>
                        <Link to="/settings" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          <Settings size={15} /> Settings
                        </Link>
                        <div className="border-t border-slate-700 my-1" />
                        <button onClick={() => { setProfileOpen(false); logout() }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </header>

          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto px-6 py-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  )
}
