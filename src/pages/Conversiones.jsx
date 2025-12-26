import React, { useEffect, useState } from 'react'
import { getProducts, getConversiones, createConversion, updateConversion, deleteConversion } from '../api/apiClient'

export default function Conversiones(){
  const [productos, setProductos] = useState([])
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({ productoId: '', unidad: '', factorToBase: '' })
  const [customUnidad, setCustomUnidad] = useState('')
  const [conversionOptions, setConversionOptions] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(()=>{
    load()
  },[])

  useEffect(()=>{
    // Cuando cambia el producto seleccionado, cargar las unidades disponibles
    const pid = form.productoId
    if(pid){
      getConversiones(pid).then(list => {
        const opts = (list || []).map(i => i.unidad).filter(Boolean)
        setConversionOptions(Array.from(new Set(opts)))
      }).catch(()=> setConversionOptions([]))
    }else{
      setConversionOptions([])
    }
  }, [form.productoId])

  async function load(){
    const p = await getProducts()
    setProductos(p || [])
    const c = await getConversiones()
    setLista(c || [])
  }

  function onChange(e){
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e){
    e.preventDefault()
    const unidadToSend = form.unidad === '__OTHER__' ? customUnidad : form.unidad
    const payload = { unidad: unidadToSend, factorToBase: parseFloat(form.factorToBase) }
    payload.producto = { id: parseInt(form.productoId) }
    if(editing){
      await updateConversion(editing, payload)
      setEditing(null)
    }else{
      await createConversion(payload)
    }
    setForm({ productoId: '', unidad: '', factorToBase: '' })
    setCustomUnidad('')
    load()
  }

  async function onEdit(item){
    setEditing(item.id)
    setForm({ productoId: item.producto?.id?.toString() || '', unidad: item.unidad || '', factorToBase: item.factorToBase || '' })
    setCustomUnidad('')
  }

  async function onDelete(id){
    if(!confirm('Eliminar conversión?')) return
    await deleteConversion(id)
    load()
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Unidades / Factores de conversión</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <form onSubmit={onSubmit} className="p-4 border rounded">
            <div className="mb-3">
              <label className="block text-sm font-medium">Producto</label>
              <select name="productoId" value={form.productoId} onChange={onChange} className="mt-1 block w-full p-2 border rounded">
                <option value="">-- seleccionar --</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Unidad (origen)</label>
              <select name="unidad" value={form.unidad} onChange={onChange} className="mt-1 block w-full p-2 border rounded">
                <option value="">-- seleccionar --</option>
                {conversionOptions.map(u => <option key={u} value={u}>{u}</option>)}
                <option value="__OTHER__">Otra (escribir)</option>
              </select>
              {form.unidad === '__OTHER__' && (
                <input placeholder="Escribe la unidad" value={customUnidad} onChange={(e)=>setCustomUnidad(e.target.value)} className="mt-2 block w-full p-2 border rounded" />
              )}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Factor a unidad base</label>
              <input name="factorToBase" value={form.factorToBase} onChange={onChange} type="number" step="0.000001" className="mt-1 block w-full p-2 border rounded" />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded">{editing ? 'Guardar' : 'Crear'}</button>
              <button type="button" onClick={()=>{ setForm({ productoId: '', unidad: '', factorToBase: ''}); setEditing(null) }} className="px-4 py-2 border rounded">Cancelar</button>
            </div>
          </form>
        </div>
        <div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-3">Lista</h3>
            <table className="w-full text-left">
              <thead>
                <tr><th>Producto</th><th>Unidad</th><th>Factor</th><th></th></tr>
              </thead>
              <tbody>
                {lista.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="py-2">{item.producto?.nombre}</td>
                    <td>{item.unidad}</td>
                    <td>{item.factorToBase}</td>
                    <td className="py-2">
                      <button onClick={()=>onEdit(item)} className="mr-2 text-blue-600">Editar</button>
                      <button onClick={()=>onDelete(item.id)} className="text-red-600">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
