'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { testConnection, getProducts, getCategories, syncProducts } from '@/services/yampi'
import { Navbar } from '@/components/marketplace/navbar'

export default function TestYampiPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTestConnection = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const connection = await testConnection()
      setResults({ type: 'connection', data: connection })

      if (connection.success) {
        const [productsResult, categories] = await Promise.all([
          getProducts({ limit: 5 }),
          getCategories(),
        ])

        setResults({
          type: 'full',
          connection,
          products: {
            total: productsResult.totalCount,
            items: productsResult.products,
          },
          categories: {
            total: categories.length,
            items: categories,
          },
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProducts = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const sync = await syncProducts()
      setResults({ type: 'sync', data: sync })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-brand-blue mb-6">
            Teste de Integração Yampi
          </h1>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-brand-blue mb-2">
                Configuração Necessária:
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>NEXT_PUBLIC_YAMPI_STORE_ALIAS (obrigatório) - Alias da sua loja</li>
                <li>NEXT_PUBLIC_YAMPI_USER_TOKEN (obrigatório) - Token de usuário</li>
                <li>NEXT_PUBLIC_YAMPI_USER_SECRET (obrigatório) - Chave secreta</li>
                <li>NEXT_PUBLIC_YAMPI_API_URL (opcional, padrão: https://api.dooki.com.br)</li>
                <li>NEXT_PUBLIC_YAMPI_API_VERSION (opcional, padrão: v2)</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                Configure essas variáveis no arquivo .env.local
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleTestConnection}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Testando...' : 'Testar Conexão'}
              </Button>
              <Button
                onClick={handleSyncProducts}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Sincronizando...' : 'Sincronizar Produtos'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Erro:</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {results.type === 'connection' && (
                <div className={`border rounded-lg p-4 ${
                  results.data.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    results.data.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {results.data.success ? '✓ Conexão OK' : '✗ Erro na Conexão'}
                  </h3>
                  <p className={`text-sm ${
                    results.data.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {results.data.message}
                  </p>
                </div>
              )}

              {results.type === 'full' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✓ Conexão Estabelecida
                    </h3>
                    <p className="text-green-700 text-sm">
                      {results.connection.message}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-brand-blue mb-3">
                      Produtos Encontrados: {results.products.total}
                    </h3>
                    {results.products.items.length > 0 ? (
                      <div className="space-y-2">
                        {results.products.items.map((product: any) => (
                          <div
                            key={product.id}
                            className="border border-gray-200 rounded p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-gray-600">
                              ID: {product.id} | Preço: R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        Nenhum produto encontrado
                      </p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-brand-blue mb-3">
                      Categorias Encontradas: {results.categories.total}
                    </h3>
                    {results.categories.items.length > 0 ? (
                      <div className="space-y-2">
                        {results.categories.items.map((category: any) => (
                          <div
                            key={category.id}
                            className="border border-gray-200 rounded p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {category.name}
                            </p>
                            <p className="text-gray-600">
                              ID: {category.id} | Slug: {category.slug}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        Nenhuma categoria encontrada
                      </p>
                    )}
                  </div>
                </>
              )}

              {results.type === 'sync' && (
                <div className={`border rounded-lg p-4 ${
                  results.data.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    results.data.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {results.data.success ? '✓ Sincronização Concluída' : '✗ Erro na Sincronização'}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    results.data.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Produtos sincronizados: {results.data.count}
                  </p>
                  {results.data.errors && results.data.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-red-800">Erros:</p>
                      <ul className="list-disc list-inside text-xs text-red-700">
                        {results.data.errors.map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-brand-blue mb-3">
              Próximos Passos:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Configure as variáveis de ambiente no arquivo .env.local</li>
              <li>Teste a conexão usando o botão acima</li>
              <li>Se a conexão for bem-sucedida, os produtos aparecerão automaticamente no marketplace</li>
              <li>Consulte o arquivo YAMPI_INTEGRATION.md para mais detalhes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

