import React, { useEffect, useState } from 'react'
import { registrarEntrada, registrarSalida, getKardex, getProducts, getProduct } from '../api/apiClient'
import Button from '../components/ui/Button'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'
import { FaArrowDown, FaArrowUp, FaPlus } from 'react-icons/fa'

export default function Movements(){
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [entrada, setEntrada] = useState({ productoId: '', cantidad: '', motivo: '' })
  const [salida, setSalida] = useState({ productoId: '', cantidad: '', motivo: '' })
  const [activeTab, setActiveTab] = useState('entrada')
  const [kardex, setKardex] = useState([])
  const [selectedKardexProductId, setSelectedKardexProductId] = useState('')
  const [currentStockDisplay, setCurrentStockDisplay] = useState(null)
  const [startingStockDisplay, setStartingStockDisplay] = useState(null)
  const addToast = useToast()

  useEffect(()=>{
    setLoading(true)
    Promise.all([getProducts()])
      .then(([prods]) => { setProductos(prods || []) })
      .catch(err => { setError(err.message); showApiError(addToast, err) })
      .finally(()=>setLoading(false))
  },[])

  
  const handleEntrada = async (e) =>{
    e.preventDefault()
    setError(null)
    if(!entrada.productoId || !entrada.cantidad || !entrada.motivo){
      setError('Todos los campos de entrada son obligatorios')
      return
    }
    try{
      await registrarEntrada({ productoId: Number(entrada.productoId), cantidad: Number(entrada.cantidad), motivo: entrada.motivo })
      setEntrada({ productoId: '', cantidad: '', motivo: '' })
      addToast('Entrada registrada', 'success')
      // refresh kardex if currently viewing this product
      if(selectedKardexProductId) await loadKardex(selectedKardexProductId)
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }

  const handleSalida = async (e) =>{
    e.preventDefault()
    setError(null)
    if(!salida.productoId || !salida.cantidad || !salida.motivo){
      setError('Todos los campos de salida son obligatorios')
      return
    }
    try{
      await registrarSalida({ productoId: Number(salida.productoId), cantidad: Number(salida.cantidad), motivo: salida.motivo })
      setSalida({ productoId: '', cantidad: '', motivo: '' })
      addToast('Salida registrada', 'success')
      if(selectedKardexProductId) await loadKardex(selectedKardexProductId)
    }catch(err){ setError(err.message); showApiError(addToast, err) }
  }
  const loadKardex = async (productoId) =>{
    if(!productoId) return setKardex([])
    setLoading(true)
    try{
      const [prod, data] = await Promise.all([getProduct(productoId), getKardex(productoId)])
      const currentStock = prod?.stock ?? 0
      const movements = data || []
      // movements likely come ordered by fecha desc from backend; compute saldo per row
      // delta = +cantidad for ENTRADA, -cantidad for SALIDA
      const sumDelta = movements.reduce((s, m) => {
        const tipo = (m.tipo || m.tipoMovimiento || '').toUpperCase()
        const qty = Number(m.cantidad || 0)
        return s + (tipo === 'ENTRADA' ? qty : -qty)
      }, 0)
      const startingStock = Number(currentStock) - Number(sumDelta)

      // process in chronological order (oldest first)
      const asc = movements.slice().reverse()
      let running = startingStock
      const withSaldo = asc.map(m => {
        const tipo = (m.tipo || m.tipoMovimiento || '').toUpperCase()
        const qty = Number(m.cantidad || 0)
        const delta = tipo === 'ENTRADA' ? qty : -qty
        running = running + delta
        return { ...m, saldo: running }
      })
      setKardex(withSaldo)
      setCurrentStockDisplay(currentStock)
      setStartingStockDisplay(startingStock)
    }catch(err){ setError(err.message); showApiError(addToast, err) }
    finally{ setLoading(false) }
  }

  

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Movimientos</h2>
      {loading && <div>Cargando...</div>}

      <div className="grid grid-cols-1 gap-6">
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="text-lg font-semibold">Registrar Movimiento</div>
            <div className="flex gap-2">
              <Button variant={activeTab==='entrada' ? 'success' : 'neutral'} leftIcon={<FaArrowDown />} onClick={()=>setActiveTab('entrada')}>Entrada</Button>
              <Button variant={activeTab==='salida' ? 'primary' : 'neutral'} leftIcon={<FaArrowUp />} onClick={()=>setActiveTab('salida')}>Salida</Button>
            </div>
          </div>
          <div className="p-4">
            {activeTab === 'entrada' ? (
              <form onSubmit={handleEntrada} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select value={entrada.productoId} onChange={e=>setEntrada(prev=>({...prev, productoId:e.target.value}))} className="border p-2 rounded" required>
                  <option value="">-- Producto --</option>
                  {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <input value={entrada.cantidad} onChange={e=>setEntrada(prev=>({...prev, cantidad:e.target.value}))} placeholder="Cantidad" type="number" className="border p-2 rounded" required />
                <input value={entrada.motivo} onChange={e=>setEntrada(prev=>({...prev, motivo:e.target.value}))} placeholder="Motivo" className="border p-2 rounded" required />
                <div className="md:col-span-3 text-right">
                  <Button variant="success" leftIcon={<FaPlus />}>Registrar Entrada</Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSalida} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select value={salida.productoId} onChange={e=>setSalida(prev=>({...prev, productoId:e.target.value}))} className="border p-2 rounded" required>
                  <option value="">-- Producto --</option>
                  {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <input value={salida.cantidad} onChange={e=>setSalida(prev=>({...prev, cantidad:e.target.value}))} placeholder="Cantidad" type="number" className="border p-2 rounded" required />
                <input value={salida.motivo} onChange={e=>setSalida(prev=>({...prev, motivo:e.target.value}))} placeholder="Motivo" className="border p-2 rounded" required />
                <div className="md:col-span-3 text-right">
                  <Button variant="primary" leftIcon={<FaPlus />}>Registrar Salida</Button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-lg font-semibold mb-3">Kardex por Producto</div>
          <div className="p-4">
            <select className="border p-2 rounded mb-4 w-full" value={selectedKardexProductId} onChange={e => { setSelectedKardexProductId(e.target.value); loadKardex(e.target.value) }}>
              <option value="">-- Seleccione un producto --</option>
              {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {selectedKardexProductId ? (
              <div>
                <div className="mb-3 flex gap-4 items-center">
                  <div className="text-sm">Saldo actual: <strong>{currentStockDisplay ?? '-'}</strong></div>
                  <div className="text-sm">Saldo inicial: <strong>{startingStockDisplay ?? '-'}</strong></div>
                </div>
                <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">Cantidad</th>
                      <th className="pb-2">Motivo</th>
                      <th className="pb-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kardex.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-gray-500">No hay movimientos para este producto.</td></tr>
                    ) : (
                      kardex.map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2">{row.fecha || row.createdAt || ''}</td>
                          <td className="py-2">{row.tipo || row.tipoMovimiento || ''}</td>
                          <td className="py-2">{row.cantidad}</td>
                          <td className="py-2">{row.motivo || ''}</td>
                          <td className="py-2">{row.saldo !== undefined ? row.saldo : ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Seleccione un producto para ver su kardex</div>
            )}
          </div>
        </div>
      </div>

    </section>
  )
}
