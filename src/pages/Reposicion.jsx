import React, { useEffect, useState } from 'react'
import { getProducts } from '../api/apiClient'
import Button from '../components/ui/Button'
import { useToast } from '../components/ToastContext'
import { showApiError } from '../utils/errorHelpers'
import { FaPrint } from 'react-icons/fa'

export default function Reposicion(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [reponerSelected, setReponerSelected] = useState([])
  const addToast = useToast()

  const load = async ()=>{
    setLoading(true)
    try{
      const prods = await getProducts()
      setProducts(prods || [])
      const zeros = (prods || []).filter(p => Number(p.stock) === 0).map(p => p.id)
      setReponerSelected(zeros)
    }catch(err){
      showApiError(addToast, err)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const toggleReponer = (id) =>{
    setReponerSelected(prev => {
      const s = new Set(prev || [])
      if(s.has(id)) s.delete(id)
      else s.add(id)
      return Array.from(s)
    })
  }

  const toggleSelectAll = () =>{
    const zeros = (products || []).filter(p => Number(p.stock) === 0).map(p => p.id)
    const allSelected = zeros.every(id => reponerSelected.includes(id))
    setReponerSelected(allSelected ? [] : zeros)
  }

  const handlePrintReponer = () =>{
    if(!reponerSelected || reponerSelected.length === 0) return addToast('No hay productos seleccionados para imprimir', 'warning')
    const rows = products.filter(p => reponerSelected.includes(p.id))
    const title = 'Productos a reponer'
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
    newWin.document.write('<table><thead><tr><th>Nombre</th><th>Categoría</th><th>Stock</th></tr></thead><tbody>')
    rows.forEach(r => {
      const cat = r.categoriaNombre || r.categoriaId || '-'
      newWin.document.write(`<tr><td>${r.nombre}</td><td>${cat}</td><td>${r.stock}</td></tr>`)
    })
    newWin.document.write('</tbody></table>')
    newWin.document.write('</body></html>')
    newWin.document.close()
    newWin.focus()
    setTimeout(()=>{ newWin.print(); }, 250)
  }

  if(loading) return <div className="text-gray-700">Cargando reposición...</div>

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Productos a Reponer</h2>
        <div className="stats-badge">Seleccionados: {reponerSelected.length}</div>
      </div>

      <div className="card card-padding">
        <div className="mb-4 pb-3 border-b flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Lista</h3>
          <div className="text-sm text-gray-600">Seleccionados: <strong className="ml-1">{reponerSelected.length}</strong></div>
          <label className="ml-2 inline-flex items-center text-sm text-gray-700">
            <input type="checkbox" className="mr-2" checked={(products || []).filter(p=>Number(p.stock)===0).length > 0 && (products || []).filter(p=>Number(p.stock)===0).every(p=>reponerSelected.includes(p.id))} onChange={toggleSelectAll} aria-label="Seleccionar todos" />
            Seleccionar todo
          </label>
          <div className="ml-auto">
            <Button variant="neutral" leftIcon={<FaPrint/>} onClick={handlePrintReponer} className="px-3 py-1.5 text-sm" aria-label="Imprimir productos a reponer">Imprimir</Button>
          </div>
        </div>
        <div>
          {(products || []).filter(p => Number(p.stock) === 0).length === 0 ? (
            <div className="text-sm text-gray-600">No hay productos con stock 0.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200">
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Sel</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Nombre</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Categoría</th>
                    <th className="py-2 px-3 text-right font-semibold text-gray-700">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => Number(p.stock) === 0).map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3"><input type="checkbox" checked={reponerSelected.includes(p.id)} onChange={()=>toggleReponer(p.id)} aria-label={`Seleccionar ${p.nombre}`} /></td>
                      <td className="py-2 px-3">{p.nombre}</td>
                      <td className="py-2 px-3">{p.categoriaNombre || p.categoriaId || '-'}</td>
                      <td className="py-2 px-3 text-right">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
