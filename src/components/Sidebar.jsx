import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaBox, FaFolder, FaExchangeAlt, FaFileAlt } from 'react-icons/fa'

export default function Sidebar(){
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6 shadow-sm">
      <div className="mb-8">
        <div className="text-2xl font-bold text-primary tracking-tight">Tecin Minera</div>
        <div className="h-1 bg-gold w-16 mt-2.5 rounded-full" />
        <div className="text-sm text-gray-500 mt-3 font-medium">Inventario & Guías</div>
      </div>
      <nav className="space-y-1.5">
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
      </nav>
    </aside>
  )
}
