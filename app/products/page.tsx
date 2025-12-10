'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/marketplace/navbar'
import { ProductCard } from '@/components/ui/product-card'
import { CartSidebar } from '@/components/marketplace/cart-sidebar'
import { Button } from '@/components/ui/button'
import { getProducts, getCategories } from '@/services/yampi'
import { Product, Category } from '@/types'
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import WhatsAppButton from '@/components/whatsapp-button'

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(() => {
    return !searchParams.get('category')
  })

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam)
    }
    
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam || '')
    }
    
    setCurrentPage(1)
  }, [searchParams])

  useEffect(() => {
    setIsLoading(true)
    getProducts({
      categoryId: selectedCategory || undefined,
      search: searchQuery || undefined,
      page: currentPage,
      limit: 12,
    }).then((result) => {
      setProducts(result.products)
      setTotalPages(result.totalPages)
      setIsLoading(false)
    })
  }, [selectedCategory, searchQuery, currentPage])

  useEffect(() => {
    if (selectedCategory) {
      setIsFiltersExpanded(false)
    } else {
      setIsFiltersExpanded(true)
    }
  }, [selectedCategory])

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const getAllCategories = (cats: Category[]): Category[] => {
    const all: Category[] = []
    cats.forEach((cat) => {
      all.push(cat)
      if (cat.children) {
        all.push(...getAllCategories(cat.children))
      }
    })
    return all
  }

  const getCategoryName = (categoryId: string | null): string | null => {
    if (!categoryId) return null
    const allCategories = getAllCategories(categories)
    const category = allCategories.find(cat => cat.id === categoryId)
    return category?.name || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            className={`lg:w-64 flex-shrink-0 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 sticky top-20 overflow-hidden ${
              !isFiltersExpanded ? 'pb-0' : ''
            }`}>
              <div className={`flex items-center justify-between w-full px-6 group transition-all duration-300 ${
                isFiltersExpanded ? 'py-4' : 'py-3'
              }`}>
                <button
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <h2 className="text-lg font-bold text-brand-blue">Filtros</h2>
                </button>
                <div className="flex items-center gap-1">
                  {isFiltersExpanded ? (
                    <>
                      <button
                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronUp className="w-5 h-5 text-brand-blue group-hover:text-brand-yellow transition-colors" />
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronDown className="w-5 h-5 text-brand-blue group-hover:text-brand-yellow transition-colors" />
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out px-6 ${
                  isFiltersExpanded ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'
                }`}
              >
                <div>
                  <h3 className="font-semibold text-brand-blue mb-2">
                    Categorias
                  </h3>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      !selectedCategory
                        ? 'bg-brand-yellow/20 text-brand-blue font-medium'
                        : 'text-brand-blue hover:bg-brand-blue/10'
                    }`}
                  >
                    Todos os produtos
                  </button>
                  {getAllCategories(categories).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-brand-yellow/20 text-brand-blue font-medium'
                          : 'text-brand-blue hover:bg-brand-blue/10'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedCategory && getCategoryName(selectedCategory) === 'Painel Ripado' && (
              <div className="mt-6 space-y-2">
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-01.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Não Empena</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-02.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Não Mofa</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-03.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Não Cria Cupim</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-04.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Fácil Instalação</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-06.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Acabamento Premium</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-05.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Fácil de Limpar</p>
                </div>
              </div>
            )}

            {selectedCategory && getCategoryName(selectedCategory) === 'Forro PVC' && (
              <div className="mt-6 space-y-2">
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-02.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Não Mofa</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-03.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Não Cria Cupim</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-04.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Fácil Instalação</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-06.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Acabamento Premium</p>
                </div>
                <div className="bg-brand-yellow rounded-lg shadow-md border border-yellow-300 px-4 py-2 flex items-center gap-3">
                  <Image src="/ic-05.png" alt="" width={64} height={64} className="flex-shrink-0" />
                  <p className="text-brand-blue font-semibold">Fácil de Limpar</p>
                </div>
              </div>
            )}
          </aside>

          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-brand-white">
                    Produtos
                  </h1>
                  {selectedCategory && getCategoryName(selectedCategory) && (
                    <>
                      <div className="h-8 w-0.5 bg-brand-yellow" />
                      <h2 className="text-xl font-semibold text-brand-white/90">
                        {getCategoryName(selectedCategory)}
                      </h2>
                    </>
                  )}
                </div>
                {selectedCategory && getCategoryName(selectedCategory) && (
                  <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`O que você procura em ${getCategoryName(selectedCategory)}?`}
                        className="w-96 px-4 py-2 pl-10 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-brand-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    </div>
                    <button
                      type="submit"
                      className="p-2 bg-brand-yellow text-brand-blue rounded-lg hover:bg-yellow-400 transition-colors"
                      aria-label="Buscar"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </form>
                )}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded"
                >
                  <Filter className="w-5 h-5 text-brand-white" />
                </button>
              </div>

                <form onSubmit={handleSearch} className="mb-6 lg:hidden flex items-center gap-2">
                  <div className="relative flex-1">
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
                    className="p-2 bg-brand-yellow text-brand-blue rounded-lg hover:bg-yellow-400 transition-colors"
                    aria-label="Buscar"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="px-4 py-2 text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500 text-lg">
                  Nenhum produto encontrado.
                </p>
                {selectedCategory && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleCategoryChange(null)}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

          <CartSidebar />
          <WhatsAppButton />
        </div>
      )
    }

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}

