'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Category } from '@/types'
import { getCategories } from '@/services/yampi'
import { useSwipe } from '@/hooks/use-swipe'

export function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const isScrollingRef = useRef(false)

  const allCategories = useMemo(() => {
    return categories.reduce<Category[]>((acc, cat) => {
      acc.push(cat)
      if (cat.children) {
        acc.push(...cat.children)
      }
      return acc
    }, [])
  }, [categories])

  const infiniteCategories = useMemo(() => {
    return [...allCategories, ...allCategories, ...allCategories]
  }, [allCategories])

  const swipeHandlers = useSwipe(
    () => scroll('right'),
    () => scroll('left')
  )

  useEffect(() => {
    getCategories().then((cats) => {
      const filtered = cats.filter(cat => cat.name.toLowerCase() !== 'novidades')
      setCategories(filtered)
    })
  }, [])

  useEffect(() => {
    if (!scrollRef.current || allCategories.length === 0) return

    const handleScroll = () => {
      if (!scrollRef.current || isScrollingRef.current) return

      const { scrollLeft } = scrollRef.current
      const cardWidth = 288
      const gap = 24
      const cardWithGap = cardWidth + gap
      const sectionWidth = allCategories.length * cardWithGap
      const middleSectionStart = sectionWidth
      const middleSectionEnd = sectionWidth * 2

      if (scrollLeft < sectionWidth) {
        isScrollingRef.current = true
        scrollRef.current.scrollLeft = scrollLeft + sectionWidth
        setTimeout(() => {
          isScrollingRef.current = false
        }, 50)
      } else if (scrollLeft > middleSectionEnd) {
        isScrollingRef.current = true
        scrollRef.current.scrollLeft = scrollLeft - sectionWidth
        setTimeout(() => {
          isScrollingRef.current = false
        }, 50)
      }
    }

    const scrollElement = scrollRef.current
    scrollElement.addEventListener('scroll', handleScroll)

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [allCategories.length])

  useEffect(() => {
    if (scrollRef.current && allCategories.length > 0) {
      const cardWidth = 288
      const gap = 24
      const cardWithGap = cardWidth + gap
      const offset = allCategories.length * cardWithGap
      scrollRef.current.scrollLeft = offset
    }
  }, [allCategories.length])

  const scroll = (direction: 'left' | 'right') => {
    if (typeof window === 'undefined' || !scrollRef.current || allCategories.length === 0) return
    const isMobile = window.innerWidth < 640
    
    if (isMobile) {
      let newIndex: number
      if (direction === 'left') {
        newIndex = currentIndex === 0 ? allCategories.length - 1 : currentIndex - 1
      } else {
        newIndex = currentIndex === allCategories.length - 1 ? 0 : currentIndex + 1
      }
      
      setCurrentIndex(newIndex)
      
      if (cardRefs.current[newIndex]) {
        cardRefs.current[newIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    } else {
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

  const getCategoryImage = (categoryName: string): string | null => {
    const name = categoryName.toLowerCase()
    if (name.includes('forro') && name.includes('pvc')) {
      return '/pvcat.png'
    }
    if (name.includes('churrasqueira')) {
      return '/churrasq.png'
    }
    if (name.includes('painel') && name.includes('ripado')) {
      return '/painel.png'
    }
    if (name.includes('ferramentas') || name.includes('ferramenta')) {
      return '/ferram.png'
    }
    return null
  }


  if (allCategories.length === 0) {
    return null
  }

  return (
    <section className="py-8 sm:py-12 px-0 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-8 sm:mb-12 mt-16 sm:mt-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-white mb-2">
            Categorias
          </h2>
          <div className="w-24 h-1 bg-brand-yellow mx-auto"></div>
        </motion.div>
        <div className="relative py-8 overflow-visible">
          <motion.button
            onClick={() => scroll('left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 z-10 w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue items-center justify-center"
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
            {infiniteCategories.map((category, index) => {
              const categoryImage = getCategoryImage(category.name)
              const originalIndex = index % allCategories.length
              
              return (
                <motion.div
                  key={`${category.id}-${index}`}
                  ref={(el) => { 
                    if (index >= allCategories.length && index < allCategories.length * 2) {
                      cardRefs.current[originalIndex] = el
                    }
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                  className="group flex-shrink-0 w-64 sm:w-72 flex flex-col items-center cursor-pointer"
                >
                  <Link href={`/products?category=${category.id}`} className="block w-full">
                    {categoryImage ? (
                      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg">
                        <Image
                          src={categoryImage}
                          alt={category.name}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square mb-4 rounded-lg bg-gradient-to-br from-brand-blue to-blue-900 flex items-center justify-center">
                        <span className="text-brand-white text-lg font-bold">{category.name}</span>
                      </div>
                    )}
                    <h3 className="text-xl sm:text-2xl font-bold text-brand-white text-center">
                      {category.name}
                    </h3>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          <motion.button
            onClick={() => scroll('right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 z-10 w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue items-center justify-center"
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
          <div className="flex justify-center items-center gap-4 mt-6 md:hidden">
            <motion.button
              onClick={() => scroll('left')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue flex items-center justify-center"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-brand-white text-brand-blue rounded-full hover:bg-gray-50 transition-all font-bold shadow-lg border-2 border-brand-blue flex items-center justify-center"
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

