'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getCategories } from '@/services/yampi'
import { Category } from '@/types'

interface HeroSlide {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  mobileImage?: string
}

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [painelRipadoCategoryId, setPainelRipadoCategoryId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getCategories().then((categories) => {
      const findCategory = (cats: Category[]): Category | null => {
        for (const cat of cats) {
          if (cat.name.toLowerCase() === 'painel ripado') {
            return cat
          }
          if (cat.children) {
            const found = findCategory(cat.children)
            if (found) return found
          }
        }
        return null
      }
      
      const category = findCategory(categories)
      if (category) {
        setPainelRipadoCategoryId(String(category.id))
      }
    })
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const slides: HeroSlide[] = [
    {
      title: 'Transforme seu Ambiente!',
      subtitle: 'Com nosso painel ripado WPC,\nnunca foi tão fácil e prático deixar\nseu espaço ainda mais incrível!',
      ctaText: 'Conheça Nossos Painéis',
      ctaLink: painelRipadoCategoryId ? `/products?category=${painelRipadoCategoryId}` : '/products',
      image: '/hero.webp',
      mobileImage: '/mobilehero01.webp',
    },
    {
      title: 'O Maior estoque\nde Forros PVC\nestá aqui!',
      subtitle: 'Uma infinidade de cores e tamanhos\nà pronta entrega!\n\nCompre online ou venha até\no nosso showroom!',
      ctaText: 'Conheça Nosso Estoque',
      ctaLink: '/products',
      image: '/hero3.webp',
      mobileImage: '/mobilehero2.webp',
    },
  ]

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000)
  }

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    resetTimer()
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    resetTimer()
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    resetTimer()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide 
                ? 'opacity-100 pointer-events-auto z-10' 
                : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${isMobile && slide.mobileImage ? slide.mobileImage : slide.image})`,
              }}
            />
            
            <div className={`relative h-full flex items-center z-20 ${index === 1 ? 'justify-end' : ''}`}>
              <div className={`w-full ${index === 1 ? 'pr-8 md:pr-12 lg:pr-16 pl-8 md:pl-12 lg:pl-16' : 'px-8 md:px-12 lg:px-16'}`}>
                <div className={`max-w-2xl ${index === 1 ? 'ml-auto text-right' : ''}`}>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-gray-700 mb-8 whitespace-pre-line">
                    {slide.subtitle}
                  </p>
                  <Link href={slide.ctaLink} className={`inline-block group relative z-30 ${index === 1 ? 'ml-auto' : ''}`}>
                    <Button 
                      size="lg" 
                      className="shadow-2xl group-hover:shadow-yellow-500/50 transition-all duration-300 group-hover:scale-105 active:scale-95 relative z-30"
                    >
                      {slide.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

