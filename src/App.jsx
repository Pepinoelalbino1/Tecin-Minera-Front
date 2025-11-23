import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Movements from './pages/Movements'
import Guias from './pages/Guias'
import { ToastProvider } from './components/ToastContext'

export default function App(){
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-white text-gray-800 flex">
          <Sidebar />
          <div className="flex-1">
            <main className="p-6 container">
              <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/categorias" element={<Categories />} />
                <Route path="/movimientos" element={<Movements />} />
                <Route path="/guias" element={<Guias />} />
              </Routes>
            </main>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
