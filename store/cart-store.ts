import { create } from 'zustand'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getItemCount: () => number
  loadFromStorage: () => void
  saveToStorage: () => void
}

const STORAGE_KEY = 'cart-storage'

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (item) => {
    const existingItem = get().items.find(
      (i) => i.id === item.id && i.variantId === item.variantId
    )
    
    if (existingItem) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === item.id && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        ),
      }))
    } else {
      set((state) => ({
        items: [...state.items, { ...item, quantity: item.quantity || 1 }],
      }))
    }
    get().saveToStorage()
  },
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }))
    get().saveToStorage()
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }))
    get().saveToStorage()
  },
  clearCart: () => {
    set({ items: [] })
    get().saveToStorage()
  },
  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }))
  },
  openCart: () => {
    set({ isOpen: true })
  },
  closeCart: () => {
    set({ isOpen: false })
  },
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        set({ items: data.items || [] })
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error)
    }
  },
  saveToStorage: () => {
    if (typeof window === 'undefined') return
    try {
      const items = get().items
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
    } catch (error) {
      console.error('Error saving cart to storage:', error)
    }
  },
}))

if (typeof window !== 'undefined') {
  useCartStore.getState().loadFromStorage()
}

