'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/marketplace/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-blue mb-4">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-700 mb-2">
            Obrigado pela sua compra.
          </p>
          {orderId && (
            <p className="text-sm text-gray-600 mb-8">
              Número do pedido: <span className="font-mono text-brand-blue">{orderId}</span>
            </p>
          )}
          <p className="text-gray-700 mb-8">
            Você receberá um email de confirmação em breve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button>Continuar Comprando</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}

