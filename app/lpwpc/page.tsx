'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Hero from '@/components/hero'
import ApplicationsCarousel from '@/components/applications-carousel'
import PanelCarousel from '@/components/panel-carousel'
import PhotoGallery from '@/components/photo-gallery'
import AdvantagesSection from '@/components/advantages-section'
import ContactForm from '@/components/contact-form'
import WhatsAppButton from '@/components/whatsapp-button'
import Footer from '@/components/footer'
import CartSidebar from '@/components/cart-sidebar'

interface CartItem {
  id: number
  name: string
  variant?: string
  quantity: number
  price: number
  color: string
}

const samplePanels = [
  {
    id: 1,
    name: 'Painel Ripado',
    variant: 'Cinza',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#808080',
    image: '/prods/cinza.png',
  },
  {
    id: 2,
    name: 'Painel Ripado',
    variant: 'Cinza Rajado',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#A9A9A9',
    image: '/prods/cinzarajado.png',
  },
  {
    id: 3,
    name: 'Painel Ripado',
    variant: 'Ipê Rajado',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#8B4513',
    image: '/prods/iperajado.png',
  },
  {
    id: 4,
    name: 'Painel Ripado',
    variant: 'Jequitibá',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#D2B48C',
    image: '/prods/jequitiba.png',
  },
  {
    id: 5,
    name: 'Painel Ripado',
    variant: 'Marfim',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#F5F5DC',
    image: '/prods/marfim.webp',
  },
  {
    id: 6,
    name: 'Painel Ripado',
    variant: 'Tabaco',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#D2691E',
    image: '/prods/tabaco.png',
  },
  {
    id: 7,
    name: 'Painel Ripado',
    variant: 'Preto',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#000000',
    image: '/prods/preto.png',
  },
  {
    id: 8,
    name: 'Painel Ripado',
    variant: 'Mogno',
    description: 'WPC Externo',
    size: '0,16m x 2,80m',
    color: '#8B4513',
    image: '/prods/mogno.png',
  },
]

const sampleGalleryImages = [
  '/gallery/cinza.webp',
  '/gallery/cinzinha.webp',
  '/gallery/marfim.webp',
  '/gallery/mogno.webp',
  '/gallery/preto.webp',
  '/gallery/rajj.webp',
  '/gallery/tabaco.webp',
  '/gallery/tabacow.webp',
]

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
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

  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return

      const touchCurrentX = e.touches[0].clientX
      const touchCurrentY = e.touches[0].clientY
      const diffX = Math.abs(touchCurrentX - touchStartX)
      const diffY = Math.abs(touchCurrentY - touchStartY)

      const element = document.elementFromPoint(touchCurrentX, touchCurrentY)
      const scrollableElement = element?.closest('.overflow-x-auto, .overflow-x-scroll, [data-scrollable]')

      if (!scrollableElement && diffX > diffY && diffX > 10) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id)
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
    setIsCartOpen(true)
  }

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900 overflow-x-hidden">
      <header className="pt-6 pb-6 px-4 sm:px-6 lg:px-8 backdrop-blur-md bg-brand-blue/70 fixed sm:sticky top-0 left-0 right-0 z-40 shadow-md border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`max-w-7xl mx-auto ${isMobile ? 'flex items-center justify-center relative' : ''}`}
        >
          <Image
            src="/conexaologo.svg"
            alt="Conexão Logo"
            width={280}
            height={94}
            priority
            className={`w-auto h-16 sm:h-20 drop-shadow-lg ${isMobile ? '' : 'mx-auto'}`}
          />
          {isMobile && (
            <motion.button
              onClick={() => setIsCartOpen(true)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-0 w-12 h-12 bg-brand-white text-brand-blue rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300"
              aria-label="Abrir carrinho"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-brand-yellow text-brand-blue rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md"
                >
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </motion.span>
              )}
            </motion.button>
          )}
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-1 w-full">
          <div 
            className="h-full w-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255, 206, 0, 0.8) 30%, rgba(255, 206, 0, 1) 50%, rgba(255, 206, 0, 0.8) 70%, transparent 100%)"
            }}
          />
        </div>
      </header>

      <Hero />

      <ApplicationsCarousel />

      <PanelCarousel 
        panels={samplePanels} 
        onAddToCart={handleAddToCart}
      />

      <PhotoGallery images={sampleGalleryImages} />

      <AdvantagesSection />

      <section className="py-12 sm:py-24 pb-16 sm:pb-32 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => {
              const phoneNumber = '5541995278067'
              const message = 'Olá, vim do site. Gostaria de saber mais informações.'
              const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
              window.open(url, '_blank')
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-5 bg-gradient-to-r from-brand-yellow to-yellow-400 text-brand-blue rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform"
          >
            Clique aqui e fale com um de nossos consultores
          </motion.button>
        </motion.div>
      </section>

      <div id="contact">
        <ContactForm />
      </div>

      <WhatsAppButton />

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
      />
    </div>
  )
}
