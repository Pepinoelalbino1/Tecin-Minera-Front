import React, { createContext, useContext, useState, useCallback } from 'react'
import Button from './ui/Button'

const ToastContext = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type='info', timeout=4000)=>{
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), timeout)
  }, [])

  const removeToast = useCallback((id)=> setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow ${t.type==='error' ? 'bg-red-600 text-white' : t.type==='success' ? 'bg-green-600 text-white' : 'bg-primary text-white'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>{t.message}</div>
              <Button variant="neutral" className="ml-2 px-2 py-1 small" onClick={()=>removeToast(t.id)}>Cerrar</Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if(!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.addToast
}
