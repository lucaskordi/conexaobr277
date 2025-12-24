import { NextRequest, NextResponse } from 'next/server'

const YAMPI_API_URL = process.env.YAMPI_API_URL || process.env.NEXT_PUBLIC_YAMPI_API_URL || 'https://api.dooki.com.br'
const YAMPI_API_VERSION = process.env.YAMPI_API_VERSION || process.env.NEXT_PUBLIC_YAMPI_API_VERSION || 'v2'
const YAMPI_STORE_ALIAS = process.env.YAMPI_STORE_ALIAS || process.env.NEXT_PUBLIC_YAMPI_STORE_ALIAS || ''
const YAMPI_USER_TOKEN = process.env.YAMPI_USER_TOKEN || process.env.NEXT_PUBLIC_YAMPI_USER_TOKEN || ''
const YAMPI_USER_SECRET = process.env.YAMPI_USER_SECRET || process.env.NEXT_PUBLIC_YAMPI_USER_SECRET || ''
const YAMPI_STORE_URL = process.env.YAMPI_STORE_URL || process.env.NEXT_PUBLIC_YAMPI_STORE_URL || 'https://www.studiomyt.com.br'
const YAMPI_SECURE_DOMAIN = process.env.YAMPI_SECURE_DOMAIN || process.env.NEXT_PUBLIC_YAMPI_SECURE_DOMAIN || ''

async function fetchYampi(endpoint: string, options?: RequestInit) {
  if (!YAMPI_STORE_ALIAS || !YAMPI_USER_TOKEN || !YAMPI_USER_SECRET) {
    throw new Error('Yampi credentials not configured')
  }

  const baseUrl = `${YAMPI_API_URL}/${YAMPI_API_VERSION}/${YAMPI_STORE_ALIAS}`
  const url = `${baseUrl}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Token': YAMPI_USER_TOKEN,
    'User-Secret-Key': YAMPI_USER_SECRET,
    ...options?.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData: any = {}
    
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText || response.statusText }
    }

    throw new Error(`Yampi API error (${response.status}): ${errorData.message || response.statusText}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    let secureDomain = YAMPI_SECURE_DOMAIN

    if (!secureDomain) {
      try {
        const firstItem = items[0]
        const firstProduct = await fetchYampi(`/catalog/products/${firstItem.productId}?include=skus`)
        const firstProductData = firstProduct.data || firstProduct

        if (firstProductData.skus && firstProductData.skus.data && firstProductData.skus.data.length > 0) {
          const firstSku = firstProductData.skus.data[0]
          if (firstSku.purchase_url) {
            const urlMatch = firstSku.purchase_url.match(/https?:\/\/([^\/]+)/)
            if (urlMatch) {
              secureDomain = urlMatch[1]
            }
          }
        }
      } catch (error) {
        console.warn('Error extracting secure domain')
      }
    }

    if (!secureDomain) {
      secureDomain = `seguro.${YAMPI_STORE_ALIAS || 'studiomyt.com.br'}`
    }

    const secureBaseUrl = `https://${secureDomain}`

    try {
      const productInfos = await Promise.all(
        items.map(async (item: any) => {
          try {
            const fullProduct = await fetchYampi(`/catalog/products/${item.productId}?include=skus`)
            const productData = fullProduct.data || fullProduct

            if (productData.skus && productData.skus.data && productData.skus.data.length > 0) {
              const sku = productData.skus.data.find((s: any) => 
                String(s.id) === String(item.skuId) || s.sku === item.skuId
              ) || productData.skus.data[0]

              if (sku && sku.token) {
                return {
                  token: sku.token,
                  skuId: sku.id,
                  quantity: item.quantity,
                  purchaseUrl: sku.purchase_url,
                }
              }
            }

            return null
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error)
            return null
          }
        })
      )

      const validItems = productInfos.filter(Boolean) as Array<{ token: string; skuId: number; quantity: number }>

      if (validItems.length > 0) {
        const tokensWithQuantities = validItems.map(item => `${item.token}:${item.quantity}`).join(',')
        const checkoutUrl = `${secureBaseUrl}/r/${tokensWithQuantities}`

        return NextResponse.json({ url: checkoutUrl })
      }
    } catch (error) {
      console.error('Error building checkout URL:', error)
    }

    return NextResponse.json(
      { error: 'Failed to generate checkout URL' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error generating checkout URL:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate checkout URL' },
      { status: 500 }
    )
  }
}
