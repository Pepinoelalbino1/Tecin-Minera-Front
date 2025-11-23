import React, { createContext, useContext, useState, useCallback } from 'react'
import Button from './ui/Button'

const ToastContext = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type='info', timeout=3000)=>{
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), timeout)
  }, [])

  const removeToast = useCallback((id)=> setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            title={t.message}
            className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded shadow-sm text-sm ${t.type==='error' ? 'bg-red-600 text-white' : t.type==='success' ? 'bg-green-600 text-white' : 'bg-primary text-white'}`}>
            <div className={t.type === 'error' ? 'whitespace-normal text-left' : 'truncate'}>
              {t.type === 'error' ? (
                <span><span className="font-semibold mr-1">Error:</span>{t.message}</span>
              ) : (
                <span className="truncate">{t.message}</span>
              )}
            </div>
            <Button variant="white" className="ml-2 px-2 py-0.5 text-sm" onClick={()=>removeToast(t.id)} aria-label="Cerrar">×</Button>
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
