import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectsPage from './pages/ProjectsPage'
import TasksPage from './pages/TasksPage'
import TeamPage from './pages/TeamPage'
import RolesPage from './pages/RolesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/projects' element={<ProjectsPage />} />
            <Route path='/tasks' element={<TasksPage />} />
            <Route path='/team' element={<TeamPage />} />
            <Route path='/roles' element={<RolesPage />} />
            <Route path='/analytics' element={<AnalyticsPage />} />
            <Route path='/reports' element={<ReportsPage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/' element={<Navigate to='/dashboard' />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
