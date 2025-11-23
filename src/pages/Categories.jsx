import React, { useEffect, useState } from 'react'
import api, { getCategories, createCategory, updateCategory, deleteCategory } from '../api/apiClient'
import Button from '../components/ui/Button'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useToast } from '../components/ToastContext'

export default function Categories(){
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    getCategories()
      .then(data => setCategories(data))
      .catch(err => setError(err.message))
      .finally(()=>setLoading(false))
  },[])


  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    if(!name || name.trim().length < 2){
      setFormError('El nombre debe tener al menos 2 caracteres')
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
    }catch(err){ setError(err.message) }
  }

  const handleUpdate = async (id, nombre, descripcion) =>{
    try{
      const updated = await updateCategory(id, { nombre, descripcion })
      setCategories(prev => prev.map(c => c.id === id ? updated : c))
      addToast('Categoría actualizada', 'success')
    }catch(err){ setError(err.message) }
  }

  const handleDelete = async (id) =>{
    if(!confirm('Eliminar categoría?')) return
    try{
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      addToast('Categoría eliminada', 'success')
    }catch(err){ setError(err.message) }
  }

  const addToast = useToast()

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Categorías</h2>
      <form onSubmit={handleCreate} className="mb-4 card card-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div>
            <label className="small muted">Nombre</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="small muted">Descripción</label>
            <input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Descripción" className="border p-2 rounded w-full" />
          </div>
          <div className="text-right">
            <Button variant="primary" className="w-full">Crear</Button>
          </div>
        </div>
      </form>
      {formError && <div className="text-red-600 mb-2">{formError}</div>}
      {loading && <div>Cargando categorías...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <ul className="space-y-3">
        {categories.map(c => (
          <li key={c.id} className="card card-padding">
            {editingId === c.id ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                  <label className="small muted">Nombre</label>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} className="border p-2 rounded w-full" />
                </div>
                <div>
                  <label className="small muted">Descripción</label>
                  <input value={editDescripcion} onChange={e=>setEditDescripcion(e.target.value)} className="border p-2 rounded w-full" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="neutral" onClick={cancelEdit}>Cancelar</Button>
                  <Button variant="primary" onClick={()=>saveEdit(c.id)}>Guardar</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{c.nombre || c.name}</div>
                  <div className="text-sm text-gray-600">{c.descripcion}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="neutral" leftIcon={<FaEdit />} onClick={()=>startEdit(c)}>Editar</Button>
                  <Button variant="danger" leftIcon={<FaTrash />} onClick={()=>handleDelete(c.id)}>Eliminar</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
