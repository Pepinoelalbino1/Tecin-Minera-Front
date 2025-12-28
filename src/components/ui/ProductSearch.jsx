import React, { useState, useRef, useEffect } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'

export default function ProductSearch({ 
  productos = [], 
  value = '', 
  onChange, 
  onBlur,
  error = null,
  placeholder = 'Buscar producto...',
  showStock = false,
  showCategory = false,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Cargar producto seleccionado cuando cambia el value
  useEffect(() => {
    if (value) {
      const product = productos.find(p => String(p.id) === String(value))
      if (product) {
        setSelectedProduct(product)
        setSearchTerm(product.nombre)
      } else {
        setSelectedProduct(null)
        setSearchTerm('')
      }
    } else {
      setSelectedProduct(null)
      setSearchTerm('')
    }
  }, [value, productos])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10) // Limitar a 10 resultados

  const handleInputChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    setIsOpen(term.length > 0)
    // Si el usuario está escribiendo y no coincide con el producto seleccionado, limpiar selección
    if (selectedProduct && !selectedProduct.nombre.toLowerCase().includes(term.toLowerCase())) {
      setSelectedProduct(null)
      onChange?.({ target: { value: '', name: 'productoId' } })
    }
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setSearchTerm(product.nombre)
    setIsOpen(false)
    onChange?.({ target: { value: String(product.id), name: 'productoId' } })
    inputRef.current?.blur()
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSearchTerm('')
    setSelectedProduct(null)
    setIsOpen(false)
    onChange?.({ target: { value: '', name: 'productoId' } })
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    if (searchTerm.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaSearch />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 ${
            error ? 'border border-red-500' : 'border border-gray-300'
          }`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelectProduct(product)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-600 last:border-b-0"
            >
              <div className="font-medium text-gray-900 dark:text-slate-100">
                {product.nombre}
              </div>
              <div className="flex gap-3 mt-1 text-sm text-gray-600 dark:text-slate-400">
                {showCategory && product.categoriaNombre && (
                  <span>Categoría: {product.categoriaNombre}</span>
                )}
                {showStock && (
                  <span>Stock: {product.stock || 0} {product.unidadMedida || 'UND'}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm.length > 0 && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-slate-400">
          No se encontraron productos
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

