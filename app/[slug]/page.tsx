'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/marketplace/navbar'
import { CartSidebar } from '@/components/marketplace/cart-sidebar'
import { Button } from '@/components/ui/button'
import { getProduct, getProductBySlug, getProducts } from '@/services/yampi'
import { Product, ProductVariant } from '@/types'
import { useCartStore } from '@/store/cart-store'
import { ShoppingCart, Star, ArrowLeft, Plus, Minus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import WhatsAppButton from '@/components/whatsapp-button'

type VariantAttribute = {
  value: string
  variantId: string
}

type GroupedVariants = {
  colors: VariantAttribute[]
  sizes: VariantAttribute[]
  other: ProductVariant[]
}

function parseVariantName(name: string): { color?: string; size?: string; rest?: string } {
  const normalized = name.trim()
  const lowerNormalized = normalized.toLowerCase()
  
  if (/\bbranca\b/i.test(normalized) || /\bbranco\b/i.test(normalized)) {
    const sizeMatch = normalized.match(/\b(\d+)\s*(cm|CM|centímetros?|centimetros?)?\b/i)
    return {
      color: 'Branca',
      size: sizeMatch ? sizeMatch[1] + ' cm' : undefined,
      rest: normalized
    }
  }
  
  if (/\bpreta\b/i.test(normalized) || /\bpreto\b/i.test(normalized)) {
    const sizeMatch = normalized.match(/\b(\d+)\s*(cm|CM|centímetros?|centimetros?)?\b/i)
    return {
      color: 'Preta',
      size: sizeMatch ? sizeMatch[1] + ' cm' : undefined,
      rest: normalized
    }
  }
  
  if (/\btijolo\b/i.test(normalized) && !/\btijolinho\b/i.test(normalized)) {
    const sizeMatch = normalized.match(/\b(\d+)\s*(cm|CM|centímetros?|centimetros?)?\b/i)
    return {
      color: 'Tijolo',
      size: sizeMatch ? sizeMatch[1] + ' cm' : undefined,
      rest: normalized
    }
  }
  
  const numericSizePattern = /\b(\d+)\s*(cm|CM|centímetros?|centimetros?)?\b/i
  const textSizePattern = /\b(PP|P|M|G|GG|XG|XXG|XXXG|UN|ÚNICO|ÚNICA|ÚN|XS|S|L|XL|XXL|XXXL)\b/i
  
  const commonColors = [
    'Tijolo', 'Tijolo Queimado', 'Tijolo Claro', 'Tijolo Escuro',
    'Vermelho', 'Vermelho Escuro', 'Vermelho Claro', 'Vermelho Vinho',
    'Azul', 'Azul Escuro', 'Azul Claro', 'Azul Marinho', 'Azul Royal', 'Azul Céu', 'Azul Turquesa',
    'Verde', 'Verde Escuro', 'Verde Claro', 'Verde Musgo', 'Verde Limão', 'Verde Floresta',
    'Amarelo', 'Amarelo Ouro', 'Amarelo Limão', 'Amarelo Mostarda',
    'Preto', 'Preta', 'Preto Fosco', 'Preto Brilhante',
    'Branco', 'Branca', 'Branco Gelo', 'Branco Neve', 'Branco Off-white',
    'Rosa', 'Rosa Claro', 'Rosa Escuro', 'Rosa Choque', 'Rosa Bebê',
    'Roxo', 'Roxo Claro', 'Roxo Escuro', 'Roxo Lavanda', 'Lilás',
    'Laranja', 'Laranja Queimado', 'Laranja Claro',
    'Marrom', 'Marrom Claro', 'Marrom Escuro', 'Marrom Chocolate', 'Marrom Caramelo',
    'Cinza', 'Cinza Claro', 'Cinza Escuro', 'Cinza Chumbo', 'Cinza Grafite', 'Cinza Perla',
    'Bege', 'Bege Claro', 'Bege Escuro', 'Bege Areia',
    'Dourado', 'Dourado Claro', 'Dourado Escuro', 'Ouro',
    'Prateado', 'Prata', 'Prata Claro',
    'Marfim', 'Marfim Claro',
    'Caramelo', 'Caramelo Claro', 'Caramelo Escuro',
    'Nude', 'Nude Claro', 'Nude Escuro',
    'Coral', 'Coral Claro', 'Coral Escuro',
    'Turquesa', 'Turquesa Claro', 'Turquesa Escuro',
    'Lilás', 'Lilás Claro', 'Lilás Escuro',
    'Bordô', 'Bordô Escuro',
    'Grafite', 'Grafite Claro', 'Grafite Escuro',
    'Chumbo', 'Chumbo Claro', 'Chumbo Escuro',
    'Off-white', 'Ivory', 'Cream', 'Navy',
    'Royal', 'Sky', 'Forest', 'Lime', 'Olive', 'Khaki', 'Tan', 'Camel', 'Taupe', 'Mocha',
    'Espresso', 'Charcoal', 'Slate', 'Silver', 'Gold', 'Bronze', 'Copper', 'Rose', 'Blush',
    'Peach', 'Salmon', 'Terracotta', 'Burgundy', 'Wine', 'Plum', 'Lavender', 'Mint', 'Teal',
    'Aqua', 'Cyan', 'Indigo', 'Violet', 'Magenta', 'Fuchsia', 'Crimson', 'Scarlet', 'Ruby',
    'Emerald', 'Jade', 'Sage', 'Mustard', 'Amber', 'Honey', 'Butter', 'Lemon', 'Sunshine',
    'Sunset', 'Rust', 'Cinnamon', 'Nutmeg', 'Cocoa', 'Ebony', 'Jet', 'Onyx', 'Pearl', 'Gray',
    'Grey', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Brown',
    'Black', 'Noce', 'Nogueira', 'Mogno', 'Cerejeira', 'Carvalho', 'Pinus', 'Eucalipto',
    'Natural', 'Natural Claro', 'Natural Escuro', 'Madeira', 'Madeira Claro', 'Madeira Escuro'
  ]
  
  const colorPattern = new RegExp(`\\b(${commonColors.join('|')})\\b`, 'i')
  
  let color: string | undefined
  let size: string | undefined
  let rest = normalized
  
  const fullColorMatch = normalized.match(colorPattern)
  if (fullColorMatch) {
    color = normalizeColorName(fullColorMatch[0])
  }
  
  const fullSizeMatch = normalized.match(numericSizePattern) || normalized.match(textSizePattern)
  if (fullSizeMatch) {
    if (numericSizePattern.test(normalized)) {
      const match = normalized.match(numericSizePattern)
      if (match) {
        size = match[1] + ' cm'
      }
    } else if (textSizePattern.test(normalized)) {
      const match = normalized.match(textSizePattern)
      if (match) {
        size = match[1] || match[0]
      }
    }
  }
  
  if (color && size) {
    return { color, size, rest }
  }
  
  const parts = normalized.split(/[-–—,\/\s]+/).map(p => p.trim()).filter(Boolean)
  
  for (const part of parts) {
    const numericSizeMatch = part.match(numericSizePattern)
    const textSizeMatch = part.match(textSizePattern)
    const colorMatch = part.match(colorPattern)
    
    if (numericSizeMatch && !size) {
      size = numericSizeMatch[1] + ' cm'
    } else if (textSizeMatch && !size) {
      size = textSizeMatch[1] || textSizeMatch[0]
    } else if (colorMatch && !color) {
      color = normalizeColorName(colorMatch[0])
    }
  }
  
  if (!color && !size && parts.length > 0) {
    if (parts.length >= 2) {
      const firstPart = parts[0]
      const secondPart = parts[1]
      
      const firstNumericSize = firstPart.match(numericSizePattern)
      const secondNumericSize = secondPart.match(numericSizePattern)
      const firstTextSize = firstPart.match(textSizePattern)
      const secondTextSize = secondPart.match(textSizePattern)
      const firstColor = firstPart.match(colorPattern)
      const secondColor = secondPart.match(colorPattern)
      
      if (firstNumericSize || firstTextSize) {
        size = firstNumericSize ? (firstNumericSize[1] + ' cm') : (firstTextSize ? firstTextSize[1] || firstTextSize[0] : firstPart)
        color = secondColor ? normalizeColorName(secondColor[0]) : (secondPart && (/\bbranca\b/i.test(secondPart) || /\bbranco\b/i.test(secondPart)) ? 'Branca' : (/\bpreta\b/i.test(secondPart) || /\bpreto\b/i.test(secondPart)) ? 'Preta' : (/\btijolo\b/i.test(secondPart) && !/\btijolinho\b/i.test(secondPart)) ? 'Tijolo' : secondPart)
      } else if (secondNumericSize || secondTextSize) {
        color = firstColor ? normalizeColorName(firstColor[0]) : (firstPart && (/\bbranca\b/i.test(firstPart) || /\bbranco\b/i.test(firstPart)) ? 'Branca' : (/\bpreta\b/i.test(firstPart) || /\bpreto\b/i.test(firstPart)) ? 'Preta' : (/\btijolo\b/i.test(firstPart) && !/\btijolinho\b/i.test(firstPart)) ? 'Tijolo' : firstPart)
        size = secondNumericSize ? (secondNumericSize[1] + ' cm') : (secondTextSize ? secondTextSize[1] || secondTextSize[0] : secondPart)
      } else if (firstColor) {
        color = normalizeColorName(firstColor[0])
        size = secondPart
      } else {
        const firstPartColor = firstPart && (/\bbranca\b/i.test(firstPart) || /\bbranco\b/i.test(firstPart)) ? 'Branca' : (/\bpreta\b/i.test(firstPart) || /\bpreto\b/i.test(firstPart)) ? 'Preta' : (/\btijolo\b/i.test(firstPart) && !/\btijolinho\b/i.test(firstPart)) ? 'Tijolo' : firstPart
        color = firstPartColor
        size = secondPart
      }
    } else if (parts.length === 1) {
      const numericSize = parts[0].match(numericSizePattern)
      const textSize = parts[0].match(textSizePattern)
      const colorMatch = parts[0].match(colorPattern)
      
      if (numericSize) {
        size = numericSize[1] + ' cm'
      } else if (textSize) {
        size = textSize[1] || textSize[0]
      } else if (colorMatch) {
        color = normalizeColorName(colorMatch[0])
      } else {
        const partColor = parts[0] && (/\bbranca\b/i.test(parts[0]) || /\bbranco\b/i.test(parts[0])) ? 'Branca' : (/\bpreta\b/i.test(parts[0]) || /\bpreto\b/i.test(parts[0])) ? 'Preta' : (/\btijolo\b/i.test(parts[0]) && !/\btijolinho\b/i.test(parts[0])) ? 'Tijolo' : undefined
        if (partColor) {
          color = partColor
        }
      }
    }
  }
  
  return { color, size, rest }
}

function extractColorFromVariantName(name: string, parsed: { color?: string; size?: string }): string | null {
  if (parsed.color) {
    return normalizeColorName(parsed.color)
  }
  
  const normalized = name.trim()
  const lowerNormalized = normalized.toLowerCase()
  
  if (/\bbranca\b/i.test(normalized) || /\bbranco\b/i.test(normalized)) {
    return 'Branca'
  }
  
  if (/\bpreta\b/i.test(normalized) || /\bpreto\b/i.test(normalized)) {
    return 'Preta'
  }
  
  if (/\btijolo\b/i.test(normalized) && !/\btijolinho\b/i.test(normalized)) {
    return 'Tijolo'
  }
  
  const priorityColors = ['Branca', 'Preta', 'Tijolo']
  const commonColors = [
    'Tijolo', 'Tijolo Queimado', 'Tijolo Claro', 'Tijolo Escuro',
    'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Preto', 'Preta', 'Branco', 'Branca', 'Rosa', 'Roxo', 'Laranja', 
    'Marrom', 'Cinza', 'Bege', 'Dourado', 'Prateado', 'Marfim', 'Caramelo', 'Nude', 'Coral',
    'Turquesa', 'Lilás', 'Bordô', 'Grafite', 'Chumbo', 'Off-white', 'Ivory', 'Cream', 'Navy',
    'Royal', 'Sky', 'Forest', 'Lime', 'Olive', 'Khaki', 'Tan', 'Camel', 'Taupe', 'Mocha',
    'Espresso', 'Charcoal', 'Slate', 'Silver', 'Gold', 'Bronze', 'Copper', 'Rose', 'Blush',
    'Peach', 'Salmon', 'Terracotta', 'Burgundy', 'Wine', 'Plum', 'Lavender', 'Mint', 'Teal',
    'Aqua', 'Cyan', 'Indigo', 'Violet', 'Magenta', 'Fuchsia', 'Crimson', 'Scarlet', 'Ruby',
    'Emerald', 'Jade', 'Sage', 'Mustard', 'Amber', 'Honey', 'Butter', 'Lemon', 'Sunshine',
    'Sunset', 'Rust', 'Cinnamon', 'Nutmeg', 'Cocoa', 'Ebony', 'Jet', 'Onyx', 'Pearl', 'Gray',
    'Grey', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Brown',
    'Black', 'Noce', 'Nogueira', 'Mogno', 'Cerejeira', 'Carvalho', 'Pinus', 'Eucalipto',
    'Natural', 'Natural Claro', 'Natural Escuro', 'Madeira', 'Madeira Claro', 'Madeira Escuro'
  ]
  
  for (const priorityColor of priorityColors) {
    const priorityPattern = new RegExp(`\\b${priorityColor}\\b`, 'i')
    if (priorityPattern.test(normalized)) {
      return normalizeColorName(priorityColor)
    }
  }
  
  const colorPattern = new RegExp(`\\b(${commonColors.join('|')})\\b`, 'i')
  const colorMatch = normalized.match(colorPattern)
  if (colorMatch) {
    return normalizeColorName(colorMatch[0])
  }
  
  const parts = normalized.split(/[-–—,\/\s]+/).map(p => p.trim()).filter(Boolean)
  
  const numericSizePattern = /\b(\d+)\s*(cm|CM|centímetros?|centimetros?)?\b/i
  const textSizePattern = /\b(PP|P|M|G|GG|XG|XXG|XXXG|UN|ÚNICO|ÚNICA|ÚN|XS|S|L|XL|XXL|XXXL)\b/i
  
  const stopWords = ['cm', 'centimetros', 'centímetros', 'de', 'da', 'do', 'em', 'para', 'com', 'sem', 'pré', 'moldada', 'churrasqueira', 'churrasqueiras', 'tijolinho']
  
  for (const part of parts) {
    const isNumericSize = numericSizePattern.test(part)
    const isTextSize = textSizePattern.test(part)
    const lowerPart = part.toLowerCase()
    
    if (!isNumericSize && !isTextSize && part.length > 2 && !stopWords.includes(lowerPart)) {
      const partColorMatch = part.match(colorPattern)
      if (partColorMatch) {
        return normalizeColorName(partColorMatch[0])
      }
      const partPriorityMatch = priorityColors.find(pc => {
        const pattern = new RegExp(`\\b${pc}\\b`, 'i')
        return pattern.test(part)
      })
      if (partPriorityMatch) {
        return normalizeColorName(partPriorityMatch)
      }
      if (lowerPart === 'branca' || lowerPart === 'branco') {
        return 'Branca'
      }
      if (lowerPart === 'preta' || lowerPart === 'preto') {
        return 'Preta'
      }
      if (lowerPart === 'tijolo') {
        return 'Tijolo'
      }
      return part
    }
  }
  
  if (parts.length >= 2) {
    const firstPart = parts[0]
    const secondPart = parts[1]
    
    const firstIsSize = numericSizePattern.test(firstPart) || textSizePattern.test(firstPart)
    const secondIsSize = numericSizePattern.test(secondPart) || textSizePattern.test(secondPart)
    
    if (firstIsSize && !secondIsSize) {
      const secondColorMatch = secondPart.match(colorPattern)
      if (secondColorMatch) {
        return secondColorMatch[0]
      }
      return secondPart
    } else if (!firstIsSize && secondIsSize) {
      const firstColorMatch = firstPart.match(colorPattern)
      if (firstColorMatch) {
        return firstColorMatch[0]
      }
      return firstPart
    } else if (!firstIsSize && !secondIsSize) {
      const firstColorMatch = firstPart.match(colorPattern)
      if (firstColorMatch) {
        return firstColorMatch[0]
      }
      return firstPart
    }
  } else if (parts.length === 1) {
    const part = parts[0]
    const isSize = numericSizePattern.test(part) || textSizePattern.test(part)
    if (!isSize) {
      const partColorMatch = part.match(colorPattern)
      if (partColorMatch) {
        return partColorMatch[0]
      }
      return part
    }
  }
  
  return null
}

function normalizeColorName(color: string): string {
  if (!color) return color
  
  const normalized = color.toLowerCase().trim()
  
  if (normalized === 'tijolo') {
    return 'Tijolo'
  }
  
  if (normalized === 'preta' || normalized === 'preto') {
    return 'Preta'
  }
  
  if (normalized === 'branca' || normalized === 'branco') {
    return 'Branca'
  }
  
  return color
}

function groupVariants(variants: Product['variants']): GroupedVariants {
  if (!variants || variants.length === 0) {
    return { colors: [], sizes: [], other: [] }
  }
  
  const colorsMap = new Map<string, VariantAttribute>()
  const sizesMap = new Map<string, VariantAttribute>()
  const other: ProductVariant[] = []
  let hasDetectedAttributes = false
  
  for (const variant of variants) {
    const parsed = parseVariantName(variant.name)
    
    let detectedColor = parsed.color || extractColorFromVariantName(variant.name, parsed)
    
    if (detectedColor) {
      detectedColor = normalizeColorName(detectedColor)
      hasDetectedAttributes = true
      const colorKey = detectedColor.toLowerCase()
      if (!colorsMap.has(colorKey)) {
        colorsMap.set(colorKey, { value: detectedColor, variantId: variant.id })
      }
    }
    
    if (parsed.size) {
      hasDetectedAttributes = true
      const normalizedSize = parsed.size.replace(/\s*cm\s*/i, '').trim()
      const sizeKey = normalizedSize.toUpperCase()
      const displaySize = parsed.size.includes('cm') ? parsed.size : parsed.size + ' cm'
      if (!sizesMap.has(sizeKey)) {
        sizesMap.set(sizeKey, { value: displaySize, variantId: variant.id })
      }
    }
    
    if (!detectedColor && !parsed.size) {
      other.push(variant)
    }
  }
  
  const sortedSizes = Array.from(sizesMap.values()).sort((a, b) => {
    const numA = parseInt(a.value.replace(/\D/g, '')) || 0
    const numB = parseInt(b.value.replace(/\D/g, '')) || 0
    return numA - numB
  })
  
  return {
    colors: Array.from(colorsMap.values()),
    sizes: sortedSizes,
    other: hasDetectedAttributes ? other : (variants || [])
  }
}

function findVariantByAttributes(
  variants: Product['variants'],
  selectedColor: string | null,
  selectedSize: string | null
): ProductVariant | null {
  if (!variants || variants.length === 0) return null
  
  if (!selectedColor && !selectedSize) {
    return variants[0]
  }
  
  const normalizeSize = (size: string): string => {
    return size.replace(/\s*cm\s*/i, '').trim().toLowerCase()
  }
  
  const normalizeColor = (color: string): string => {
    const normalized = normalizeColorName(color).toLowerCase().trim()
    return normalized
  }
  
  for (const variant of variants) {
    const parsed = parseVariantName(variant.name)
    let detectedColor = parsed.color || extractColorFromVariantName(variant.name, parsed)
    if (detectedColor) {
      detectedColor = normalizeColorName(detectedColor)
    }
    
    const colorMatch = !selectedColor || (detectedColor && normalizeColor(detectedColor) === normalizeColor(selectedColor))
    
    let sizeMatch = false
    if (!selectedSize) {
      sizeMatch = true
    } else if (parsed.size) {
      const normalizedSelectedSize = normalizeSize(selectedSize)
      const normalizedParsedSize = normalizeSize(parsed.size)
      sizeMatch = normalizedParsedSize === normalizedSelectedSize
    }
    
    if (colorMatch && sizeMatch) {
      return variant
    }
  }
  
  if (selectedColor && !selectedSize) {
    for (const variant of variants) {
      const parsed = parseVariantName(variant.name)
      let detectedColor = parsed.color || extractColorFromVariantName(variant.name, parsed)
      if (detectedColor) {
        detectedColor = normalizeColorName(detectedColor)
      }
      if (detectedColor && normalizeColor(detectedColor) === normalizeColor(selectedColor)) {
        return variant
      }
    }
  }
  
  if (selectedSize && !selectedColor) {
    for (const variant of variants) {
      const parsed = parseVariantName(variant.name)
      if (parsed.size && normalizeSize(parsed.size) === normalizeSize(selectedSize)) {
        return variant
      }
    }
  }
  
  return variants[0]
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHoveringImage, setIsHoveringImage] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  
  const groupedVariants = useMemo(() => {
    return product?.variants ? groupVariants(product.variants) : { colors: [], sizes: [], other: [] }
  }, [product?.variants])

  useEffect(() => {
    if (params.slug) {
      const slugParam = params.slug as string

      // Lista de rotas existentes que não são produtos
      const existingRoutes = [
        'products', 'checkout', 'admin', 'api', 'lpwpc', 'politicas',
        'order-success', 'test-yampi', 'debug-products', 'not-found'
      ]

      // Se for uma rota existente, não tentar buscar como produto
      if (existingRoutes.includes(slugParam)) {
        setIsLoading(false)
        return
      }

      // Verificar se o parâmetro é um ID numérico (compatibilidade com links antigos)
      const isNumericId = /^\d+$/.test(slugParam)

      if (isNumericId) {
        // Se é um ID numérico, buscar o produto por ID e redirecionar para o slug
        getProduct(slugParam).then((product) => {
          if (product && product.slug) {
            router.replace(`/${product.slug}`)
          } else {
            setIsLoading(false)
          }
        }).catch(() => {
          setIsLoading(false)
        })
        return
      }

      // Se não é ID numérico, buscar normalmente por slug
      getProductBySlug(slugParam).then((p) => {
        if (!p) {
          setIsLoading(false)
          return
        }
        setProduct(p)
        setSelectedColor(null)
        setSelectedSize(null)
        if (p.variants && p.variants.length > 0) {
          const grouped = groupVariants(p.variants)
          if (grouped.colors.length > 0) {
            setSelectedColor(grouped.colors[0].value)
          }
          if (grouped.sizes.length > 0) {
            setSelectedSize(grouped.sizes[0].value)
          }
          if (grouped.colors.length > 0 || grouped.sizes.length > 0) {
            const initialVariant = findVariantByAttributes(p.variants, grouped.colors[0]?.value || null, grouped.sizes[0]?.value || null)
            if (initialVariant) {
              setSelectedVariant(initialVariant.id)
            } else {
              setSelectedVariant(p.variants[0].id)
            }
          } else {
            setSelectedVariant(p.variants[0].id)
          }
        }
        setIsLoading(false)

        setIsLoadingRelated(true)
        if (p.categoryId) {
          getProducts({ categoryId: p.categoryId, limit: 12 }).then((result) => {
            const filtered = result.products.filter(prod => prod.id !== p.id)
            if (filtered.length > 0) {
              setRelatedProducts(filtered.slice(0, 6))
            } else {
              getProducts({ limit: 12 }).then((allResult) => {
                const allFiltered = allResult.products.filter(prod => prod.id !== p.id)
                setRelatedProducts(allFiltered.slice(0, 6))
              })
            }
            setIsLoadingRelated(false)
          }).catch(() => {
            getProducts({ limit: 12 }).then((allResult) => {
              const allFiltered = allResult.products.filter(prod => prod.id !== p.id)
              setRelatedProducts(allFiltered.slice(0, 6))
              setIsLoadingRelated(false)
            }).catch(() => {
              setIsLoadingRelated(false)
            })
          })
        } else {
          getProducts({ limit: 12 }).then((result) => {
            const filtered = result.products.filter(prod => prod.id !== p.id)
            setRelatedProducts(filtered.slice(0, 6))
            setIsLoadingRelated(false)
          }).catch(() => {
            setIsLoadingRelated(false)
          })
        }
      })
    }
  }, [params.slug, router])

  const handleAddToCart = () => {
    if (!product) return

    const variant = product.variants?.find((v) => v.id === selectedVariant)
    const price = variant?.price || product.price
    const image = product.images[0] || '/placeholder-product.jpg'
    
    const parsed = variant ? parseVariantName(variant.name) : null
    let variantDisplayName = ''
    if (parsed && variant) {
      const parts: string[] = []
      const detectedColor = parsed.color || extractColorFromVariantName(variant.name, parsed)
      if (detectedColor) parts.push(detectedColor)
      if (parsed.size) parts.push(parsed.size)
      variantDisplayName = parts.join(' - ')
    } else if (variant?.name) {
      variantDisplayName = variant.name
    }

    addItem({
      id: `${product.id}-${selectedVariant || 'default'}`,
      productId: product.id,
      name: product.name,
      price,
      quantity,
      image,
      variantId: selectedVariant || undefined,
      variantName: variantDisplayName || variant?.name,
      skuId: selectedVariant || undefined,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
    })

    openCart()
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => Math.max(1, q + delta))
  }
  
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && (selectedColor !== null || selectedSize !== null)) {
      const variant = findVariantByAttributes(product.variants, selectedColor, selectedSize)
      if (variant) {
        setSelectedVariant(variant.id)
      }
    }
  }, [selectedColor, selectedSize, product])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">Produto não encontrado</p>
            <Button onClick={() => router.push('/products')}>
              Voltar para produtos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const selectedVariantData = product.variants?.find(
    (v) => v.id === selectedVariant
  )
  const displayPrice = selectedVariantData?.price || product.price

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-brand-white/80">
          <Link href="/" className="hover:text-brand-yellow transition-colors">
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          {product.category ? (
            <>
              <Link 
                href={`/products?category=${product.category.id}`} 
                className="hover:text-brand-yellow transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-brand-white">{product.name}</span>
            </>
          ) : (
            <>
              <Link href="/products" className="hover:text-brand-yellow transition-colors">
                Produtos
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-brand-white">{product.name}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex gap-4">
              {product.images && product.images.length > 1 && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-blue-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={`${product.name} - Imagem ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <div 
                className="relative aspect-square flex-1 bg-gray-100 rounded-lg overflow-hidden group cursor-zoom-in"
                onMouseMove={(e) => {
                  if (!isHoveringImage) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  setMousePosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
                }}
                onMouseEnter={() => setIsHoveringImage(true)}
                onMouseLeave={() => setIsHoveringImage(false)}
              >
                {product.images && product.images.length > 0 && product.images[selectedImageIndex] ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-0"
                    style={{
                      transform: isHoveringImage 
                        ? (() => {
                            const scale = 2
                            const maxTranslate = 50
                            const translateX = Math.max(-maxTranslate, Math.min(maxTranslate, (50 - mousePosition.x) * (scale - 1) / scale))
                            const translateY = Math.max(-maxTranslate, Math.min(maxTranslate, (50 - mousePosition.y) * (scale - 1) / scale))
                            return `scale(${scale}) translate(${translateX}%, ${translateY}%)`
                          })()
                        : 'scale(1)',
                      transformOrigin: 'center center',
                    }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><span class="text-sm">Sem imagem</span></div>'
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <span className="text-sm">Sem imagem</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-md border border-white/20">
            <h1 className="text-3xl font-bold text-brand-blue mb-4">
              {product.name}
            </h1>

            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating.toFixed(1)}
                </span>
                {product.reviewCount && (
                  <span className="text-gray-500">
                    ({product.reviewCount} avaliações)
                  </span>
                )}
              </div>
            )}

            <div className="mb-6">
              {displayPrice > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl font-bold text-brand-blue">
                      R$ {displayPrice.toFixed(2).replace('.', ',')}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        R$ {product.compareAtPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                  {product.sku && (
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  )}
                </>
              ) : (
                <p className="text-lg text-gray-500">Preço não disponível</p>
              )}
            </div>

            {product.variants && product.variants.length > 1 ? (
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {groupedVariants.colors.length > 0 && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor
                      </label>
                      <select
                        value={selectedColor || ''}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors h-[42px]"
                      >
                        <option value="">Selecione uma cor</option>
                        {groupedVariants.colors.map((color) => (
                          <option key={color.variantId} value={color.value}>
                            {color.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {groupedVariants.sizes.length > 0 && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tamanho
                      </label>
                      <select
                        value={selectedSize || ''}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors h-[42px]"
                      >
                        <option value="">Selecione um tamanho</option>
                        {groupedVariants.sizes.map((size) => (
                          <option key={size.variantId} value={size.value}>
                            {size.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {groupedVariants.colors.length === 0 && groupedVariants.sizes.length === 0 && groupedVariants.other.length > 0 && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variante
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {groupedVariants.other.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant.id)}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              selectedVariant === variant.id
                                ? 'border-brand-blue bg-brand-yellow/20 text-brand-blue font-medium'
                                : 'border-gray-300 hover:border-brand-blue'
                            }`}
                          >
                            {variant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <div className="inline-flex items-center border border-gray-300 rounded-md h-[42px]">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 hover:bg-gray-100 h-full flex items-center"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[60px] text-center font-medium h-full flex items-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 hover:bg-gray-100 h-full flex items-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <div className="inline-flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={product.active === false}
                size="lg"
                className="flex-1 leading-tight sm:leading-normal"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.active === false ? 'Indisponível' : 'Adicionar ao Carrinho'}
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-brand-blue mb-4">
                Descrição
              </h2>
              {product.description && product.description.trim() ? (
                <div 
                  className="text-gray-700 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-gray-500 italic">Nenhuma descrição disponível para este produto.</p>
              )}
            </div>

            {product.category && (
              <div className="mt-6">
                <span className="text-sm text-gray-500">Categoria: </span>
                <span className="text-sm text-brand-blue font-medium">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="bg-brand-yellow rounded-lg p-4 shadow-md border border-yellow-300">
              <h2 className="text-lg font-bold text-brand-blue mb-3">
                Você também pode gostar
              </h2>
              {isLoadingRelated ? (
                <div className="flex items-center justify-center py-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedProducts.slice(0, 3).map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/${product.slug}`}
                      className="block"
                    >
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                        {product.images && product.images.length > 0 && (
                          <div className="relative aspect-square w-full">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="p-3 flex flex-col flex-grow">
                          <h3 className="font-semibold text-brand-blue text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>
                          <div className="mt-auto">
                            <p className="text-brand-blue font-bold text-base">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CartSidebar />
      <WhatsAppButton />
    </div>
  )
    }

