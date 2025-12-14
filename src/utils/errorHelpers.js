export function formatApiError(err){
  if(!err) return 'Error desconocido'
  if(typeof err === 'string') return err
  if(err.api){
    const api = err.api
    if(api.message) return api.message
    const status = err.status ? `${err.status} — ` : ''
    const type = api.error ? `${api.error}: ` : ''
    const message = api.error || err.message || JSON.stringify(api)
    return `${status}${type}${message}`
  }
  try{
    const maybeJson = err.message && err.message.indexOf('{')>=0 ? JSON.parse(err.message.substring(err.message.indexOf('{'))) : null
    if(maybeJson && (maybeJson.message || maybeJson.error)){
      return `${maybeJson.status ? maybeJson.status + ' — ' : ''}${maybeJson.error ? maybeJson.error + ': ' : ''}${maybeJson.message || maybeJson.error}`
    }
  }catch(e){ /* ignore */ }
  return err.message || String(err)
}

export function showApiError(addToast, err, fallback){
  const msg = formatApiError(err) || fallback || 'Error de conexión'
  try{ addToast(msg, 'error') }catch(e){ console.error('failed to show toast', e) }
}
