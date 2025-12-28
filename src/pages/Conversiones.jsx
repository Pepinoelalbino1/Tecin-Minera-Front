import React, { useEffect, useState } from 'react'
import { getProducts, getConversiones, createConversion, updateConversion, deleteConversion } from '../api/apiClient'
import Button from '../components/ui/Button'
import ProductSearch from '../components/ui/ProductSearch'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'

const UNIDADES_MEDIDA = ['UND', 'KG', 'CAJA', 'BOLSA', 'BIDON', 'PALLET', 'M3', 'L', 'GR', 'OTROS']

export default function Conversiones(){
  const [productos, setProductos] = useState([])
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({ productoId: '', unidad: '', factorToBase: '' })
  const [editing, setEditing] = useState(null)
  const [errors, setErrors] = useState({})
  const addToast = useToast()

  useEffect(()=>{
    load()
  },[])

  async function load(){
    try{
      const [p, c] = await Promise.all([getProducts(), getConversiones()])
      setProductos(p || [])
      setLista(c || [])
    }catch(err){
      showApiError(addToast, err)
    }
  }

  function onChange(e){
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if(errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validateForm(){
    const newErrors = {}
    if(!form.productoId) newErrors.productoId = 'Selecciona un producto'
    if(!form.unidad) newErrors.unidad = 'Selecciona una unidad'
    if(!form.factorToBase || parseFloat(form.factorToBase) <= 0) newErrors.factorToBase = 'Factor debe ser mayor a 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function onSubmit(e){
    e.preventDefault()
    if(!validateForm()) return
    try{
      const payload = { unidad: form.unidad, factorToBase: parseFloat(form.factorToBase) }
      payload.producto = { id: parseInt(form.productoId) }
      if(editing){
        await updateConversion(editing, payload)
        addToast('Conversión actualizada', 'success')
      }else{
        await createConversion(payload)
        addToast('Conversión creada', 'success')
      }
      setForm({ productoId: '', unidad: '', factorToBase: '' })
      setEditing(null)
      setErrors({})
      await load()
    }catch(err){
      showApiError(addToast, err)
    }
  }

  async function onEdit(item){
    setEditing(item.id)
    setForm({ productoId: item.producto?.id?.toString() || '', unidad: item.unidad || '', factorToBase: item.factorToBase || '' })
  }

  async function onDelete(id){
    if(!confirm('¿Eliminar esta conversión?')) return
    try{
      await deleteConversion(id)
      addToast('Conversión eliminada', 'success')
      await load()
    }catch(err){
      showApiError(addToast, err)
    }
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="page-title">Unidades / Factores de conversión</h2>
      </div>

      <form onSubmit={onSubmit} className="card card-padding mb-8">
        <div className="mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{editing ? 'Editar Conversión' : 'Nueva Conversión'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Producto</label>
            <ProductSearch
              productos={productos}
              value={form.productoId}
              onChange={onChange}
              error={errors.productoId}
              placeholder="Buscar producto..."
              showStock={true}
              showCategory={true}
            />
          </div>

          <div>
            <label className="form-label">Unidad (origen)</label>
            <select name="unidad" value={form.unidad} onChange={onChange} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.unidad ? 'border border-red-500' : 'border border-gray-300')}>
              <option value="">-- seleccionar --</option>
              {UNIDADES_MEDIDA.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.unidad && <span className="text-red-500 text-xs mt-1">{errors.unidad}</span>}
          </div>

          <div>
            <label className="form-label">Factor a unidad base</label>
            <input name="factorToBase" value={form.factorToBase} onChange={onChange} type="number" step="0.000001" placeholder="1.5" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.factorToBase ? 'border border-red-500' : 'border border-gray-300')} />
            {errors.factorToBase && <span className="text-red-500 text-xs mt-1">{errors.factorToBase}</span>}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="primary" leftIcon={<FaPlus />}>{editing ? 'Guardar' : 'Crear'}</Button>
          {editing && (
            <Button variant="neutral" onClick={()=>{ setForm({ productoId: '', unidad: '', factorToBase: ''}); setEditing(null); setErrors({}) }}>Cancelar</Button>
          )}
        </div>
      </form>

      <div className="card card-padding">
        <div className="mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Conversiones registradas</h3>
        </div>

        {lista.length === 0 ? (
          <div className="empty-state">No hay conversiones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-600">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-slate-200">Producto</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-slate-200">Unidad</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-slate-200">Factor</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-slate-200">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(item => (
                  <tr key={item.id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="py-3 px-2 dark:text-slate-200">{item.producto?.nombre || '-'}</td>
                    <td className="py-3 px-2 dark:text-slate-200">{item.unidad}</td>
                    <td className="py-3 px-2 dark:text-slate-200">{item.factorToBase}</td>
                    <td className="py-3 px-2 flex gap-2">
                      <Button variant="primary" className="px-3 py-1.5 text-sm" leftIcon={<FaEdit />} onClick={()=>onEdit(item)}>Editar</Button>
                      <Button variant="danger" className="px-3 py-1.5 text-sm" leftIcon={<FaTrash />} onClick={()=>onDelete(item.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
