export interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  categoryId?: string
  category?: Category
  stock?: number
  sku?: string
  rating?: number
  reviewCount?: number
  variants?: ProductVariant[]
  dimensions?: {
    width?: number
    height?: number
    length?: number
  }
  active?: boolean
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
  sku: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  children?: Category[]
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  variantName?: string
  skuId?: string
  skuToken?: string
  purchaseUrl?: string
  categoryId?: string
  categoryName?: string
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  subtotal: number
  shipping: number
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  status: string
  createdAt: string
}

