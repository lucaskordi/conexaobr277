'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useSwipe } from '@/hooks/use-swipe'

const applications = [
  'Salas',
  'Fachadas Internas',
  'Cozinhas',
  'Corredores',
  'Lojas',
  'Escritórios',
  'Áreas Externas Cobertas'
]

const applicationImages = [
  '/gallery/rip01.webp',
  '/gallery/rip02.jpg',
  '/gallery/rip03.jpg',
  '/gallery/rip04.webp',
  '/gallery/rip05.jpg',
  '/gallery/rip06.webp',
  '/gallery/rip07.jpg'
]

export default function ApplicationsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const swipeHandlers = useSwipe(
    () => scroll('right'),
    () => scroll('left')
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    applicationImages.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (typeof window === 'undefined') return
    const isMobile = window.innerWidth < 640
    
    if (isMobile) {
      const newIndex = direction === 'left' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(applications.length - 1, currentIndex + 1)
      
      setCurrentIndex(newIndex)
      
      if (cardRefs.current[newIndex]) {
        cardRefs.current[newIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    } else {
      if (scrollRef.current) {
        const cardWidth = 288
        const gap = 24
        const scrollAmount = cardWidth + gap
        const currentScroll = scrollRef.current.scrollLeft
        const newPosition = direction === 'left' 
          ? currentScroll - scrollAmount 
          : currentScroll + scrollAmount
        
        scrollRef.current.scrollTo({
          left: newPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  return (
    <section className="py-8 sm:py-12 px-0 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl font-bold text-brand-white text-center mb-8 sm:mb-12"
        >
          Aplicações
        </motion.h2>
        <div className="relative py-8 overflow-visible">
          <motion.button
            onClick={() => scroll('left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 z-10 w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue items-center justify-center text-xl"
            aria-label="Anterior"
          >
            ←
          </motion.button>
          <div 
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-hidden md:overflow-x-auto overflow-y-visible pb-16 pt-8 px-4 md:px-8 scroll-smooth scrollbar-hide touch-pan-x"
            style={{ scrollBehavior: 'smooth' }}
            {...swipeHandlers}
          >
            {applications.map((application, index) => (
              <motion.div
                key={index}
                ref={(el) => { cardRefs.current[index] = el }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group flex-shrink-0 w-64 sm:w-72 h-48 sm:h-56 relative rounded-2xl overflow-visible border-2 border-white/20 hover:border-brand-yellow/50 cursor-pointer shadow-lg"
              >
                <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
                  <Image
                    src={applicationImages[index]}
                    alt={application}
                    fill
                    priority={index < 3}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 transition-all duration-500 group-hover:bg-black/0" />
                </div>
                <div className="relative z-10 p-6 sm:p-8 h-full flex items-center justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-white text-center transition-opacity duration-500 group-hover:opacity-0">
                    {application}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button
            onClick={() => scroll('right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 z-10 w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue items-center justify-center text-xl"
            aria-label="Próximo"
          >
            →
          </motion.button>
          <div className="flex justify-center items-center gap-4 mt-6 md:hidden">
            <motion.button
              onClick={() => scroll('left')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue flex items-center justify-center text-xl"
              aria-label="Anterior"
            >
              ←
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue flex items-center justify-center text-xl"
              aria-label="Próximo"
            >
              →
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

