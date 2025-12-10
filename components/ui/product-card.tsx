'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { Button } from './button'
import { useCartStore } from '@/store/cart-store'
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const images = product.images && product.images.length > 0 ? product.images : []
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    if (hasMultipleImages && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 5000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [hasMultipleImages, images.length, isHovered])

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleAddToCart = () => {
    const variant = product.variants?.[0]
    addItem({
      id: `${product.id}-${variant?.id || 'default'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/placeholder-product.jpg',
      variantId: variant?.id,
      variantName: variant?.name,
      skuId: variant?.id,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
    })
    openCart()
  }

  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="group relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-brand-yellow/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <Link href={`/product/${product.id}`} className="block flex-shrink-0">
        <div 
          className="relative aspect-square w-full overflow-hidden bg-gray-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <Image
                key={`${product.id}-${index}`}
                src={image}
                alt={product.name}
                fill
                className={`object-cover group-hover:scale-105 transition-all duration-500 ${
                  index === currentImageIndex
                    ? 'opacity-100 z-0'
                    : 'opacity-0 z-[-1] absolute'
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
          
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-blue p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-blue p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'w-6 bg-brand-yellow'
                        : 'w-1.5 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              -{discountPercentage}%
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-brand-blue mb-1 line-clamp-2 group-hover:text-brand-yellow transition-colors min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        {product.category && (product.category.name === 'Forro PVC' || product.category.name === 'Painel Ripado') && product.dimensions && (
          <p className="text-xs text-gray-500 mb-2">
            {[
              product.dimensions.width && `${product.dimensions.width}cm`,
              product.dimensions.height && `${product.dimensions.height}cm`,
              product.dimensions.length && `${product.dimensions.length}cm`
            ].filter(Boolean).join(' × ')}
          </p>
        )}
        
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className="text-sm text-gray-500">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          {product.price > 0 ? (
            <>
              <span className="text-xl font-bold text-brand-blue">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  R$ {product.compareAtPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-500">Preço não disponível</span>
          )}
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleAddToCart}
            className="w-full leading-tight sm:leading-normal"
            disabled={product.active === false}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.active === false ? 'Indisponível' : 'Adicionar ao carrinho'}
          </Button>
        </div>
      </div>
    </div>
  )
}

