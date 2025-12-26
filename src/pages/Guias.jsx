import React, { useEffect, useState } from 'react'
import { getGuias, createGuia, addDetalleGuia, emitirGuia, guiaPdfUrl, getProducts, deleteDetalleGuia, login } from '../api/apiClient'
import Button from '../components/ui/Button'
import { FaFilePdf, FaPaperPlane, FaPlus } from 'react-icons/fa'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'

const MOTIVOS_TRASLADO = [
  { value: 'VENTA', label: 'Venta' },
  { value: 'COMPRA', label: 'Compra' },
  { value: 'CONSIGNACION', label: 'Consignación' },
  { value: 'TRASLADO_ENTRE_ESTABLECIMIENTOS', label: 'Traslado entre establecimientos' },
  { value: 'DEVOLUCION', label: 'Devolución' },
  { value: 'IMPORTACION', label: 'Importación' },
  { value: 'EXPORTACION', label: 'Exportación' },
  { value: 'OTROS', label: 'Otros' }
]

const UNIDADES_MEDIDA = ['UND', 'KG', 'CAJA', 'BOLSA', 'BIDON', 'PALLET', 'M3', 'L', 'GR', 'OTROS']

export default function Guias(){
  const [guias, setGuias] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    serie: 'GR',
    fechaEmision: '',
    fechaInicioTraslado: '',
    emisorRuc: '',
    emisorRazonSocial: '',
    emisorDireccionFiscal: '',
    destinatarioRucDni: '',
    destinatarioRazonSocial: '',
    destinatarioDireccion: '',
    puntoPartida: '',
    puntoLlegada: '',
    motivoTraslado: '',
    tipoTransporte: 'PRIVADO',
    placaVehiculo: '',
    conductorNombre: '',
    conductorDni: '',
    transportistaRazonSocial: '',
    transportistaRuc: '',
    observaciones: '',
    referenciaComprobante: '',
    pesoTotal: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [detalle, setDetalle] = useState({ guiaId: '', productoId: '', cantidad: '', descripcionBien: '', unidadMedida: 'UND' })
  const [detalleErrors, setDetalleErrors] = useState({})
  const [selectedGuiaId, setSelectedGuiaId] = useState('')

  const addToast = useToast()
  const onlyDigits = (v) => (v || '').toString().replace(/\D/g, '')

  const load = async ()=>{
    setLoading(true)
    try{
      const [gData, pData] = await Promise.all([getGuias(), getProducts()])
      let newGuias = gData || []
      if(selectedGuiaId){
        const idx = newGuias.findIndex(x => String(x.id) === String(selectedGuiaId))
        if(idx > 0){
          const sel = newGuias[idx]
          newGuias = [sel, ...newGuias.filter((_,i)=>i!==idx)]
        }
      }
      setGuias(newGuias)
      setProductos(pData || [])
    }catch(err){ setError(err.message); showApiError(addToast, err) }
    finally{ setLoading(false) }
  }

  const reorderGuias = (id) => {
    setGuias(prev => {
      const idx = prev.findIndex(g => String(g.id) === String(id))
      if(idx <= 0) return prev
      const sel = prev[idx]
      return [sel, ...prev.filter((_,i)=>i!==idx)]
    })
  }

  useEffect(()=>{ load() }, [])

  const handleCreate = async (e) =>{
    e.preventDefault()
    setError(null)
    // Validación con mensajes por campo
    const valid = validateForm()
    if(!valid) return
    
    try{
      const payload = { ...form }
      if(form.pesoTotal) payload.pesoTotal = parseFloat(form.pesoTotal)
      await createGuia(payload)
      setForm({
        serie: 'GR',
        fechaEmision: '',
        fechaInicioTraslado: '',
        emisorRuc: '',
        emisorRazonSocial: '',
        emisorDireccionFiscal: '',
        destinatarioRucDni: '',
        destinatarioRazonSocial: '',
        destinatarioDireccion: '',
        puntoPartida: '',
        puntoLlegada: '',
        motivoTraslado: '',
        tipoTransporte: 'PRIVADO',
        placaVehiculo: '',
        conductorNombre: '',
        conductorDni: '',
        transportistaRazonSocial: '',
        transportistaRuc: '',
        observaciones: '',
        referenciaComprobante: '',
        pesoTotal: ''
      })
      await load()
      addToast('Guía creada', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const validateField = (name, value) => {
    if(['fechaEmision','fechaInicioTraslado','emisorRuc','emisorRazonSocial','emisorDireccionFiscal','destinatarioRucDni','destinatarioRazonSocial','destinatarioDireccion','puntoPartida','puntoLlegada','motivoTraslado','tipoTransporte'].includes(name)){
      if(!value) return 'Campo obligatorio'
    }
    if(name === 'emisorRuc' || name === 'transportistaRuc'){
      if(value && value.length !== 11) return 'RUC debe tener 11 dígitos'
    }
    if(name === 'conductorDni'){
      if(value && value.length !== 8) return 'DNI debe tener 8 dígitos'
    }
    if(name === 'placaVehiculo'){
      if(value && value.length < 4) return 'Placa inválida'
    }
    return ''
  }

  const validateForm = () => {
    const fields = ['fechaEmision','fechaInicioTraslado','emisorRuc','emisorRazonSocial','emisorDireccionFiscal','destinatarioRucDni','destinatarioRazonSocial','destinatarioDireccion','puntoPartida','puntoLlegada','motivoTraslado','tipoTransporte']
    const newErrors = {}
    fields.forEach(f => newErrors[f] = validateField(f, form[f]))
    // conditional
    if(form.tipoTransporte === 'PRIVADO'){
      newErrors.placaVehiculo = validateField('placaVehiculo', form.placaVehiculo)
      newErrors.conductorNombre = form.conductorNombre ? '' : 'Campo obligatorio'
      newErrors.conductorDni = validateField('conductorDni', form.conductorDni)
    }
    if(form.tipoTransporte === 'PUBLICO'){
      newErrors.transportistaRazonSocial = form.transportistaRazonSocial ? '' : 'Campo obligatorio'
      newErrors.transportistaRuc = validateField('transportistaRuc', form.transportistaRuc)
    }
    setErrors(newErrors)
    setTouched(fields.reduce((s,f)=>({ ...s, [f]: true }), {}))
    const hasError = Object.values(newErrors).some(v => v)
    if(hasError){ setError('Corrija los campos en rojo antes de continuar') }
    return !hasError
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleAddDetalle = async (e) =>{
    e.preventDefault()
    setError(null)
    const detValid = validateDetalle()
    if(!detValid) return
    try{
      const producto = productos.find(p => p.id === Number(detalle.productoId))
      const descripcion = detalle.descripcionBien || (producto ? producto.nombre : '')
      
      await addDetalleGuia(detalle.guiaId, { 
        productoId: Number(detalle.productoId), 
        cantidad: Number(detalle.cantidad),
        descripcionBien: descripcion,
        unidadMedida: detalle.unidadMedida
      })
      setDetalle({ guiaId: '', productoId: '', cantidad: '', descripcionBien: '', unidadMedida: 'UND' })
      await load()
      addToast('Detalle añadido', 'success')
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const validateDetalle = () =>{
    const newErr = {
      guiaId: !detalle.guiaId ? 'Seleccione una guía' : '',
      productoId: !detalle.productoId ? 'Seleccione un producto' : '',
      cantidad: !detalle.cantidad || Number(detalle.cantidad) <= 0 ? 'Ingrese cantidad válida' : '',
      unidadMedida: !detalle.unidadMedida ? 'Seleccione unidad' : ''
    }
    setDetalleErrors(newErr)
    return !Object.values(newErr).some(v=>v)
  }

  const handleDetalleBlur = (e) => {
    const { name, value } = e.target
    setDetalleErrors(prev => ({ ...prev, [name]: validateDetalleField(name, value) }))
  }

  const validateDetalleField = (name, value) => {
    if(name === 'guiaId' || name === 'productoId'){
      if(!value) return 'Campo obligatorio'
    }
    if(name === 'cantidad'){
      if(!value || Number(value) <= 0) return 'Ingrese cantidad válida'
    }
    if(name === 'unidadMedida'){
      if(!value) return 'Seleccione unidad'
    }
    return ''
  }

  const handleEmitir = async (id) =>{
    try{
      await emitirGuia(id)
      await load()
      window.open(guiaPdfUrl(id), '_blank')
      addToast('Guía emitida', 'success')
    }catch(err){
      // Si es 401 y el usuario actual es ADMIN, intentar login silencioso y reintentar emitir
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if(err?.status === 401 && user?.role === 'ADMIN' && user.username && user.password){
        try{
          await login({ username: user.username, password: user.password })
          // reintentar una vez
          await emitirGuia(id)
          await load()
          window.open(guiaPdfUrl(id), '_blank')
          addToast('Guía emitida', 'success')
          return
        }catch(inner){
          // si falla, mostrar mensaje final
          setError(inner.message)
          addToast(inner.message || 'Error al emitir guía después de relogin', 'error')
          return
        }
      }
      setError(err.message);
      addToast?.(err.message, 'error')
    }
  }

  const handleProductoChange = (productoId) => {
    const producto = productos.find(p => p.id === Number(productoId))
    setDetalle(prev => ({
      ...prev,
      productoId,
      descripcionBien: producto ? producto.nombre : prev.descripcionBien,
      unidadMedida: producto?.unidadMedida || 'UND'
    }))
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
        
        {/* Serie y Fechas */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Serie y Fechas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Serie <span className="text-red-500">*</span></label>
              <input name="serie" value={form.serie} onChange={e=>setForm({...form, serie:e.target.value})} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="form-label">Fecha de Emisión <span className="text-red-500">*</span></label>
              <input name="fechaEmision" value={form.fechaEmision} onChange={e=>setForm({...form, fechaEmision:e.target.value, fechaInicioTraslado: form.fechaInicioTraslado || e.target.value})} onBlur={handleBlur} type="date" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.fechaEmision ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.fechaEmision && <p className="text-red-600 text-sm mt-1">{errors.fechaEmision}</p>}
            </div>
            <div>
              <label className="form-label">Fecha Inicio Traslado <span className="text-red-500">*</span></label>
              <input name="fechaInicioTraslado" value={form.fechaInicioTraslado} onChange={e=>setForm({...form, fechaInicioTraslado:e.target.value})} onBlur={handleBlur} type="date" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.fechaInicioTraslado ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.fechaInicioTraslado && <p className="text-red-600 text-sm mt-1">{errors.fechaInicioTraslado}</p>}
            </div>
          </div>
        </div>

        {/* Datos del Emisor */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Datos del Emisor</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">RUC <span className="text-red-500">*</span></label>
              <input name="emisorRuc" value={form.emisorRuc} onChange={e=>setForm({...form, emisorRuc: onlyDigits(e.target.value)})} onBlur={handleBlur} maxLength={11} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.emisorRuc ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.emisorRuc && <p className="text-red-600 text-sm mt-1">{errors.emisorRuc}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Razón Social <span className="text-red-500">*</span></label>
              <input name="emisorRazonSocial" value={form.emisorRazonSocial} onChange={e=>setForm({...form, emisorRazonSocial:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.emisorRazonSocial ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.emisorRazonSocial && <p className="text-red-600 text-sm mt-1">{errors.emisorRazonSocial}</p>}
            </div>
            <div className="md:col-span-3">
              <label className="form-label">Dirección Fiscal <span className="text-red-500">*</span></label>
              <input name="emisorDireccionFiscal" value={form.emisorDireccionFiscal} onChange={e=>setForm({...form, emisorDireccionFiscal:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.emisorDireccionFiscal ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.emisorDireccionFiscal && <p className="text-red-600 text-sm mt-1">{errors.emisorDireccionFiscal}</p>}
            </div>
          </div>
        </div>

        {/* Datos del Destinatario */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Datos del Destinatario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">RUC o DNI <span className="text-red-500">*</span></label>
              <input name="destinatarioRucDni" value={form.destinatarioRucDni} onChange={e=>setForm({...form, destinatarioRucDni: onlyDigits(e.target.value)})} onBlur={handleBlur} maxLength={15} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.destinatarioRucDni ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.destinatarioRucDni && <p className="text-red-600 text-sm mt-1">{errors.destinatarioRucDni}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Razón Social <span className="text-red-500">*</span></label>
              <input name="destinatarioRazonSocial" value={form.destinatarioRazonSocial} onChange={e=>setForm({...form, destinatarioRazonSocial:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.destinatarioRazonSocial ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.destinatarioRazonSocial && <p className="text-red-600 text-sm mt-1">{errors.destinatarioRazonSocial}</p>}
            </div>
            <div className="md:col-span-3">
              <label className="form-label">Dirección <span className="text-red-500">*</span></label>
              <input name="destinatarioDireccion" value={form.destinatarioDireccion} onChange={e=>setForm({...form, destinatarioDireccion:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.destinatarioDireccion ? 'border border-red-500' : 'border border-gray-300')} />
              {errors.destinatarioDireccion && <p className="text-red-600 text-sm mt-1">{errors.destinatarioDireccion}</p>}
            </div>
          </div>
        </div>

        {/* Puntos de Partida y Llegada */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Puntos de Partida y Llegada</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Punto de Partida <span className="text-red-500">*</span></label>
              <input required name="puntoPartida" value={form.puntoPartida} onChange={e=>setForm({...form, puntoPartida:e.target.value})} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="form-label">Punto de Llegada <span className="text-red-500">*</span></label>
              <input required name="puntoLlegada" value={form.puntoLlegada} onChange={e=>setForm({...form, puntoLlegada:e.target.value})} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Motivo de Traslado */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Motivo de Traslado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Motivo <span className="text-red-500">*</span></label>
              <select name="motivoTraslado" value={form.motivoTraslado} onChange={e=>setForm({...form, motivoTraslado:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.motivoTraslado ? 'border border-red-500' : 'border border-gray-300')}>
                <option value="">Seleccionar motivo</option>
                {MOTIVOS_TRASLADO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              {errors.motivoTraslado && <p className="text-red-600 text-sm mt-1">{errors.motivoTraslado}</p>}
            </div>
          </div>
        </div>

        {/* Datos del Transporte */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Datos del Transporte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Tipo de Transporte <span className="text-red-500">*</span></label>
              <select name="tipoTransporte" value={form.tipoTransporte} onChange={e=>setForm({...form, tipoTransporte:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.tipoTransporte ? 'border border-red-500' : 'border border-gray-300')}>
                <option value="PRIVADO">Transporte Privado</option>
                <option value="PUBLICO">Transporte Público</option>
              </select>
              {errors.tipoTransporte && <p className="text-red-600 text-sm mt-1">{errors.tipoTransporte}</p>}
            </div>
          </div>
          
          {form.tipoTransporte === 'PRIVADO' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label className="form-label">Placa del Vehículo <span className="text-red-500">*</span></label>
                <input name="placaVehiculo" value={form.placaVehiculo} onChange={e=>setForm({...form, placaVehiculo:e.target.value})} onBlur={handleBlur} maxLength={10} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.placaVehiculo ? 'border border-red-500' : 'border border-gray-300')} />
                {errors.placaVehiculo && <p className="text-red-600 text-sm mt-1">{errors.placaVehiculo}</p>}
              </div>
              <div>
                <label className="form-label">Nombre del Conductor <span className="text-red-500">*</span></label>
                <input name="conductorNombre" value={form.conductorNombre} onChange={e=>setForm({...form, conductorNombre:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.conductorNombre ? 'border border-red-500' : 'border border-gray-300')} />
                {errors.conductorNombre && <p className="text-red-600 text-sm mt-1">{errors.conductorNombre}</p>}
              </div>
              <div>
                <label className="form-label">DNI del Conductor <span className="text-red-500">*</span></label>
                <input name="conductorDni" value={form.conductorDni} onChange={e=>setForm({...form, conductorDni: onlyDigits(e.target.value)})} onBlur={handleBlur} maxLength={8} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.conductorDni ? 'border border-red-500' : 'border border-gray-300')} />
                {errors.conductorDni && <p className="text-red-600 text-sm mt-1">{errors.conductorDni}</p>}
              </div>
            </div>
          )}
          
          {form.tipoTransporte === 'PUBLICO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Razón Social del Transportista <span className="text-red-500">*</span></label>
                <input name="transportistaRazonSocial" value={form.transportistaRazonSocial} onChange={e=>setForm({...form, transportistaRazonSocial:e.target.value})} onBlur={handleBlur} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.transportistaRazonSocial ? 'border border-red-500' : 'border border-gray-300')} />
                {errors.transportistaRazonSocial && <p className="text-red-600 text-sm mt-1">{errors.transportistaRazonSocial}</p>}
              </div>
              <div>
                <label className="form-label">RUC del Transportista <span className="text-red-500">*</span></label>
                <input name="transportistaRuc" value={form.transportistaRuc} onChange={e=>setForm({...form, transportistaRuc: onlyDigits(e.target.value)})} onBlur={handleBlur} maxLength={11} className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (errors.transportistaRuc ? 'border border-red-500' : 'border border-gray-300')} />
                {errors.transportistaRuc && <p className="text-red-600 text-sm mt-1">{errors.transportistaRuc}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Campos Adicionales */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Datos Adicionales (Opcionales)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="form-label">Observaciones</label>
              <textarea name="observaciones" value={form.observaciones} onChange={e=>setForm({...form, observaciones:e.target.value})} rows={3} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="form-label">Referencia a Comprobante</label>
              <input name="referenciaComprobante" value={form.referenciaComprobante} onChange={e=>setForm({...form, referenciaComprobante:e.target.value})} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="form-label">Peso Total (kg)</label>
              <input type="number" step="0.01" name="pesoTotal" value={form.pesoTotal} onChange={e=>setForm({...form, pesoTotal:e.target.value})} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Seleccionar Guía</label>
            <select value={detalle.guiaId} onChange={e=>{ const id = e.target.value; setDetalle(prev=>({...prev, guiaId:id})); setSelectedGuiaId(id); if(id) reorderGuias(id); setDetalleErrors(prev=>({...prev, guiaId: id ? '' : 'Seleccione una guía'})) }} onBlur={handleDetalleBlur} name="guiaId" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (detalleErrors.guiaId ? 'border border-red-500' : 'border border-gray-300') }>
              <option value="">Seleccionar guía</option>
              {guias.map(g=> <option key={g.id} value={g.id}>{g.serie && g.numeroGuia ? `${g.serie}-${g.numeroGuia}` : g.numeroGuia || `Guía #${g.id}`}</option>)}
            </select>
            {detalleErrors.guiaId && <p className="text-red-600 text-sm mt-1">{detalleErrors.guiaId}</p>}
          </div>
          <div>
            <label className="form-label">Producto</label>
            <select value={detalle.productoId} onChange={e=>{ handleProductoChange(e.target.value); setDetalleErrors(prev=>({...prev, productoId: e.target.value ? '' : 'Seleccione un producto'})) }} onBlur={handleDetalleBlur} name="productoId" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (detalleErrors.productoId ? 'border border-red-500' : 'border border-gray-300') }>
              <option value="">Seleccionar producto</option>
              {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {detalleErrors.productoId && <p className="text-red-600 text-sm mt-1">{detalleErrors.productoId}</p>}
          </div>
          <div>
            <label className="form-label">Cantidad <span className="text-red-500">*</span></label>
            <input value={detalle.cantidad} onChange={e=>{ setDetalle(prev=>({...prev, cantidad:e.target.value})); setDetalleErrors(prev=>({...prev, cantidad: (!e.target.value || Number(e.target.value)<=0) ? 'Ingrese cantidad válida' : '' })) }} onBlur={handleDetalleBlur} name="cantidad" placeholder="0" type="number" min="1" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (detalleErrors.cantidad ? 'border border-red-500' : 'border border-gray-300')} />
            {detalleErrors.cantidad && <p className="text-red-600 text-sm mt-1">{detalleErrors.cantidad}</p>}
          </div>
          <div>
            <label className="form-label">Unidad de Medida <span className="text-red-500">*</span></label>
            <select value={detalle.unidadMedida} onChange={e=>{ setDetalle(prev=>({...prev, unidadMedida:e.target.value})); setDetalleErrors(prev=>({...prev, unidadMedida: e.target.value ? '' : 'Seleccione unidad' })) }} onBlur={handleDetalleBlur} name="unidadMedida" className={"p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20 " + (detalleErrors.unidadMedida ? 'border border-red-500' : 'border border-gray-300')}>
              {UNIDADES_MEDIDA.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {detalleErrors.unidadMedida && <p className="text-red-600 text-sm mt-1">{detalleErrors.unidadMedida}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className="form-label">Descripción del Bien</label>
          <textarea value={detalle.descripcionBien} onChange={e=>setDetalle(prev=>({...prev, descripcionBien:e.target.value}))} rows={2} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" placeholder="Descripción detallada del producto" />
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
                    <div className="font-bold text-lg text-gray-900">
                      {g.serie && g.numeroGuia ? `${g.serie}-${g.numeroGuia}` : g.numeroGuia || `Guía #${g.id}`}
                    </div>
                    <span className={`badge ${g.estado === 'EMITIDA' ? 'badge-success' : 'badge-inactive'}`}>
                      {g.estado || 'Borrador'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium mr-2">Emisor:</span>
                      <span>{g.emisorRazonSocial || '-'} (RUC: {g.emisorRuc || '-'})</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium mr-2">Destinatario:</span>
                      <span>{g.destinatarioRazonSocial || '-'} ({g.destinatarioRucDni || '-'})</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium mr-2">Ruta:</span>
                      <span>{g.puntoPartida || '-'} → {g.puntoLlegada || '-'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Motivo:</span>
                      <span>{MOTIVOS_TRASLADO.find(m => m.value === g.motivoTraslado)?.label || g.motivoTraslado || '-'}</span>
                    </div>
                    {g.tipoTransporte && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Transporte:</span>
                        <span>{g.tipoTransporte === 'PRIVADO' ? `Privado - Placa: ${g.placaVehiculo || '-'}` : `Público - ${g.transportistaRazonSocial || '-'}`}</span>
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
                          <span className="font-medium text-gray-900">{d.descripcionBien || d.productoNombre || d.productoId}</span>
                          <span className="badge badge-primary">{d.cantidad} {d.unidadMedida || 'UND'}</span>
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
