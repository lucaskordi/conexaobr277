'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart-store'
import { getCategories } from '@/services/yampi'
import { Category } from '@/types'
import { ShoppingCart, Menu, X, ChevronDown, Search } from 'lucide-react'
import { Button } from '../ui/button'

export function Navbar() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  const itemCount = useCartStore((state) => state.getItemCount())
  const openCart = useCartStore((state) => state.openCart)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    getCategories().then((cats) => {
      const filtered = cats.filter(cat => cat.name.toLowerCase() !== 'novidades')
      setCategories(filtered)
    })
  }, [])

  useEffect(() => {
    let lastScrollY = 0
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollDifference = currentScrollY - lastScrollY

          if (currentScrollY <= 10) {
            setIsVisible(true)
          } else if (scrollDifference > 0 && currentScrollY > 100) {
            setIsVisible(false)
          } else if (scrollDifference < 0) {
            setIsVisible(true)
          }

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      <div className="h-16"></div>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-blue/90 border-b border-white/10 shadow-md transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/conexaologo.svg"
                alt="Logo"
                width={140}
                height={47}
                priority
                className="h-10 w-auto"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/"
                className="relative text-brand-white hover:text-brand-yellow font-medium transition-all duration-300 hover:scale-105 group"
              >
                Início
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-3/4" />
              </Link>
              <Link
                href="/products"
                className="relative text-brand-white hover:text-brand-yellow font-medium transition-all duration-300 hover:scale-105 group"
              >
                Produtos
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-3/4" />
              </Link>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById('contact')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="relative text-brand-white hover:text-brand-yellow font-medium transition-all duration-300 hover:scale-105 group cursor-pointer"
              >
                Contato
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-3/4" />
              </a>
              
              {categories.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setIsMenuOpen(true)}
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button className="relative flex items-center gap-1 text-brand-white hover:text-brand-yellow font-medium transition-all duration-300 hover:scale-105 group">
                    Categorias
                    <ChevronDown className="w-4 h-4" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-3/4" />
                  </button>
                  
                    <div 
                      className={`absolute top-full left-0 mt-3 pt-3 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-300 ease-out ${
                        isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="absolute -top-3 left-0 right-0 h-3" onMouseEnter={() => setIsMenuOpen(true)} />
                      {categories.filter(cat => cat.name.toLowerCase() !== 'novidades').map((category) => (
                        <div key={category.id} className="relative group">
                          <Link
                            href={`/products?category=${category.id}`}
                            className="block w-full text-left px-4 py-2 rounded-md text-brand-blue hover:bg-brand-blue/10 transition-colors"
                            onClick={() => handleCategoryClick(category.id)}
                            onMouseEnter={() => setIsMenuOpen(true)}
                          >
                            {category.name}
                          </Link>
                          {category.children && category.children.length > 0 && (
                            <div className="absolute left-full top-0 ml-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                              {category.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/products?category=${child.id}`}
                                  className="block w-full text-left px-4 py-2 rounded-md text-brand-blue hover:bg-brand-blue/10 transition-colors"
                                  onClick={() => handleCategoryClick(child.id)}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="O que você procura?"
                  className="w-64 px-4 py-2 pl-10 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-brand-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              </div>
              <button
                type="submit"
                className="ml-2 p-2 bg-brand-yellow text-brand-blue rounded-lg hover:bg-yellow-400 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            <Button
              variant="ghost"
              size="sm"
              onClick={openCart}
              className="relative text-brand-white hover:text-brand-yellow hover:bg-white/10"
            >
              <ShoppingCart className="w-5 h-5" />
              {isMounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-blue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </Button>

            <button
              className="lg:hidden p-2 text-brand-white hover:text-brand-yellow transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <form onSubmit={handleSearch} className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="O que você procura?"
                  className="w-full px-4 py-2 pl-10 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-brand-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              </div>
              <button
                type="submit"
                className="mt-2 w-full py-2 bg-brand-yellow text-brand-blue rounded-lg hover:bg-yellow-400 transition-colors font-medium"
              >
                Buscar
              </button>
            </form>
            <Link
              href="/"
              className="block px-4 py-2 text-brand-white hover:bg-white/10 hover:text-brand-yellow transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-brand-white hover:bg-white/10 hover:text-brand-yellow transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Produtos
            </Link>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                setIsMobileMenuOpen(false)
                const element = document.getElementById('contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="block px-4 py-2 text-brand-white hover:bg-white/10 hover:text-brand-yellow transition-colors cursor-pointer"
            >
              Contato
            </a>
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  className="w-full flex items-center justify-between px-4 py-2 text-brand-white hover:bg-white/10 hover:text-brand-yellow transition-colors"
                  onClick={() =>
                    setOpenDropdown(openDropdown === category.id ? null : category.id)
                  }
                >
                  {category.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openDropdown === category.id && category.children && (
                  <div className="pl-4">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.id}`}
                        className="block px-4 py-2 text-brand-white/80 hover:bg-white/10 hover:text-brand-yellow transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 w-full z-0">
        <div 
          className="h-full w-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255, 206, 0, 0.8) 30%, rgba(255, 206, 0, 1) 50%, rgba(255, 206, 0, 0.8) 70%, transparent 100%)"
          }}
        />
      </div>
    </nav>
    </>
  )
}

