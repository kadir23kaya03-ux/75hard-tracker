import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'

const SESSION_KEY = '75hard_session'

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleLogin = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Herkese açık ana sayfa */}
        <Route path="/" element={<LandingPage />} />

        {/* Giriş ekranı — zaten giriş yaptıysa dashboard'a yönlendir */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* Dashboard — giriş yapmadıysa login'e yönlendir */}
        <Route
          path="/dashboard"
          element={
            user
              ? <Dashboard user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        />

        {/* Bilinmeyen rotaları ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
