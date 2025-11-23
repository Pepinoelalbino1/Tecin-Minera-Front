import React, { useEffect, useState } from 'react'
import { getGuias, createGuia, addDetalleGuia, emitirGuia, guiaPdfUrl, getProducts, deleteDetalleGuia } from '../api/apiClient'
import Button from '../components/ui/Button'
import { FaFilePdf, FaPaperPlane, FaPlus } from 'react-icons/fa'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'

export default function Guias(){
  const [guias, setGuias] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ fechaEmision: '', puntoPartida: '', puntoLlegada: '', motivoTraslado: '', transportista: '', vehiculo: '' })
  const [detalle, setDetalle] = useState({ guiaId: '', productoId: '', cantidad: '' })

  const addToast = useToast()

  const load = async ()=>{
    setLoading(true)
    try{
      const [gData, pData] = await Promise.all([getGuias(), getProducts()])
      setGuias(gData || [])
      setProductos(pData || [])
    }catch(err){ setError(err.message); showApiError(addToast, err) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const handleCreate = async (e) =>{
    e.preventDefault()
    setError(null)
    // basic validation
    if(!form.fechaEmision || !form.puntoPartida || !form.puntoLlegada){
      setError('Fecha, punto de partida y punto de llegada son obligatorios')
      return
    }
    try{
      await createGuia(form)
      setForm({ fechaEmision: '', puntoPartida: '', puntoLlegada: '', motivoTraslado: '', transportista: '', vehiculo: '' })
      await load()
      addToast('Guía creada', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const handleAddDetalle = async (e) =>{
    e.preventDefault()
    setError(null)
    if(!detalle.guiaId || !detalle.productoId || !detalle.cantidad){
      setError('Guía, producto y cantidad son obligatorios')
      return
    }
    try{
      await addDetalleGuia(detalle.guiaId, { productoId: Number(detalle.productoId), cantidad: Number(detalle.cantidad) })
      setDetalle({ guiaId: '', productoId: '', cantidad: '' })
      await load()
      addToast('Detalle añadido', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const handleEmitir = async (id) =>{
    try{
      await emitirGuia(id)
      await load()
      window.open(guiaPdfUrl(id), '_blank')
      addToast('Guía emitida', 'success')
    }catch(err){ setError(err.message); addToast?.(err.message, 'error') }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Guías de Remisión</h2>
      {loading && <div>Cargando guías...</div>}

      <form onSubmit={handleCreate} className="mb-4 p-4 border rounded grid grid-cols-1 md:grid-cols-2 gap-2">
        <input required name="fechaEmision" value={form.fechaEmision} onChange={e=>setForm({...form, fechaEmision:e.target.value})} type="date" className="border p-2 rounded" />
        <input required name="puntoPartida" value={form.puntoPartida} onChange={e=>setForm({...form, puntoPartida:e.target.value})} placeholder="Punto de partida" className="border p-2 rounded" />
        <input required name="puntoLlegada" value={form.puntoLlegada} onChange={e=>setForm({...form, puntoLlegada:e.target.value})} placeholder="Punto de llegada" className="border p-2 rounded" />
        <input required name="motivoTraslado" value={form.motivoTraslado} onChange={e=>setForm({...form, motivoTraslado:e.target.value})} placeholder="Motivo" className="border p-2 rounded" />
        <input required name="transportista" value={form.transportista} onChange={e=>setForm({...form, transportista:e.target.value})} placeholder="Transportista" className="border p-2 rounded" />
        <input required name="vehiculo" value={form.vehiculo} onChange={e=>setForm({...form, vehiculo:e.target.value})} placeholder="Vehículo" className="border p-2 rounded" />
        <div className="md:col-span-2 text-right">
          <Button variant="primary" leftIcon={<FaPlus />}>Crear Guía</Button>
        </div>
      </form>

      <form onSubmit={handleAddDetalle} className="mb-6 p-4 border rounded grid grid-cols-1 md:grid-cols-3 gap-2">
        <select value={detalle.guiaId} onChange={e=>setDetalle(prev=>({...prev, guiaId:e.target.value}))} className="border p-2 rounded" required>
          <option value="">-- Seleccionar Guía --</option>
          {guias.map(g=> <option key={g.id} value={g.id}>{g.numeroGuia || g.id}</option>)}
        </select>
        <select value={detalle.productoId} onChange={e=>setDetalle(prev=>({...prev, productoId:e.target.value}))} className="border p-2 rounded" required>
          <option value="">-- Producto --</option>
          {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <input value={detalle.cantidad} onChange={e=>setDetalle(prev=>({...prev, cantidad:e.target.value}))} placeholder="Cantidad" type="number" className="border p-2 rounded" required />
        <div className="md:col-span-3 text-right">
          <Button variant="primary" leftIcon={<FaPlus />}>Añadir Detalle</Button>
        </div>
      </form>

      <div className="space-y-3">
        {guias.map(g => (
          <div key={g.id} className="border rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{g.numeroGuia || g.id}</div>
                <div className="text-sm text-gray-600">{g.puntoPartida} → {g.puntoLlegada}</div>
                <div className="text-sm text-gray-500">Transportista: {g.transportista}</div>
              </div>
              <div className="flex gap-2">
                <a href={guiaPdfUrl(g.id)} target="_blank" rel="noreferrer"><Button variant="neutral" leftIcon={<FaFilePdf />}>PDF</Button></a>
                {g.estado !== 'EMITIDA' && <Button variant="primary" leftIcon={<FaPaperPlane />} onClick={()=>handleEmitir(g.id)}>Emitir</Button>}
              </div>
            </div>
            {g.detalles && g.detalles.length>0 && (
              <ul className="mt-3 space-y-1">
                {g.detalles.map(d=> (
                  <li key={d.id} className="text-sm flex items-center justify-between">
                    <div>{d.productoNombre || d.productoId} — {d.cantidad}</div>
                    {g.estado !== 'EMITIDA' && (
                      <div>
                        <Button variant="danger" className="px-2 py-1 text-sm" onClick={async ()=>{
                          if(!confirm('¿Eliminar este detalle?')) return
                          try{
                            await deleteDetalleGuia(g.id, d.id)
                            await load()
                            addToast('Detalle eliminado', 'success')
                          }catch(err){ showApiError(addToast, err); setError(err.message) }
                        }}>Borrar</Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
