import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaBox, FaFolder, FaExchangeAlt, FaFileAlt, FaClipboardList, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa'
import { useTheme } from './ThemeContext'

export default function Sidebar({ setIsAuthenticated }){
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 shadow-sm flex flex-col transition-colors duration-300">
      <div className="mb-8">
        <div className="text-2xl font-bold text-primary tracking-tight">Tecin Minera</div>
        <div className="h-1 bg-gold w-16 mt-2.5 rounded-full" />
        <div className="text-sm text-gray-500 mt-3 font-medium">Inventario & Guías</div>
      </div>
      <nav className="space-y-1.5 flex-1">
        <NavLink to="/productos" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
          <FaBox className="w-4 h-4" /> <span>Productos</span>
        </NavLink>
        <NavLink to="/categorias" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
          <FaFolder className="w-4 h-4" /> <span>Categorías</span>
        </NavLink>
        <NavLink to="/movimientos" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
          <FaExchangeAlt className="w-4 h-4" /> <span>Movimientos</span>
        </NavLink>
        <NavLink to="/guias" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
          <FaFileAlt className="w-4 h-4" /> <span>Guías</span>
        </NavLink>
        <NavLink to="/reposicion" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
          <FaClipboardList className="w-4 h-4" /> <span>Reposición</span>
        </NavLink>
      </nav>

      {/* Toggle Tema */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-700 hover:bg-gray-100 transition-all"
        >
          {isDark ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
          <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-semibold">{user.fullName || user.username}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-gray-700 hover:bg-red-50 transition-all hover:text-red-600">
          <FaSignOutAlt className="w-4 h-4" /> <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
