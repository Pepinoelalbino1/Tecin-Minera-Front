import React from 'react'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow',
  neutral: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200',
  white: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
  gold: 'bg-gold text-primary hover:opacity-90 shadow-sm hover:shadow'
}

export default function Button({ children, variant='primary', className='', leftIcon, rightIcon, ...props }){
  const cls = `px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 font-medium transition-all ${VARIANTS[variant] || VARIANTS.primary} ${className}`
  return (
    <button className={cls} {...props}>
      {leftIcon ? <span className="icon">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="icon">{rightIcon}</span> : null}
    </button>
  )
}
