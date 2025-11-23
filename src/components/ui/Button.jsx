import React from 'react'

const VARIANTS = {
  primary: 'bg-primary text-white hover:opacity-95',
  success: 'bg-green-600 text-white hover:bg-green-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  neutral: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  gold: 'bg-gold text-primary hover:opacity-90'
}

export default function Button({ children, variant='primary', className='', leftIcon, rightIcon, ...props }){
  const cls = `px-4 py-2 rounded inline-flex items-center gap-2 ${VARIANTS[variant] || VARIANTS.primary} ${className}`
  return (
    <button className={cls} {...props}>
      {leftIcon ? <span className="icon">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="icon">{rightIcon}</span> : null}
    </button>
  )
}
