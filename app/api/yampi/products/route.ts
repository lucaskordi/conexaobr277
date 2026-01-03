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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    const queryParams = new URLSearchParams()
    if (categoryId) queryParams.append('category_id[]', categoryId)
    if (search) queryParams.append('q', search)
    if (page) queryParams.append('page', page)
    if (limit) queryParams.append('per_page', limit)
    queryParams.append('active', '1')
    queryParams.append('include', 'images,skus,prices,brand,categories,firstImage,texts')

    const endpoint = queryParams.toString() 
      ? `/catalog/products?${queryParams.toString()}`
      : '/catalog/products'

    const response = await fetchYampi(endpoint)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

