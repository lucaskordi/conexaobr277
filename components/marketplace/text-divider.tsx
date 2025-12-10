'use client'

import { useEffect, useRef, useState } from 'react'

export function TextDivider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const updateScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const elementTop = rect.top
        const windowHeight = window.innerHeight
        const elementCenter = elementTop + rect.height / 2
        const scrollProgress = (windowHeight - elementCenter) / windowHeight
        setScrollOffset(scrollProgress * 500)
      }
      animationFrameRef.current = requestAnimationFrame(updateScroll)
    }

    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(updateScroll)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const text = 'REFORMA | FORRO PVC | FERRAMENTAS | TINTAS | PAINÉIS RIPADOS | CONEXÃO BR 277 | '
  const repeatedText = Array(10).fill(text).join('')

  const formattedText = repeatedText.split('|').map((part, index, array) => {
    if (index === array.length - 1) return <span key={index}>{part}</span>
    return (
      <span key={index}>
        <span className="text-brand-yellow">{part.trim()}</span>
        <span className="text-white"> | </span>
      </span>
    )
  })

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-24 bg-brand-blue overflow-hidden"
    >
      <div 
        className="absolute top-0 left-0 right-0 h-12 flex items-center whitespace-nowrap"
        style={{
          transform: `translateX(${scrollOffset - 800}px)`,
          willChange: 'transform',
        }}
      >
        <span className="font-black text-2xl md:text-3xl uppercase">
          {formattedText}
        </span>
      </div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-12 flex items-center whitespace-nowrap"
        style={{
          transform: `translateX(${-scrollOffset - 400}px)`,
          willChange: 'transform',
        }}
      >
        <span className="font-black text-2xl md:text-3xl uppercase">
          {formattedText}
        </span>
      </div>
    </div>
  )
}

