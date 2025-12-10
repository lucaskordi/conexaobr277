'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { ArrowRight } from 'lucide-react'

interface NewProductsMosaicProps {
  products: Product[]
}

export function NewProductsMosaic({ products }: NewProductsMosaicProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (products.length === 0) {
    return null
  }

  const mainProduct = products[0]
  const smallProducts = products.slice(1, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        {smallProducts.map((product, index) => {
          const lastImage = product.images && product.images.length > 0 
            ? product.images[product.images.length - 1] 
            : null
          
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="relative aspect-square overflow-hidden rounded-lg group"
              onMouseEnter={() => setHoveredIndex(index + 1)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {lastImage ? (
                <>
                  <Image
                    src={lastImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sem imagem</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className={`flex items-center gap-2 text-brand-yellow transition-all duration-300 ${
                  hoveredIndex === index + 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                }`}>
                  <span className="text-sm font-medium">Saiba mais</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="lg:col-span-1">
        <Link
          href={`/product/${mainProduct.id}`}
          className="relative aspect-square lg:aspect-auto lg:h-full overflow-hidden rounded-lg group block"
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {mainProduct.images && mainProduct.images.length > 0 ? (
            <>
              <Image
                src={mainProduct.images[mainProduct.images.length - 1]}
                alt={mainProduct.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-2xl mb-3 line-clamp-2">
              {mainProduct.name}
            </h3>
            <div className={`flex items-center gap-2 text-brand-yellow transition-all duration-300 ${
              hoveredIndex === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}>
              <span className="text-base font-medium">Saiba mais</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}




