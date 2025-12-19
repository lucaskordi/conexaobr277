'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/marketplace/navbar'
import { Hero } from '@/components/marketplace/hero'
import { CategoriesCarousel } from '@/components/marketplace/categories-carousel'
import { NewProductsMosaic } from '@/components/marketplace/new-products-mosaic'
import { ProductsCarousel } from '@/components/marketplace/products-carousel'
import { CartSidebar } from '@/components/marketplace/cart-sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TextDivider } from '@/components/marketplace/text-divider'
// import { Showroom360 } from '@/components/marketplace/showroom-360'
import Footer from '@/components/footer'
import ContactForm from '@/components/contact-form'
import WhatsAppButton from '@/components/whatsapp-button'
import { getProducts, getCategories } from '@/services/yampi'
import { Product, Category } from '@/types'
import Link from 'next/link'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingNew, setIsLoadingNew] = useState(true)
  const [tintaCategoryId, setTintaCategoryId] = useState<string | null>(null)

  useEffect(() => {
    getProducts({ limit: 8 }).then((result) => {
      setFeaturedProducts(result.products)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const categories = await getCategories()
        const novidadesCategory = categories.find(cat => cat.name.toLowerCase() === 'novidades')
        
        const findAllCategories = (cats: Category[]): Category[] => {
          const all: Category[] = []
          cats.forEach(cat => {
            all.push(cat)
            if (cat.children) {
              all.push(...cat.children)
            }
          })
          return all
        }
        
        const allCategories = findAllCategories(categories)
        const tintaCategory = allCategories.find(cat => 
          cat.name.toLowerCase().includes('tinta')
        )
        
        if (tintaCategory) {
          setTintaCategoryId(tintaCategory.id)
        }
        
        if (novidadesCategory) {
          const result = await getProducts({ categoryId: novidadesCategory.id, limit: 8 })
          setNewProducts(result.products)
        } else {
          const result = await getProducts({ limit: 20 })
          setNewProducts(result.products.slice(0, 8))
        }
      } catch (error) {
        console.error('Erro ao buscar produtos novos:', error)
        const result = await getProducts({ limit: 8 })
        setNewProducts(result.products)
      } finally {
        setIsLoadingNew(false)
      }
    }
    
    fetchNewProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />
      <Hero />
      <CategoriesCarousel />
      
      <div className="w-full">
        <section className="w-full py-20 bg-blue-600/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-white mb-2">
                Novidades
              </h2>
              <div className="w-24 h-1 bg-brand-yellow mx-auto mb-4"></div>
              <p className="text-brand-white/80">
                Confira nossos produtos mais recentes
              </p>
            </div>

            {isLoadingNew ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : newProducts.length > 0 ? (
              <NewProductsMosaic products={newProducts.slice(0, 5)} />
            ) : (
              <div className="text-center py-12">
                <p className="text-brand-white/80 text-lg">
                  Nenhum produto encontrado. Verifique sua conexão com a API.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="w-full relative">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-600/40 z-0"></div>
          {tintaCategoryId ? (
            <Link href={`/products?category=${tintaCategoryId}`} className="block cursor-pointer relative z-10">
              <Image
                src="/suv.png"
                alt="Suvinil"
                width={1920}
                height={600}
                className="w-full h-auto object-cover transition-opacity hover:opacity-90"
                priority
              />
            </Link>
          ) : (
            <Image
              src="/suv.png"
              alt="Suvinil"
              width={1920}
              height={600}
              className="w-full h-auto object-cover relative z-10"
              priority
            />
          )}
        </div>
      </div>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-white mb-2">
            Produtos em Destaque
          </h2>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mb-4"></div>
          <p className="text-brand-white/80">
            Confira nossos produtos mais populares
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : featuredProducts.length > 0 ? (
          <ProductsCarousel products={featuredProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-brand-white/80 text-lg">
              Nenhum produto encontrado. Verifique sua conexão com a API.
            </p>
          </div>
        )}
      </section>

      <div className="py-16">
        <TextDivider />
      </div>

      {/* <div id="showroom">
        <Showroom360 />
      </div> */}

      <div id="contact">
        <ContactForm />
      </div>

      <Footer />

      <WhatsAppButton />

      <CartSidebar />
    </div>
  )
}
