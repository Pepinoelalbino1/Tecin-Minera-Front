const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://tecinapp-production.up.railway.app'

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
    const contentType = res.headers.get('content-type')
    if(contentType && contentType.includes('application/json')){
      return await res.json()
    }
    return null
  }catch(e){
    return null
  }
}

async function request(path, options){
  const url = `${API_BASE}${path}`
  try{
    if(import.meta.env.DEV){
      console.debug('[api] request', options?.method || 'GET', url)
    }
    const user = localStorage.getItem('user')
    const fetchOptions = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    }
    
    if(user) {
      const userObj = JSON.parse(user)
      if(userObj.username && userObj.password) {
        const auth = btoa(`${userObj.username}:${userObj.password}`)
        fetchOptions.headers['Authorization'] = `Basic ${auth}`
      }
    }
    
    console.debug('[api] sending with headers:', fetchOptions.headers)
    const res = await fetch(url, fetchOptions)
    return await handleResponse(res)
  }catch(err){
    console.error('[api] error:', err)
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
  return request(`/api/categorias/${id}`, { method: 'DELETE' })
}

export async function getMovimientos(){
  return request('/api/movimientos')
}

export async function getGuias(){
  return request('/api/guias')
}

// Conversiones (unidades)
export async function getConversiones(productoId){
  const q = productoId ? `?productoId=${productoId}` : ''
  return request(`/api/unidades-conversion${q}`)
}

export async function createConversion(payload){
  return request('/api/unidades-conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateConversion(id, payload){
  return request(`/api/unidades-conversion/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteConversion(id){
  return request(`/api/unidades-conversion/${id}`, { method: 'DELETE' })
}

// Products CRUD
export async function getProduct(id){
  return request(`/api/productos/${id}`)
}

  export async function register(payload){
    return request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
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
  return request(`/api/productos/${id}/estado?estado=${encodeURIComponent(estado)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  })
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

export async function login(payload){
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
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
