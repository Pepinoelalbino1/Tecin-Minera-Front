import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaBox, FaFolder, FaExchangeAlt, FaFileAlt } from 'react-icons/fa'

export default function Sidebar(){
  return (
    <aside className="w-56 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Tecin Minera</div>
        <div className="h-0.5 bg-gold w-12 mt-2 rounded" />
        <div className="text-sm text-gray-500 mt-2">Inventario & Guías</div>
      </div>
      <nav className="space-y-2">
        <NavLink to="/productos" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-primary/10 font-semibold' : 'hover:bg-gray-100'}`}>
          <FaBox /> <span>Productos</span>
        </NavLink>
        <NavLink to="/categorias" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-primary/10 font-semibold' : 'hover:bg-gray-100'}`}>
          <FaFolder /> <span>Categorías</span>
        </NavLink>
        <NavLink to="/movimientos" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-primary/10 font-semibold' : 'hover:bg-gray-100'}`}>
          <FaExchangeAlt /> <span>Movimientos</span>
        </NavLink>
        <NavLink to="/guias" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-primary/10 font-semibold' : 'hover:bg-gray-100'}`}>
          <FaFileAlt /> <span>Guías</span>
        </NavLink>
      </nav>
    </aside>
  )
}
