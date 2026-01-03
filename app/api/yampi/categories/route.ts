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

export async function GET() {
  try {
    const response = await fetchYampi('/catalog/categories')
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

