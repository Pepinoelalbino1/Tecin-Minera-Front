const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function handleResponse(res){
  if(!res.ok){
    const text = await res.text().catch(()=>null)
    let parsed = null
    try{ parsed = text ? JSON.parse(text) : null }catch(e){ parsed = null }
    const message = (parsed && (parsed.message || parsed.error)) ? (parsed.message || parsed.error) : (text || res.statusText || 'API error')
    const err = new Error(message)
    err.api = parsed
    err.status = res.status
    throw err
  }
  try{
    return await res.json()
  }catch(e){
    return null
  }
}

async function request(path, options){
  const url = `${API_BASE}${path}`
  try{
    // Helpful debug log in dev
    if(import.meta.env.DEV){
      // eslint-disable-next-line no-console
      console.debug('[api] request', options?.method || 'GET', url)
    }
    const res = await fetch(url, options)
    return await handleResponse(res)
  }catch(err){
    // Wrap network errors with the URL so the frontend shows useful info
    throw new Error(`Network error fetching ${url}: ${err.message}`)
  }
}

export async function getProducts(){
  return request('/api/productos')
}

export async function getCategories(){
  return request('/api/categorias')
}

export async function createCategory(payload){
  return request('/api/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateCategory(id, payload){
  return request(`/api/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteCategory(id){
  const url = `/api/categorias/${id}`
  try{
    const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE' })
    if(!res.ok) throw new Error('Error deleting category')
    return null
  }catch(err){
    throw new Error(`Network error deleting ${API_BASE}${url}: ${err.message}`)
  }
}

export async function getMovimientos(){
  return request('/api/movimientos')
}

export async function getGuias(){
  return request('/api/guias')
}

// Products CRUD
export async function getProduct(id){
  return request(`/api/productos/${id}`)
}

export async function createProduct(payload){
  return request('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateProduct(id, payload){
  return request(`/api/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateProductEstado(id, estado){
  const url = `/api/productos/${id}/estado?estado=${encodeURIComponent(estado)}`
  try{
    const res = await fetch(`${API_BASE}${url}`, { method: 'PATCH' })
    return await handleResponse(res)
  }catch(err){
    throw new Error(`Network error patching estado ${API_BASE}${url}: ${err.message}`)
  }
}

// Movimientos
export async function registrarEntrada(payload){
  return request('/api/movimientos/entrada', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function registrarSalida(payload){
  return request('/api/movimientos/salida', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function getKardex(productoId){
  return request(`/api/movimientos/kardex/${productoId}`)
}

// Guias
export async function createGuia(payload){
  return request('/api/guias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function addDetalleGuia(id, payload){
  return request(`/api/guias/${id}/detalle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteDetalleGuia(guiaId, detalleId){
  return request(`/api/guias/${guiaId}/detalle/${detalleId}`, { method: 'DELETE' })
}

export async function emitirGuia(id){
  return request(`/api/guias/${id}/emitir`, { method: 'PUT' })
}

export function guiaPdfUrl(id){
  return `${API_BASE}/api/guias/${id}/pdf`
}

export default {
  getProducts,
  getCategories,
  createCategory,
  getMovimientos,
  getGuias
}
