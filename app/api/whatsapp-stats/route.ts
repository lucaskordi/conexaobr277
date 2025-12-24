import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

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
    console.error('Error getting WhatsApp stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
