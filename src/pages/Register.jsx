import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../api/apiClient'
import { useToast } from '../components/ToastContext'
import { FaLock, FaUser, FaIdCard } from 'react-icons/fa'

export default function Register(){
  const [form, setForm] = useState({ username: '', fullName: '', password: '' })
  const [loading, setLoading] = useState(false)
  const addToast = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setLoading(true)
    try{
      await apiRegister(form)
      addToast('Usuario creado correctamente', 'success')
      navigate('/login')
    }catch(err){
      addToast(err.message || 'Error al crear usuario', 'error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white text-center relative overflow-hidden">
            {/* SVG ilustrativo de minería */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path d="M50,100 L100,50 L150,100 L100,150 Z" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
                <path d="M70,120 Q100,140 130,120" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="text-5xl font-black mb-2 tracking-tighter">⛏️</div>
              <h1 className="text-3xl font-bold mb-2">Tecin Minera</h1>
              <p className="text-blue-100 text-sm font-medium">Sistema de Gestión de Inventario</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Crear Cuenta</h2>
            <p className="text-gray-500 text-sm text-center mb-8">Completa los datos para registrarte</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Usuario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                  <input 
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    placeholder="Tu nombre de usuario"
                    required 
                  />
                </div>
              </div>

              {/* Campo Nombre Completo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                  <input 
                    name="fullName" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                  <input 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    type="password" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    placeholder="Crea una contraseña segura"
                    required 
                  />
                </div>
              </div>

              {/* Botón de registro */}
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Creando cuenta...
                  </span>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            {/* Enlace a login */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                  Inicia sesión aquí
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-500 text-xs">
                Tecin Minera © 2024 - Sistema de Inventario y Guías de Remisión
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
