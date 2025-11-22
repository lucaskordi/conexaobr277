'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

interface Panel {
  id: number
  name: string
  variant?: string
  description: string
  size: string
  color: string
  image: string
}

interface CartItem {
  id: number
  name: string
  variant?: string
  quantity: number
  price: number
  color: string
}

interface PanelCarouselProps {
  panels: Panel[]
  onAddToCart: (item: CartItem) => void
}

export default function PanelCarousel({ panels, onAddToCart }: PanelCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})

  const updateQuantity = (panelId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[panelId] || 0
      const newValue = Math.max(0, current + delta)
      return { ...prev, [panelId]: newValue }
    })
  }

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    return value.toFixed(2).replace('.', ',')
  }

  const currentPanel = panels[selectedIndex]
  const currentQuantity = quantities[currentPanel.id] || 0
  const unitPrice = currentPanel.variant === 'Mogno' ? 65.90 : 68.90
  const totalPrice = currentQuantity * unitPrice

  const handleAddToCart = () => {
    if (currentQuantity === 0) return
    
    const cartItem: CartItem = {
      id: currentPanel.id,
      name: currentPanel.name,
      variant: currentPanel.variant,
      quantity: currentQuantity,
      price: unitPrice,
      color: currentPanel.color
    }
    
    onAddToCart(cartItem)
    setQuantities((prev) => ({ ...prev, [currentPanel.id]: 0 }))
  }

  return (
    <section className="pt-0 pb-20 sm:pt-2 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-brand-white text-center mb-8"
        >
          Nossos Painéis
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 text-center"
        >
          <div className="inline-block px-6 py-4 bg-brand-white/10 backdrop-blur-sm border-2 border-brand-yellow/50 rounded-xl shadow-lg">
            <p className="text-brand-white text-lg sm:text-xl font-semibold">
              Selecione abaixo e compre via WhatsApp
            </p>
          </div>
        </motion.div>
        <div className="relative">
          <div className="bg-brand-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 min-h-[300px] md:min-h-[500px]">
              <div className="flex-1 flex">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative w-full h-full min-h-[250px] md:min-h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner"
                  >
                    {currentPanel.image ? (
                      <Image
                        src={currentPanel.image}
                        alt={currentPanel.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-lg"
                        style={{ backgroundColor: currentPanel.color }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-2">
                        {currentPanel.name}
                      </h3>
                      {currentPanel.variant && (
                        <p className="text-lg font-semibold text-gray-600 mb-2">
                          {currentPanel.variant}
                        </p>
                      )}
                      <p className="text-gray-700 mb-6 text-base leading-relaxed font-medium">
                        {currentPanel.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-600 mb-3">Selecione a cor:</p>
                    <div className="grid grid-cols-4 gap-2 md:flex md:flex-wrap">
                      {panels.map((panel, index) => (
                        <motion.button
                          key={panel.id}
                          onClick={() => setSelectedIndex(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 shadow-md transition-all ${
                            selectedIndex === index 
                              ? 'border-brand-blue scale-110 ring-2 ring-brand-blue/50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: panel.color }}
                          aria-label={`Selecionar ${panel.variant || panel.name}`}
                          title={panel.variant || panel.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600">Tamanho:</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-800">
                        {currentPanel.size}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600">Cor:</span>
                      <span
                        className="inline-block w-8 h-8 rounded-full border-3 border-gray-300 shadow-md"
                        style={{ backgroundColor: currentPanel.color }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-6 p-4 bg-gradient-to-br from-brand-yellow/10 to-yellow-50 rounded-xl border border-brand-yellow/20">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-sm text-gray-600 line-through decoration-red-500 decoration-2">
                      R$ 96,90
                    </span>
                    <span className="text-3xl font-bold text-brand-blue">
                      R$ {formatPrice(unitPrice)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Preço unitário</p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <span className="text-base font-semibold text-brand-blue">Quantidade:</span>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => updateQuantity(currentPanel.id, -1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-brand-blue text-brand-white hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center font-bold"
                    >
                      −
                    </motion.button>
                    <span className="w-16 text-center font-bold text-lg text-brand-blue">
                      {quantities[currentPanel.id] || 0}
                    </span>
                    <motion.button
                      onClick={() => updateQuantity(currentPanel.id, 1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-brand-blue text-brand-white hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center font-bold"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-brand-blue/20 to-blue-100 rounded-xl border-2 border-brand-blue/30 shadow-md">
                  <p className="text-base text-gray-800 mb-1">
                    <span className="font-semibold">Total:</span>
                  </p>
                  <p className="text-3xl font-bold text-brand-blue">
                    R$ {formatPrice(totalPrice)}
                  </p>
                </div>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={currentQuantity === 0}
                  whileHover={currentQuantity > 0 ? { scale: 1.02 } : {}}
                  whileTap={currentQuantity > 0 ? { scale: 0.98 } : {}}
                  className={`w-full mt-6 px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                    currentQuantity > 0
                      ? 'bg-gradient-to-r from-brand-blue to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentQuantity > 0 ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Adicionar ao Carrinho
                    </span>
                  ) : (
                    'Selecione a quantidade para adicionar'
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
