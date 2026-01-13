import { NextRequest, NextResponse } from 'next/server'

const YAMPI_API_URL = process.env.YAMPI_API_URL || process.env.NEXT_PUBLIC_YAMPI_API_URL || 'https://api.dooki.com.br'
const YAMPI_API_VERSION = process.env.YAMPI_API_VERSION || process.env.NEXT_PUBLIC_YAMPI_API_VERSION || 'v2'
const YAMPI_STORE_ALIAS = process.env.YAMPI_STORE_ALIAS || process.env.NEXT_PUBLIC_YAMPI_STORE_ALIAS || ''
const YAMPI_USER_TOKEN = process.env.YAMPI_USER_TOKEN || process.env.NEXT_PUBLIC_YAMPI_USER_TOKEN || ''
const YAMPI_USER_SECRET = process.env.YAMPI_USER_SECRET || process.env.NEXT_PUBLIC_YAMPI_USER_SECRET || ''

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const productId = resolvedParams.id

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const endpoints = [
      `/catalog/products/${productId}?include=images,skus,prices,brand,categories,firstImage,texts,seo`,
      `/catalog/products/${productId}`,
    ]

    let productData: any = null
    let lastError: Error | null = null

    for (const endpoint of endpoints) {
      try {
        const response = await fetchYampi(endpoint)
        console.log('📦 Resposta bruta da API Yampi:', {
          endpoint,
          hasData: !!response.data,
          hasProduct: !!response.product,
          responseKeys: Object.keys(response),
        })

        productData = response.data || response.product || response

        if (productData && productData.id) {
          if (productData.data && productData.data.id) {
            productData = productData.data
          }
          console.log('✅ Produto encontrado via endpoint:', endpoint)
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.log(`❌ Endpoint ${endpoint} falhou:`, lastError.message)
        continue
      }
    }

    if (!productData || !productData.id) {
      console.log(`⚠️ Produto não encontrado via endpoint individual, tentando buscar na lista de produtos...`)
      
      try {
        const listResponse = await fetchYampi(`/catalog/products?active=1&include=images,skus,prices,brand,categories,firstImage,texts&per_page=1000`)
        
        let productsList = listResponse.data || listResponse.products || listResponse.items || []
        
        if (!Array.isArray(productsList)) {
          if (productsList.data && Array.isArray(productsList.data)) {
            productsList = productsList.data
          } else if (productsList.products && Array.isArray(productsList.products)) {
            productsList = productsList.products
          } else {
            productsList = []
          }
        }
        
        productData = productsList.find((p: any) => {
          const pId = String(p.id || p.data?.id || '')
          return pId === String(productId)
        })
        
        if (productData) {
          console.log('✅ Produto encontrado na lista de produtos')
          if (productData.data && productData.data.id) {
            productData = productData.data
          }
        }
      } catch (listError) {
        console.warn('Erro ao buscar na lista de produtos:', listError)
      }
    }

    if (!productData || !productData.id) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: productData })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

