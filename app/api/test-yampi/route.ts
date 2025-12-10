import { NextResponse } from 'next/server'
import { testConnection, getProducts, getCategories } from '@/services/yampi'

export async function GET() {
  try {
    const connection = await testConnection()
    
    if (!connection.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: connection.message,
          error: 'Verifique suas credenciais da API Yampi'
        },
        { status: 500 }
      )
    }

    const [productsResult, categories] = await Promise.all([
      getProducts({ limit: 5 }),
      getCategories(),
    ])

    return NextResponse.json({
      success: true,
      message: connection.message,
      data: {
        productsCount: productsResult.totalCount,
        categoriesCount: categories.length,
        sampleProducts: productsResult.products.slice(0, 3),
        categories: categories.slice(0, 5),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao testar integração',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}




