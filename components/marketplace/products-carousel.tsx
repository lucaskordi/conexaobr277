'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/ui/product-card'
import { Product } from '@/types'
import { useSwipe } from '@/hooks/use-swipe'

interface ProductsCarouselProps {
  products: Product[]
}

export function ProductsCarousel({ products }: ProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const swipeHandlers = useSwipe(
    () => scroll('right'),
    () => scroll('left')
  )

  const scroll = (direction: 'left' | 'right') => {
    if (typeof window === 'undefined') return
    const isMobile = window.innerWidth < 640
    
    if (isMobile) {
      const newIndex = direction === 'left' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(products.length - 1, currentIndex + 1)
      
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

  if (products.length === 0) {
    return null
  }

  return (
    <div className="relative py-8 overflow-visible">
      <motion.button
        onClick={() => scroll('left')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 z-10 w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue items-center justify-center text-xl"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>
      <div 
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-hidden md:overflow-x-auto overflow-y-visible pb-16 pt-8 px-4 md:px-8 scroll-smooth scrollbar-hide touch-pan-x"
        style={{ scrollBehavior: 'smooth' }}
        {...swipeHandlers}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={(el) => { cardRefs.current[index] = el }}
            className="flex-shrink-0 w-64 sm:w-72"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <motion.button
        onClick={() => scroll('right')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 z-10 w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue items-center justify-center text-xl"
        aria-label="Próximo"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
      <div className="flex justify-center items-center gap-4 mt-6 md:hidden">
        <motion.button
          onClick={() => scroll('left')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue flex items-center justify-center text-xl"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <motion.button
          onClick={() => scroll('right')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue flex items-center justify-center text-xl"
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  )
}




