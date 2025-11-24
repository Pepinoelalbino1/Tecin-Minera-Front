import React, { useEffect, useState } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  getCategories,
  updateProductEstado
} from '../api/apiClient'
import Button from '../components/ui/Button'
import { FaEdit, FaPowerOff } from 'react-icons/fa'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'

export default function Products(){
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', unidadMedida: '', categoriaId: '' })
  const [editingId, setEditingId] = useState(null)
  const addToast = useToast()
  

  const load = async ()=>{
    setLoading(true)
    try{
      const [prodData, catData] = await Promise.all([getProducts(), getCategories()])
      setProducts(prodData || [])
      setCategories(catData || [])
    }catch(err){
      setError(err.message)
      showApiError(addToast, err)
    }finally{setLoading(false)}
  }

  useEffect(()=>{ load() }, [])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const [formErrors, setFormErrors] = useState(null)

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setFormErrors(null)
    // basic validation
    if(!form.nombre || form.nombre.trim().length < 2){
      setFormErrors('El nombre del producto debe tener al menos 2 caracteres')
      return
    }
    if(form.precio && Number(form.precio) < 0){ setFormErrors('El precio debe ser positivo'); return }
    try{
      if(editingId){
        const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock) }
        await updateProduct(editingId, payload)
        addToast('Producto actualizado', 'success')
      }else{
        const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock) }
        await createProduct(payload)
        addToast('Producto creado', 'success')
      }
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', unidadMedida: '', categoriaId: '' })
      setEditingId(null)
      await load()
    }catch(err){
      setError(err.message)
      showApiError(addToast, err)
    }
  }

  const startEdit = (p) =>{
    setEditingId(p.id)
    setForm({ nombre: p.nombre || '', descripcion: p.descripcion || '', precio: p.precio || '', stock: p.stock || '', unidadMedida: p.unidadMedida || '', categoriaId: p.categoriaId || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleEstado = async (p) =>{
    try{
      const newEstado = (p.estado === 'ACTIVO') ? 'INACTIVO' : 'ACTIVO'
      await updateProductEstado(p.id, newEstado)
      await load()
      addToast(`Producto ${newEstado === 'ACTIVO' ? 'activado' : 'inactivado'}`, 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  if(loading) return <div>Cargando productos...</div>

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Productos</h2>
        <div className="stats-badge">Total: {products.length}</div>
      </div>

      <form onSubmit={handleSubmit} className="card card-padding mb-8">
        <div className="mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Nombre del Producto</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Tuberías" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div>
            <label className="form-label">Precio</label>
            <input name="precio" value={form.precio} onChange={handleChange} placeholder="0.00" type="number" step="0.01" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Categoría</label>
            <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20">
              <option value="">Seleccionar categoría</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Stock</label>
            <input name="stock" value={form.stock} onChange={handleChange} placeholder="0" type="number" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Unidad de Medida</label>
            <input name="unidadMedida" value={form.unidadMedida} onChange={handleChange} placeholder="Ej: Unidad, Kg, m" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        {formErrors && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formErrors}</div>}
        <div className="mt-5 pt-4 border-t flex gap-3 justify-end">
          {editingId && <Button variant="neutral" type="button" onClick={()=>{ setEditingId(null); setForm({ nombre: '', descripcion: '', precio: '', stock: '', unidadMedida: '', categoriaId: '' }) }}>Cancelar</Button>}
          <Button variant="primary">{editingId ? 'Guardar Cambios' : 'Crear Producto'}</Button>
        </div>
      </form>

      {products.length === 0
        ? <div className="text-gray-600">No hay productos disponibles.</div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className={`card card-padding ${p.estado === 'INACTIVO' ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{p.nombre}</div>
                    <div className="text-sm text-gray-600">{p.descripcion}</div>
                    <div className="text-sm text-gray-500">Categoría: {p.categoriaNombre || p.categoriaId || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold font-semibold">{p.precio ? `$${p.precio}` : ''}</div>
                    <div className="text-sm text-gray-600">Stock: {p.stock}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <Button variant="neutral" leftIcon={<FaEdit />} onClick={()=>startEdit(p)} className="px-3 py-1">Editar</Button>
                  <Button variant="primary" leftIcon={<FaPowerOff />} onClick={()=>toggleEstado(p)} className="px-3 py-1">{p.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
    </section>
  )
}
