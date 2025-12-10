'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/marketplace/navbar'
import { getProducts } from '@/services/yampi'
import { Product } from '@/types'

export default function DebugProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [rawData, setRawData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const originalConsoleLog = console.log
        const logs: any[] = []
        
        console.log = (...args: any[]) => {
          logs.push(args)
          originalConsoleLog(...args)
        }

        const result = await getProducts({ limit: 3 })
        
        setProducts(result.products)
        setRawData({
          logs: logs.filter(log => 
            log[0]?.includes('Mapeando produto') || 
            log[0]?.includes('Resposta completa') ||
            log[0]?.includes('Produto mapeado')
          ),
          products: result.products,
        })
      } catch (error) {
        console.error('Erro:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-6">
          <h1 className="text-3xl font-bold text-brand-blue mb-6">
            Debug de Produtos
          </h1>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-brand-blue mb-4">
                  Produtos Mapeados ({products.length})
                </h2>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">ID:</span> {product.id}
                        </div>
                        <div>
                          <span className="font-semibold">Preço:</span>{' '}
                          {product.price > 0 ? (
                            <span className="text-green-600">
                              R$ {product.price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-red-600">Não disponível</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">Imagens:</span>{' '}
                          {product.images.length > 0 ? (
                            <span className="text-green-600">
                              {product.images.length} imagem(ns)
                            </span>
                          ) : (
                            <span className="text-red-600">Nenhuma</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">Descrição:</span>{' '}
                          {product.description ? (
                            <span className="text-green-600">
                              {product.description.length} caracteres
                            </span>
                          ) : (
                            <span className="text-red-600">Vazia</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold">Imagens URLs:</span>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {product.images.length > 0 ? (
                              product.images.map((img, i) => (
                                <li key={i} className="text-xs break-all">
                                  {img}
                                </li>
                              ))
                            ) : (
                              <li className="text-red-600">Nenhuma imagem</li>
                            )}
                          </ul>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold">Descrição:</span>
                          <p className="mt-1 text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                            {product.description || (
                              <span className="text-gray-400 italic">
                                Sem descrição
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">
                  📋 Instruções:
                </h3>
                <ol className="list-decimal list-inside text-sm text-yellow-900 space-y-1">
                  <li>Abra o Console do navegador (F12 ou Cmd+Option+I)</li>
                  <li>Vá para a aba "Console"</li>
                  <li>Recarregue esta página (F5)</li>
                  <li>Procure pelos logs que começam com 🔍, 📦 e ✅</li>
                  <li>Copie os logs que mostram "Dados brutos" e envie para ajustar o mapeamento</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




