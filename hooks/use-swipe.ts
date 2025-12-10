import { useRef, useState } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
): SwipeHandlers {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  const minSwipeDistance = threshold

  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    touchStartYRef.current = e.targetTouches[0].clientY
  }

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(null)
      setTouchEnd(null)
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    setTouchStart(null)
    setTouchEnd(null)
    touchStartYRef.current = null
  }

  return {
    onTouchStart: onTouchStartHandler,
    onTouchMove: onTouchMoveHandler,
    onTouchEnd: onTouchEndHandler
  }
}

