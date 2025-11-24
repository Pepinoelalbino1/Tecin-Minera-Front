import React, { useEffect, useState } from 'react'
import { registrarEntrada, registrarSalida, getKardex, getProducts, getProduct } from '../api/apiClient'
import Button from '../components/ui/Button'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'
import { FaArrowDown, FaArrowUp, FaPlus, FaPrint } from 'react-icons/fa'

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

  const handlePrintKardex = () =>{
    if(!selectedKardexProductId) return addToast('Seleccione un producto primero', 'warning')
    const table = document.getElementById('kardexTable')
    if(!table) return addToast('No hay datos para imprimir', 'warning')
    const product = productos.find(p=>String(p.id) === String(selectedKardexProductId))
    const title = product?.nombre ? `Kardex - ${product.nombre}` : 'Kardex'
    const style = `
      body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #111827 }
      h1 { font-size: 18px; margin-bottom: 8px }
      table { border-collapse: collapse; width: 100%; }
      table th, table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left }
      table thead { background: #f9fafb }
    `
    const newWin = window.open('', '_blank')
    if(!newWin) return addToast('No se pudo abrir la ventana de impresión', 'error')
    newWin.document.write(`<!doctype html><html><head><title>${title}</title><meta charset="utf-8"><style>${style}</style></head><body>`)
    newWin.document.write(`<h1>${title}</h1>`)
    newWin.document.write(`<div>Saldo Inicial: ${startingStockDisplay ?? '-'} &nbsp;&nbsp; Saldo Actual: ${currentStockDisplay ?? '-'}</div><br/>`)
    newWin.document.write(table.outerHTML)
    newWin.document.write('</body></html>')
    newWin.document.close()
    newWin.focus()
    setTimeout(()=>{ newWin.print(); }, 250)
  }

  

  return (
    <section>
      <div className="section-header">
        <h1 className="page-title">Movimientos</h1>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <div className="text-lg font-semibold text-gray-800">Registrar Movimiento</div>
            <div className="flex gap-2">
              <Button variant={activeTab==='entrada' ? 'success' : 'neutral'} leftIcon={<FaArrowDown />} onClick={()=>setActiveTab('entrada')} className="px-4 py-2">Entrada</Button>
              <Button variant={activeTab==='salida' ? 'primary' : 'neutral'} leftIcon={<FaArrowUp />} onClick={()=>setActiveTab('salida')} className="px-4 py-2">Salida</Button>
            </div>
          </div>
          <div>
            {activeTab === 'entrada' ? (
              <form onSubmit={handleEntrada}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Producto</label>
                    <select value={entrada.productoId} onChange={e=>setEntrada(prev=>({...prev, productoId:e.target.value}))} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required>
                      <option value="">Seleccionar producto</option>
                      {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Cantidad</label>
                    <input value={entrada.cantidad} onChange={e=>setEntrada(prev=>({...prev, cantidad:e.target.value}))} placeholder="0" type="number" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  <div>
                    <label className="form-label">Motivo</label>
                    <input value={entrada.motivo} onChange={e=>setEntrada(prev=>({...prev, motivo:e.target.value}))} placeholder="Compra, Devolución, etc." className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required />
                  </div>
                </div>
                {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                <div className="mt-4 flex justify-end">
                  <Button variant="success" leftIcon={<FaPlus />}>Registrar Entrada</Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSalida}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Producto</label>
                    <select value={salida.productoId} onChange={e=>setSalida(prev=>({...prev, productoId:e.target.value}))} className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required>
                      <option value="">Seleccionar producto</option>
                      {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Cantidad</label>
                    <input value={salida.cantidad} onChange={e=>setSalida(prev=>({...prev, cantidad:e.target.value}))} placeholder="0" type="number" className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required />
                  </div>
                  <div>
                    <label className="form-label">Motivo</label>
                    <input value={salida.motivo} onChange={e=>setSalida(prev=>({...prev, motivo:e.target.value}))} placeholder="Venta, Consumo, etc." className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-primary/20" required />
                  </div>
                </div>
                {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                <div className="mt-4 flex justify-end">
                  <Button variant="primary" leftIcon={<FaPlus />}>Registrar Salida</Button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="card card-padding">
          <div className="mb-4 pb-3 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Kardex por Producto</h3>
          </div>
          <div>
            <div className="mb-6">
              <label className="form-label">Seleccionar Producto</label>
              <select className="border border-gray-300 p-2.5 rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-primary/20" value={selectedKardexProductId} onChange={e => { setSelectedKardexProductId(e.target.value); loadKardex(e.target.value) }}>
                <option value="">Seleccione un producto</option>
                {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            {selectedKardexProductId ? (
              <div>
                <div className="mb-5 flex gap-6 items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Saldo Actual</div>
                    <div className="text-2xl font-bold text-primary">{currentStockDisplay ?? '-'}</div>
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Saldo Inicial</div>
                    <div className="text-2xl font-bold text-gray-700">{startingStockDisplay ?? '-'}</div>
                  </div>
                  <div className="ml-auto">
                    <Button variant="neutral" leftIcon={<FaPrint />} onClick={handlePrintKardex} className="px-3 py-1.5 text-sm" aria-label="Imprimir kardex" title="Imprimir kardex">Imprimir</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table id="kardexTable" className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200">
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Fecha</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Tipo</th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">Cantidad</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Motivo</th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kardex.length === 0 ? (
                        <tr><td colSpan={5} className="py-12 text-center text-gray-500">No hay movimientos para este producto.</td></tr>
                      ) : (
                        kardex.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{row.fecha || row.createdAt || '-'}</td>
                            <td className="py-3 px-4">
                              <span className={`badge ${(row.tipo || row.tipoMovimiento || '').toUpperCase() === 'ENTRADA' ? 'badge-success' : 'badge-primary'}`}>
                                {row.tipo || row.tipoMovimiento || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">{row.cantidad || 0}</td>
                            <td className="py-3 px-4 text-gray-600">{row.motivo || '-'}</td>
                            <td className="py-3 px-4 text-right font-bold text-primary">{row.saldo !== undefined ? row.saldo : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-state py-12">Seleccione un producto para ver su kardex</div>
            )}
          </div>
        </div>
      </div>

    </section>
  )
}
