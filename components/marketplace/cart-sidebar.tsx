'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { Button } from '../ui/button'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { getCheckoutUrl } from '@/services/yampi'
import { LoadingSpinner } from '../ui/loading-spinner'
import { trackWhatsAppClick } from '@/lib/track-whatsapp'

export function CartSidebar() {
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const closeCart = useCartStore((state) => state.closeCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const clearCart = useCartStore((state) => state.clearCart)

  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

  const isOnlyPainelRipado = items.length > 0 && items.every(item => 
    item.categoryName?.toLowerCase() === 'painel ripado'
  )

  const handleCheckout = async () => {
    if (!isOnlyPainelRipado || items.length === 0) return

    const totalItems = getItemCount()
    if (totalItems >= 25) {
      setShowBulkModal(true)
      return
    }

    setIsLoadingCheckout(true)
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
        closeCart()
        window.location.href = url
      } else {
        alert('Não foi possível gerar o link de checkout. Tente novamente.')
        setIsLoadingCheckout(false)
      }
    } catch (error) {
      console.error('Erro ao preparar checkout:', error)
      alert('Erro ao preparar checkout. Tente novamente.')
      setIsLoadingCheckout(false)
    }
  }

  const handleWhatsAppBulk = () => {
    trackWhatsAppClick('cart-modal-bulk-purchase')
    const phoneNumber = '5541995278067'
    const itemsList = items.map(item => 
      `${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''}`
    ).join('\n')
    const message = `Olá! Vou comprar mais de 25 itens e gostaria de fazer uma negociação especial.\n\nItens no carrinho:\n${itemsList}\n\nTotal: R$ ${getTotal().toFixed(2).replace('.', ',')}`
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    setShowBulkModal(false)
    closeCart()
  }

  const handleContinueOnline = async () => {
    setShowBulkModal(false)
    setIsLoadingCheckout(true)
    try {
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
      const url = await getCheckoutUrl(checkoutItems)
      if (url) {
        closeCart()
        window.location.href = url
      } else {
        alert('Não foi possível gerar o link de checkout. Tente novamente.')
        setIsLoadingCheckout(false)
      }
    } catch (error) {
      console.error('Erro ao preparar checkout:', error)
      alert('Erro ao preparar checkout. Tente novamente.')
      setIsLoadingCheckout(false)
    }
  }

  return (
    <>
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowBulkModal(false)}
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

      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ease-out"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden'
        }}
        onClick={closeCart}
      />
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[60] flex flex-col transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-brand-blue">
          <h2 className="text-xl font-bold text-brand-white">Carrinho</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-brand-blue/80 rounded-full transition-colors text-brand-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-sm">Adicione produtos para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-brand-blue truncate mb-1">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-gray-500 mb-2">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-lg font-bold text-brand-blue mb-2">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-brand-blue/10 rounded transition-colors text-brand-blue"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-brand-blue">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-brand-blue/10 rounded transition-colors text-brand-blue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-6 bg-gray-50">
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-brand-blue">Total:</span>
              <span className="text-brand-blue">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
            </div>
            {isOnlyPainelRipado ? (
              <Button 
                onClick={handleCheckout}
                disabled={isLoadingCheckout}
                className="w-full text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-yellow-500/50" 
                size="lg"
              >
                {isLoadingCheckout ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Preparando checkout...
                  </span>
                ) : (
                  'Finalizar Compra'
                )}
              </Button>
            ) : (
              <Button 
                className="w-full text-base font-bold transition-all duration-300 shadow-lg opacity-50 cursor-not-allowed" 
                size="lg"
                disabled
                title="Finalizar Compra disponível apenas para carrinhos com apenas Painéis Ripados"
              >
                Finalizar Compra
              </Button>
            )}
            <button
              type="button"
              onClick={() => {
                trackWhatsAppClick('cart-sidebar-whatsapp')
                const phoneNumber = '5541995278067'
                const isMultiple = items.length > 1
                const greeting = isMultiple 
                  ? 'Olá! Vim do Site e gostaria de informações sobre os produtos:'
                  : 'Olá! Vim do Site e gostaria de informações sobre o produto:'
                
                const itemsList = items.map(item => 
                  `${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''}`
                ).join('\n')
                
                const message = `${greeting}\n\n${itemsList}`
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                window.open(url, '_blank')
                closeCart()
              }}
              className="w-full h-11 px-8 text-base font-bold rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Compre pelo WhatsApp
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full h-11 px-8 text-base font-bold rounded-md border-2 border-brand-blue bg-white text-brand-blue transition-all duration-300 hover:bg-brand-blue hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
              style={{
                color: 'var(--color-brand-blue)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-brand-blue)'
              }}
            >
              Limpar Carrinho
            </button>
          </div>
        )}
      </div>
    </>
  )
}

