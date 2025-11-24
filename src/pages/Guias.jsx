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
      <div className="section-header">
        <h1 className="page-title">Guías de Remisión</h1>
        <div className="stats-badge">Total: {guias.length}</div>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Cargando guías...</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="card card-padding mb-8">
        <div className="mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Nueva Guía de Remisión</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fecha de Emisión</label>
            <input required name="fechaEmision" value={form.fechaEmision} onChange={e=>setForm({...form, fechaEmision:e.target.value})} type="date" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Motivo de Traslado</label>
            <input required name="motivoTraslado" value={form.motivoTraslado} onChange={e=>setForm({...form, motivoTraslado:e.target.value})} placeholder="Venta, Traslado, etc." className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Punto de Partida</label>
            <input required name="puntoPartida" value={form.puntoPartida} onChange={e=>setForm({...form, puntoPartida:e.target.value})} placeholder="Dirección de origen" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Punto de Llegada</label>
            <input required name="puntoLlegada" value={form.puntoLlegada} onChange={e=>setForm({...form, puntoLlegada:e.target.value})} placeholder="Dirección de destino" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Transportista</label>
            <input required name="transportista" value={form.transportista} onChange={e=>setForm({...form, transportista:e.target.value})} placeholder="Nombre del transportista" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="form-label">Vehículo</label>
            <input required name="vehiculo" value={form.vehiculo} onChange={e=>setForm({...form, vehiculo:e.target.value})} placeholder="Placa o identificación" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        <div className="mt-5 pt-4 border-t flex justify-end">
          <Button variant="primary" leftIcon={<FaPlus />}>Crear Guía</Button>
        </div>
      </form>

      <form onSubmit={handleAddDetalle} className="card card-padding mb-8">
        <div className="mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Añadir Productos a Guía</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Seleccionar Guía</label>
            <select value={detalle.guiaId} onChange={e=>setDetalle(prev=>({...prev, guiaId:e.target.value}))} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required>
              <option value="">Seleccionar guía</option>
              {guias.map(g=> <option key={g.id} value={g.id}>{g.numeroGuia || `Guía #${g.id}`}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Producto</label>
            <select value={detalle.productoId} onChange={e=>setDetalle(prev=>({...prev, productoId:e.target.value}))} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required>
              <option value="">Seleccionar producto</option>
              {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Cantidad</label>
            <input value={detalle.cantidad} onChange={e=>setDetalle(prev=>({...prev, cantidad:e.target.value}))} placeholder="0" type="number" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t flex justify-end">
          <Button variant="primary" leftIcon={<FaPlus />}>Añadir Detalle</Button>
        </div>
      </form>

      {guias.length === 0 && !loading ? (
        <div className="empty-state card card-padding">No hay guías disponibles</div>
      ) : (
        <div className="space-y-5">
          {guias.map(g => (
            <div key={g.id} className="card card-padding">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-bold text-lg text-gray-900">{g.numeroGuia || `Guía #${g.id}`}</div>
                    <span className={`badge ${g.estado === 'EMITIDA' ? 'badge-success' : 'badge-inactive'}`}>
                      {g.estado || 'Borrador'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium mr-2">Ruta:</span>
                      <span>{g.puntoPartida || '-'} → {g.puntoLlegada || '-'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Transportista:</span>
                      <span>{g.transportista || '-'}</span>
                    </div>
                    {g.vehiculo && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Vehículo:</span>
                        <span>{g.vehiculo}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <a href={guiaPdfUrl(g.id)} target="_blank" rel="noreferrer"><Button variant="neutral" leftIcon={<FaFilePdf />} className="px-3 py-1.5 text-sm">PDF</Button></a>
                  {g.estado !== 'EMITIDA' && <Button variant="primary" leftIcon={<FaPaperPlane />} onClick={()=>handleEmitir(g.id)} className="px-3 py-1.5 text-sm">Emitir</Button>}
                </div>
              </div>
              {g.detalles && g.detalles.length>0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Productos</div>
                  <ul className="space-y-2">
                    {g.detalles.map(d=> (
                      <li key={d.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{d.productoNombre || d.productoId}</span>
                          <span className="badge badge-primary">x{d.cantidad}</span>
                        </div>
                        {g.estado !== 'EMITIDA' && (
                          <Button variant="danger" className="px-2 py-1 text-xs" onClick={async ()=>{
                            if(!confirm('¿Eliminar este detalle?')) return
                            try{
                              await deleteDetalleGuia(g.id, d.id)
                              await load()
                              addToast('Detalle eliminado', 'success')
                            }catch(err){ showApiError(addToast, err); setError(err.message) }
                          }}>Eliminar</Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
