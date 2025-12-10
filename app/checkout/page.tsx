'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/marketplace/navbar'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { getCheckoutUrl } from '@/services/yampi'
import Image from 'next/image'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotal = useCartStore((state) => state.getTotal)
  const clearCart = useCartStore((state) => state.clearCart)

  const [isLoading, setIsLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const isOnlyPainelRipado = items.length > 0 && items.every(item => 
    item.categoryName?.toLowerCase() === 'painel ripado'
  )

  const subtotal = getTotal()
  const shipping = 0
  const total = subtotal + shipping

  useEffect(() => {
    async function prepareCheckout() {
      if (items.length === 0) return

      setIsLoading(true)
      try {
        const checkoutItems = items.map((item) => ({
          productId: item.productId,
          skuId: item.skuId || item.variantId,
          quantity: item.quantity,
        }))

        const url = await getCheckoutUrl(checkoutItems)
        if (url) {
          setCheckoutUrl(url)
        } else {
          setError('Não foi possível gerar o link de checkout. Tente novamente.')
        }
      } catch (err) {
        console.error('Erro ao preparar checkout:', err)
        setError('Erro ao preparar checkout. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    prepareCheckout()
  }, [items])

  const handleCheckout = () => {
    if (!checkoutUrl) {
      setError('Checkout não disponível. Tente novamente.')
      return
    }

    window.location.href = checkoutUrl
  }


  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">Seu carrinho está vazio</p>
            <Button onClick={() => router.push('/products')}>
              Ver Produtos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isOnlyPainelRipado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6 max-w-2xl mx-auto">
              <p className="font-semibold text-lg mb-2">Checkout não disponível</p>
              <p className="text-sm mb-4">
                O checkout online está disponível apenas para carrinhos contendo exclusivamente Painéis Ripados.
              </p>
              <p className="text-sm">
                Para outros produtos, utilize o botão "Comprar via WhatsApp" no carrinho.
              </p>
            </div>
            <Button onClick={() => router.push('/products')}>
              Voltar para Produtos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-6 mb-6">
              <h2 className="text-2xl font-bold text-brand-blue mb-4">
                Finalizar Compra
              </h2>
              
              {!isOnlyPainelRipado && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                  <p className="font-semibold mb-1">Atenção:</p>
                  <p className="text-sm">
                    O checkout online está disponível apenas para carrinhos contendo exclusivamente Painéis Ripados. 
                    Para outros produtos, utilize o botão "Comprar via WhatsApp".
                  </p>
                </div>
              )}
              
              {isOnlyPainelRipado && (
                <p className="text-gray-600 mb-6">
                  Você será redirecionado para o checkout seguro da Yampi para finalizar sua compra.
                </p>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <LoadingSpinner size="lg" />
                  <span className="text-gray-600">Preparando checkout...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {!isLoading && checkoutUrl && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Informações importantes:
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Você será redirecionado para o checkout seguro da Yampi</li>
                      <li>O pagamento será processado pela plataforma Yampi</li>
                      <li>Você receberá confirmação por email após a compra</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={!checkoutUrl || isLoading || !isOnlyPainelRipado}
                    size="lg"
                    className="w-full"
                    title={!isOnlyPainelRipado ? "Checkout disponível apenas para carrinhos com apenas Painéis Ripados" : undefined}
                  >
                    Ir para o Checkout da Yampi
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-brand-blue mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {item.name}
                      </h3>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-gray-900">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-gray-500">
                          x {item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Frete</span>
                  <span>R$ {shipping.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

