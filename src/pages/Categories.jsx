import React, { useEffect, useState } from 'react'
import api, { getCategories, createCategory, updateCategory, deleteCategory } from '../api/apiClient'
import Button from '../components/ui/Button'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'

export default function Categories(){
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [nameError, setNameError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const addToast = useToast()
  useEffect(()=>{
    setLoading(true)
    getCategories()
      .then(data => setCategories(data))
      .catch(err => { setError(err.message); showApiError(addToast, err) })
      .finally(()=>setLoading(false))
  },[])


  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    if(!name || name.trim().length < 2){
      setFormError('El nombre debe tener al menos 2 caracteres')
      setNameError('El nombre debe tener al menos 2 caracteres')
      return
    }
    try{
      const created = await createCategory({ nombre: name, descripcion })
      setCategories(prev => [created, ...prev])
      setName('')
      setDescripcion('')
      addToast('Categoría creada', 'success')
    }catch(err){
      setError(err.message)
      showApiError(addToast, err)
    }
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setEditName(c.nombre || '')
    setEditDescripcion(c.descripcion || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDescripcion('')
  }

  const saveEdit = async (id) => {
    if(!editName || editName.trim().length < 2) return setError('El nombre debe tener al menos 2 caracteres')
    try{
      const updated = await updateCategory(id, { nombre: editName, descripcion: editDescripcion })
      setCategories(prev => prev.map(c => c.id === id ? updated : c))
      cancelEdit()
      addToast('Categoría actualizada', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const handleUpdate = async (id, nombre, descripcion) =>{
    try{
      const updated = await updateCategory(id, { nombre, descripcion })
      setCategories(prev => prev.map(c => c.id === id ? updated : c))
      addToast('Categoría actualizada', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const handleDelete = async (id) =>{
    if(!confirm('Eliminar categoría?')) return
    try{
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      addToast('Categoría eliminada', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  return (
    <section>
      <div className="section-header">
        <h1 className="page-title">Categorías</h1>
        <div className="stats-badge">Total: {categories.length}</div>
      </div>

      <form onSubmit={handleCreate} className="card card-padding mb-8">
        <div className="mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Nueva Categoría</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nombre</label>
            <input value={name} onChange={e=>{ setName(e.target.value); if(nameError) setNameError('') }} onBlur={()=>{ if(!name || name.trim().length<2) setNameError('El nombre debe tener al menos 2 caracteres') }} placeholder="Ej: Materiales" className={"border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (nameError ? 'border-red-500' : 'border-gray-300')} required />
            {nameError && <p className="text-red-600 text-sm mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Descripción breve" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        {formError && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>}
        <div className="mt-5 pt-4 border-t flex justify-end">
          <Button variant="primary">Crear Categoría</Button>
        </div>
      </form>
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Cargando categorías...</span>
        </div>
      )}
      {categories.length === 0 && !loading ? (
        <div className="empty-state card card-padding">No hay categorías disponibles</div>
      ) : (
        <ul className="space-y-4">
          {categories.map(c => (
            <li key={c.id} className="card card-padding hover:shadow-lg transition-shadow">
              {editingId === c.id ? (
                <div>
                  <div className="mb-4 pb-3 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Editar Categoría</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Nombre</label>
                      <input value={editName} onChange={e=>setEditName(e.target.value)} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="form-label">Descripción</label>
                      <input value={editDescripcion} onChange={e=>setEditDescripcion(e.target.value)} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t flex gap-3 justify-end">
                    <Button variant="neutral" onClick={cancelEdit}>Cancelar</Button>
                    <Button variant="primary" onClick={()=>saveEdit(c.id)}>Guardar Cambios</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">{c.nombre || c.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{c.descripcion || 'Sin descripción'}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="neutral" leftIcon={<FaEdit />} onClick={()=>startEdit(c)} className="px-3 py-1.5 text-sm">Editar</Button>
                    <Button variant="danger" leftIcon={<FaTrash />} onClick={()=>handleDelete(c.id)} className="px-3 py-1.5 text-sm">Eliminar</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
