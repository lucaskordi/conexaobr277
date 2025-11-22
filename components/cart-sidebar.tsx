'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface CartItem {
  id: number
  name: string
  variant?: string
  quantity: number
  price: number
  color: string
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemoveItem: (id: number) => void
  onUpdateQuantity: (id: number, delta: number) => void
  onClearCart: () => void
}

export default function CartSidebar({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, onClearCart }: CartSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const previousItemsLengthRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640)
      }
    }
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    return value.toFixed(2).replace('.', ',')
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false)
      setIsClosing(false)
    } else if (mounted && isMobile) {
      setIsMinimized(false)
    }
  }, [isOpen, isMobile, mounted])

  useEffect(() => {
    if (isOpen && items.length > previousItemsLengthRef.current && mounted && !isMobile) {
      setIsMinimized(false)
    }
    previousItemsLengthRef.current = items.length
  }, [items.length, isOpen, mounted, isMobile])

  const handleClose = () => {
    if (items.length > 0 && !isMobile) {
      setIsMinimized(true)
    } else {
      setIsClosing(true)
      setTimeout(() => {
        onClose()
      }, 300)
    }
  }

  const handleToggleMinimize = () => {
    setIsMinimized(prev => !prev)
  }

  const handleExpandFromMinimized = () => {
    if (isMinimized && !isMobile) {
      setIsMinimized(false)
    }
  }

  useEffect(() => {
    if (isOpen && !isMinimized && isMobile) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.overflow = 'unset'
        document.body.style.position = 'unset'
        document.body.style.top = 'unset'
        document.body.style.width = 'unset'
        window.scrollTo(0, scrollY)
      }
    } else if (isOpen && !isMinimized && !isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.top = 'unset'
      document.body.style.width = 'unset'
    }
  }, [isOpen, isMinimized, isMobile])

  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-50"
            />
          )}
          {isMinimized && !isMobile && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 pointer-events-none"
            />
          )}
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: -500 }}
            animate={isMobile ? { y: 0 } : { x: 0, width: isMinimized ? 60 : 500 }}
            exit={isMobile ? { y: '100%' } : { x: -500 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className={`fixed ${isMobile ? 'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl' : 'left-0 top-0 h-full'} bg-white shadow-2xl z-50 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}
          >
            <div className={`${isMinimized ? 'p-4' : 'p-6'} border-b border-gray-200 flex items-center justify-between flex-shrink-0`}>
              {!isMinimized && (
                <div className="flex items-center gap-3">
                  <svg className="w-7 h-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-brand-blue">Carrinho</h2>
                </div>
              )}
              {!isMobile && (
                <motion.button
                  onClick={handleToggleMinimize}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`${isMinimized ? 'w-12 h-12 mx-auto' : 'w-10 h-10 ml-auto'} rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center`}
                >
                  <motion.svg
                    animate={{ rotate: isMinimized ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </motion.svg>
                </motion.button>
              )}
              {isMobile && (
                <button
                  onClick={handleClose}
                  className="w-10 h-10 ml-auto rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {isMinimized && !isMobile ? (
              <motion.div 
                onClick={handleExpandFromMinimized}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex-1 flex items-center justify-center cursor-pointer"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-brand-blue"
                  >
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-xs text-gray-500"
                  >
                    itens
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isClosing ? 0 : 1,
                    x: isClosing ? -20 : 0
                  }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex-1 overflow-y-auto p-6"
                >
                  {items.length > 0 && (
                    <div className="mb-4 flex justify-end">
                      <motion.button
                        onClick={onClearCart}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Limpar Carrinho
                      </motion.button>
                    </div>
                  )}
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isClosing ? 0 : 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex gap-4">
                            <div
                              className="w-16 h-16 rounded-lg flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-brand-blue mb-1">{item.name}</h3>
                              {item.variant && (
                                <p className="text-sm text-gray-600 mb-2">{item.variant}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-8 h-8 rounded-full bg-brand-blue text-white hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-bold"
                                  >
                                    −
                                  </button>
                                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="w-8 h-8 rounded-full bg-brand-blue text-white hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-brand-blue">
                                    R$ {formatPrice(item.price * item.quantity)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    R$ {formatPrice(item.price)} cada
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: isClosing ? 0 : 1,
                      y: isClosing ? 20 : 0
                    }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-brand-blue">
                        R$ {formatPrice(total)}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => {
                        const phoneNumber = '5541995278067'
                        const itemsList = items.map(item => 
                          `${item.quantity}x ${item.name} ${item.variant || ''}`
                        ).join('\n')
                        const message = `Olá! Gostaria de comprar os seguintes itens:\n\n${itemsList}\n\nTotal: R$ ${formatPrice(total)}`
                        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                        window.open(url, '_blank')
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Comprar via WhatsApp
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
