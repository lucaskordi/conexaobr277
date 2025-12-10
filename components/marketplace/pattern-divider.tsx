'use client'

import { useEffect, useRef, useState } from 'react'

export function PatternDivider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const patternRef = useRef<HTMLDivElement>(null)
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
        setScrollOffset(scrollProgress * 1000)
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

  const patternSize = 1490
  const scale = 8
  const scaledSize = patternSize / scale
  const containerHeight = 80
  const tilesInContainer = Math.ceil(containerHeight / scaledSize) + 1
  const tilesAbove = 5
  const tilesBelow = 5
  const totalTiles = tilesAbove + tilesInContainer + tilesBelow
  const patternStartOffset = -(tilesInContainer * scaledSize - containerHeight) / 2

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-20 bg-brand-yellow overflow-hidden"
    >
      <div 
        ref={patternRef}
        className="absolute"
        style={{
          transform: `translateY(${scrollOffset + patternStartOffset}px)`,
          willChange: 'transform',
          top: `-${scaledSize * tilesAbove}px`,
          left: 0,
          right: 0,
          height: `${scaledSize * totalTiles}px`,
        }}
      >
        {Array.from({ length: totalTiles }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex"
            style={{ 
              marginTop: rowIndex === 0 ? '0' : `-${scaledSize}px`,
            }}
          >
            {Array.from({ length: 20 }).map((_, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className="flex-shrink-0"
                style={{
                  width: `${scaledSize}px`,
                  height: `${scaledSize}px`,
                  marginLeft: colIndex === 0 ? '0' : `-${scaledSize}px`,
                }}
              >
                <img
                  src="/pattern.svg"
                  alt=""
                  className="opacity-[0.05] mix-blend-multiply"
                  style={{
                    display: 'block',
                    width: `${scaledSize}px`,
                    height: `${scaledSize}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

