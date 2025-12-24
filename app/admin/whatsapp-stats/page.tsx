'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Stats {
  total: number
  bySource: Record<string, number>
  clicks: Array<{ source: string; timestamp: string }>
}

export default function WhatsAppStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    }
    
    try {
      const startTime = Date.now()
      const res = await fetch('/api/whatsapp-stats')
      const data = await res.json()
      
      const elapsed = Date.now() - startTime
      const minWaitTime = 2000
      
      if (elapsed < minWaitTime) {
        await new Promise(resolve => setTimeout(resolve, minWaitTime - elapsed))
      }
      
      setStats(data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading stats:', err)
      setLoading(false)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-blue/90 border-b border-white/10 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
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
            </div>
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
        <div className="h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-center">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-blue/90 border-b border-white/10 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
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
            </div>
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
        <div className="h-16"></div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-center text-red-600">Erro ao carregar estatísticas</p>
        </div>
      </div>
    )
  }

  const sourceLabels: Record<string, string> = {
    'whatsapp-button-floating': 'Botão Flutuante WhatsApp',
    'cart-sidebar-whatsapp': 'Carrinho - Compre pelo WhatsApp',
    'cart-modal-bulk-purchase': 'Modal Carrinho - Comprar Pelo WhatsApp (25+ itens)',
    'checkout-modal-bulk-purchase': 'Modal Checkout - Comprar Pelo WhatsApp (25+ itens)',
    'cart-sidebar-old-whatsapp': 'Carrinho Antigo - Comprar via WhatsApp',
    'lpwpc-consultant-button': 'LPWPC - Botão Consultor',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-blue/90 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
          </div>
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
      <div className="h-16"></div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-brand-blue">
            Estatísticas de Cliques no WhatsApp
          </h1>
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              refreshing
                ? 'bg-brand-yellow text-brand-blue cursor-wait'
                : 'bg-brand-blue text-white hover:bg-blue-700'
            }`}
          >
            {refreshing && <LoadingSpinner size="sm" />}
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Total de Cliques: {stats.total}
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Cliques por Origem
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div
                    key={source}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {sourceLabels[source] || source}
                      </p>
                      <p className="text-sm text-gray-500">{source}</p>
                    </div>
                    <div className="text-2xl font-bold text-brand-blue">
                      {count}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Histórico Completo ({stats.clicks.length} cliques)
            </h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-700">Origem</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.clicks
                    .slice()
                    .reverse()
                    .map((click, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {sourceLabels[click.source] || click.source}
                            </p>
                            <p className="text-xs text-gray-500">{click.source}</p>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(click.timestamp).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
