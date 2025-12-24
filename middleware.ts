import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RATE_LIMIT = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS = 100

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return ip
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = RATE_LIMIT.get(key)

  if (!record || now > record.resetTime) {
    RATE_LIMIT.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (record.count >= MAX_REQUESTS) {
    return true
  }

  record.count++
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/track-whatsapp-click')) {
    const key = getRateLimitKey(request)
    
    if (isRateLimited(key)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/track-whatsapp-click/:path*',
}
