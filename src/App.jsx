import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Movements from './pages/Movements'
import Guias from './pages/Guias'
import Reposicion from './pages/Reposicion'
import Conversiones from './pages/Conversiones'
import { ToastProvider } from './components/ToastContext'
import { ThemeProvider } from './components/ThemeContext'
import Register from './pages/Register'
import Login from './pages/Login'

const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App(){
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar
    const user = localStorage.getItem('user')
    setIsAuthenticated(!!user)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        {isAuthenticated ? (
          <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 flex transition-colors duration-300">
              <Sidebar setIsAuthenticated={setIsAuthenticated} />
              <div className="flex-1">
                <main className="p-6 container dark:bg-slate-900">
                  <Routes>
                    <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Products /></ProtectedRoute>} />
                    <Route path="/productos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Products /></ProtectedRoute>} />
                    <Route path="/categorias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Categories /></ProtectedRoute>} />
                    <Route path="/reposicion" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Reposicion /></ProtectedRoute>} />
                    <Route path="/movimientos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Movements /></ProtectedRoute>} />
                    <Route path="/guias" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Guias /></ProtectedRoute>} />
                    <Route path="/conversiones" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Conversiones /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ThemeProvider>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </ToastProvider>
    </BrowserRouter>
  )
}
