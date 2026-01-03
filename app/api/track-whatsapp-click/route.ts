import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, timestamp } = body

    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source is required' },
        { status: 400 }
      )
    }

    const filePath = join(process.cwd(), 'data', 'whatsapp-clicks.json')
    
    let clicks: Array<{ source: string; timestamp: string }> = []
    
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      const parsed = JSON.parse(fileContent)
      if (Array.isArray(parsed)) {
        clicks = parsed
      }
    } catch (error) {
      console.log('Creating new clicks file')
      clicks = []
    }

    clicks.push({
      source: source,
      timestamp: timestamp || new Date().toISOString(),
    })

    await writeFile(filePath, JSON.stringify(clicks, null, 2), 'utf-8')

    console.log(`✅ Tracked WhatsApp click: ${source} (Total: ${clicks.length})`)

    return NextResponse.json({ success: true, count: clicks.length })
  } catch (error) {
    console.error('❌ Error tracking WhatsApp click:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to track click' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'whatsapp-clicks.json')
    
    let clicks: Array<{ source: string; timestamp: string }> = []
    
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      clicks = JSON.parse(fileContent)
    } catch (error) {
      clicks = []
    }

    const stats = {
      total: clicks.length,
      bySource: clicks.reduce((acc, click) => {
        acc[click.source] = (acc[click.source] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      clicks,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting WhatsApp clicks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get clicks' },
      { status: 500 }
    )
  }
}

