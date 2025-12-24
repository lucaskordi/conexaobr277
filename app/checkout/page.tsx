'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/marketplace/navbar'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { getCheckoutUrl } from '@/services/yampi'
import Image from 'next/image'
import { ArrowLeft, Trash2, Plus, Minus, X } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { trackWhatsAppClick } from '@/lib/track-whatsapp'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const clearCart = useCartStore((state) => state.clearCart)

  const [isLoading, setIsLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)

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
        console.log('🛒 Itens do carrinho antes do agrupamento:', items.map(i => ({ 
          id: i.id, 
          productId: i.productId, 
          skuId: i.skuId, 
          variantId: i.variantId, 
          quantity: i.quantity 
        })))
        
        const itemMap = new Map<string, { productId: string; skuId: string; quantity: number }>()
        
        items.forEach((item) => {
          const skuId = String(item.skuId || item.variantId || 'default').trim()
          const productId = String(item.productId).trim()
          const key = `${productId}-${skuId}`
          
          if (itemMap.has(key)) {
            const existing = itemMap.get(key)!
            existing.quantity += item.quantity
          } else {
            itemMap.set(key, {
              productId: productId,
              skuId: skuId,
              quantity: item.quantity,
            })
          }
        })

        const checkoutItems = Array.from(itemMap.values())
        console.log('🛒 Itens agrupados para checkout:', checkoutItems.map(i => ({ productId: i.productId, skuId: i.skuId, quantity: i.quantity })))

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

    const totalItems = getItemCount()
    if (totalItems >= 25) {
      setShowBulkModal(true)
      return
    }

    window.location.href = checkoutUrl
  }

  const handleWhatsAppBulk = () => {
    trackWhatsAppClick('checkout-modal-bulk-purchase')
    const phoneNumber = '5541995278067'
    const itemsList = items.map(item => 
      `${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''}`
    ).join('\n')
    const message = `Olá! Vou comprar mais de 25 itens e gostaria de fazer uma negociação especial.\n\nItens no carrinho:\n${itemsList}\n\nTotal: R$ ${getTotal().toFixed(2).replace('.', ',')}`
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleContinueOnline = () => {
    setShowBulkModal(false)
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    }
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
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowBulkModal(false)
                router.back()
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-8">
              <h3 className="text-2xl font-bold text-brand-blue mb-4">
                Negociação Especial
              </h3>
              <p className="text-gray-700 text-lg mb-6">
                Vai comprar mais de 25 itens? Fale com a gente pelo WhatsApp e tenha a melhor negociação
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleWhatsAppBulk}
                className="w-full h-12 px-6 text-base font-bold rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Comprar Pelo WhatsApp
              </button>
              
              <button
                onClick={handleContinueOnline}
                className="w-full h-12 px-6 text-base font-bold rounded-md border-2 border-brand-blue bg-white text-brand-blue transition-all duration-300 hover:bg-brand-blue hover:text-white hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Continuar Comprando Online
              </button>
            </div>
          </div>
        </div>
      )}

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

