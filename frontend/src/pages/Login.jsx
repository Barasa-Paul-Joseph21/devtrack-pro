import React, {useState} from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Github } from 'lucide-react'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      await login(email, password)
      window.location.href = '/dashboard'
    }catch(err){
      const msg = err?.response?.data?.message || 'Invalid email or password. Please check your credentials or register a new account.'
      setError(msg)
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl items-stretch">
        
        {/* Left Side - Form */}
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center max-w-md w-full bg-slate-900/60 p-8 rounded-2xl border border-slate-800">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DT</span>
              </div>
              <span className="text-white font-bold text-xl">TaskManager Pro</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-300">Enter your credentials to access your enterprise console.</p>
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-8">
            <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
              <Github size={18} /> GitHub
            </button>
            <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
              <span>🔷</span> Google
            </button>
          </div>

          {/* Sign Up Button (visible) */}
          <div className="mb-6">
            <a href="/register" className="inline-block w-full text-center bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-semibold shadow-sm">Request enterprise access</a>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="text-slate-400 text-xs">OR EMAIL</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          {/* Form */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </motion.div>
          )}

          <motion.form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">✉️</span>
                <input 
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="dev@stackpro.com"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-300 text-sm font-medium">Password</label>
                <a href="#" className="text-blue-400 text-xs hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">🔒</span>
                <input 
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded" />
              <label htmlFor="remember" className="text-slate-400 text-sm">Stay logged in for 30 days</label>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-blue-500/90 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Signing In...' : 'Sign In to DevStack'}
            </motion.button>
          </motion.form>

          <p className="text-slate-400 text-sm mt-4">
            Don't have an account? <a href="/register" className="text-blue-400 hover:underline">Request enterprise access</a>
          </p>
        </motion.div>

        {/* Right Side - Themed visual panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex flex-col w-full items-stretch">
          <div className="relative rounded-2xl overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-850 to-slate-950/80" />
            <div className="relative z-10 p-8 h-full flex flex-col justify-center items-start">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-blue-600/40 flex items-center justify-center text-white font-semibold">“</div>
                  <div className="text-slate-300 text-sm">The future of code management is here.</div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  <div className="text-xs text-slate-400">Marcus Sterling • Principal Cloud Architect</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-6 left-12 px-3 py-1 text-xs bg-slate-900/60 rounded text-slate-300 font-mono">git commit -m "Optimize CI pipeline"</div>
              <div className="absolute top-20 right-8 px-3 py-1 text-xs bg-slate-900/60 rounded text-slate-300 font-mono">const stack = new DevStack();</div>
              <div className="absolute bottom-12 left-10 px-3 py-1 text-xs bg-slate-900/60 rounded text-slate-300 font-mono">await stack.deploy({'{'} env: 'prod' {'}'})</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 text-slate-500 text-xs space-x-4">
        <a href="#" className="hover:text-slate-400">Privacy Policy</a>
        <a href="#" className="hover:text-slate-400">Terms of Service</a>
      </div>
    </div>
  )
}
