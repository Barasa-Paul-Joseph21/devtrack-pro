import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User } from 'lucide-react'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Developer')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Registration failed')
      }
      const data = await res.json()
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl items-stretch">

        {/* Left Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center max-w-md w-full bg-slate-900/60 p-8 rounded-2xl border border-slate-800"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DT</span>
              </div>
              <span className="text-white font-bold text-xl">TaskManager Pro</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-300">Request enterprise access and start managing your team.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <motion.form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500"><User size={16} /></span>
                <input
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">✉️</span>
                <input
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="dev@stackpro.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">🔒</span>
                <input
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Developer">Developer</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-blue-500/90 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </motion.form>

          <p className="text-slate-400 text-sm mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
          </p>
        </motion.div>

        {/* Right Side - Themed visual panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col w-full items-stretch"
        >
          <div className="relative rounded-2xl overflow-hidden h-full bg-slate-800/40 border border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-850 to-slate-950/80" />
            <div className="relative z-10 p-8 h-full flex flex-col justify-center items-start">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-blue-600/40 flex items-center justify-center text-white font-semibold">"</div>
                  <div className="text-slate-300 text-sm">Join thousands of developers managing their workflows smarter.</div>
                </div>
                <div className="space-y-3 mt-4">
                  {['✅ Manage projects & tasks', '✅ Team collaboration tools', '✅ Analytics & reporting', '✅ Role-based access control'].map(f => (
                    <p key={f} className="text-slate-400 text-sm">{f}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-6 left-12 px-3 py-1 text-xs bg-slate-900/60 rounded text-slate-300 font-mono">git commit -m "feat: new team member"</div>
              <div className="absolute top-20 right-8 px-3 py-1 text-xs bg-slate-900/60 rounded text-slate-300 font-mono">const team = await stack.invite()</div>
              <div className="absolute bottom-12 left-10 px-3 py-1 text-xs bg-slate-900/60 rounded text-slate-300 font-mono">await project.deploy({'{'} scale: 'auto' {'}'})</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-6 text-slate-500 text-xs space-x-4">
        <a href="#" className="hover:text-slate-400">Privacy Policy</a>
        <a href="#" className="hover:text-slate-400">Terms of Service</a>
      </div>
    </div>
  )
}
