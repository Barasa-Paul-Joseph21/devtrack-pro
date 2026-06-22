import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Eye, EyeOff, Check, X } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)

  useEffect(() => {
    api.get('/users/me')
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePasswordChange = async e => {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }
    setPwLoading(true)
    try {
      await api.put('/users/me/password', { currentPassword, newPassword })
      setPwMsg({ type: 'success', text: 'Password updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password'
      setPwMsg({ type: 'error', text: msg })
    } finally {
      setPwLoading(false)
    }
  }

  const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div>
      <label className="text-slate-300 text-sm font-medium block mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 pr-10 py-2.5 focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>

      {/* Account Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{loading ? '—' : profile?.fullName}</h2>
            <p className="text-slate-400 text-sm">{loading ? '—' : profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
            <User size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Full Name</p>
              <p className="text-white text-sm">{loading ? '—' : profile?.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
            <Mail size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Email Address</p>
              <p className="text-white text-sm">{loading ? '—' : profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
            <Shield size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Role</p>
              <span className="inline-block mt-0.5 text-xs px-2 py-0.5 bg-blue-600/30 text-blue-400 rounded-full">
                {loading ? '—' : profile?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              <span className="text-slate-400 text-sm">📅</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Member Since</p>
              <p className="text-white text-sm">
                {loading ? '—' : profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-1">Change Password</h3>
        <p className="text-slate-400 text-sm mb-5">Update your account password. You'll need your current password to confirm.</p>

        {pwMsg && (
          <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-lg text-sm border ${pwMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {pwMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(p => !p)}
            placeholder="Your current password"
          />
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(p => !p)}
            placeholder="At least 6 characters"
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(p => !p)}
            placeholder="Repeat your new password"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={pwLoading}
            className="w-full bg-blue-500/90 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
