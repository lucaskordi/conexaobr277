import { Product, Category, Order } from '@/types'

const YAMPI_API_URL = process.env.NEXT_PUBLIC_YAMPI_API_URL || 'https://api.dooki.com.br'
const YAMPI_API_VERSION = process.env.NEXT_PUBLIC_YAMPI_API_VERSION || 'v2'
const YAMPI_STORE_ALIAS = process.env.NEXT_PUBLIC_YAMPI_STORE_ALIAS || ''
const YAMPI_USER_TOKEN = process.env.NEXT_PUBLIC_YAMPI_USER_TOKEN || ''
const YAMPI_USER_SECRET = process.env.NEXT_PUBLIC_YAMPI_USER_SECRET || ''

interface YampiResponse<T> {
  data: T
  meta?: {
    current_page?: number
    total_pages?: number
    total_count?: number
    per_page?: number
  }
  errors?: Array<{ message: string; field?: string }>
}

interface YampiProduct {
  id: string | number
  name: string
  description?: string
  price: number | string
  compare_at_price?: number | string
  images?: Array<{ url?: string; src?: string } | string>
  category_id?: string | number
  stock?: number | string
  sku?: string
  rating?: number | string
  review_count?: number | string
  variants?: Array<{
    id: string | number
    name: string
    price: number | string
    stock: number | string
    sku?: string
  }>
}

interface YampiCategory {
  id: string | number
  name: string
  slug: string
  parent_id?: string | number
}

export async function fetchYampi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!YAMPI_STORE_ALIAS) {
    console.warn('YAMPI_STORE_ALIAS não configurada. Configure a variável de ambiente NEXT_PUBLIC_YAMPI_STORE_ALIAS')
    throw new Error('Yampi Store Alias não configurada')
  }

  if (!YAMPI_USER_TOKEN || !YAMPI_USER_SECRET) {
    console.warn('YAMPI_USER_TOKEN ou YAMPI_USER_SECRET não configuradas. Configure as variáveis de ambiente')
    throw new Error('Yampi credentials não configuradas')
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

  try {
    console.log('🌐 Fazendo requisição:', {
      url,
      method: options?.method || 'GET',
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log('📥 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      let errorText = ''
      let errorData: any = {}
      
      try {
        errorText = await response.text()
        console.log('📄 Resposta de erro (texto bruto):', errorText)
        
        if (errorText && errorText.trim()) {
          try {
            errorData = JSON.parse(errorText)
            console.log('📄 Resposta de erro (JSON parseado):', errorData)
          } catch (parseError) {
            console.log('⚠️ Não foi possível fazer parse do JSON:', parseError)
            errorData = { 
              raw: errorText,
              parseError: parseError instanceof Error ? parseError.message : String(parseError)
            }
          }
        } else {
          errorData = { message: 'Resposta vazia da API' }
        }
      } catch (textError) {
        console.error('❌ Erro ao ler resposta de erro:', textError)
        errorData = { 
          error: 'Não foi possível ler a resposta',
          textError: textError instanceof Error ? textError.message : String(textError)
        }
      }
      
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        url,
        errorTextLength: errorText?.length || 0,
        errorText: errorText?.substring(0, 500) || 'Vazio',
        errorData,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      }
      
      console.error('❌ Yampi API Error (detalhes completos):', JSON.stringify(errorDetails, null, 2))
      
      let errorMessage = ''
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ')
      } else if (errorData.raw) {
        errorMessage = errorData.raw
      } else if (response.statusText) {
        errorMessage = response.statusText
      } else {
        errorMessage = `Erro HTTP ${response.status}`
      }
      
      throw new Error(`Yampi API error (${response.status}): ${errorMessage}`)
    }

    const data = await response.json()
    
    console.log('✅ Dados recebidos:', {
      hasData: !!data.data,
      dataType: typeof data.data,
      isArray: Array.isArray(data.data),
      keys: Object.keys(data),
    })
    
    if (data.errors && data.errors.length > 0) {
      console.error('❌ Yampi API Validation Errors:', data.errors)
      throw new Error(`Yampi validation errors: ${data.errors.map((e: any) => e.message).join(', ')}`)
    }

    return data
  } catch (error) {
    console.error('❌ Erro na requisição fetchYampi:', {
      error,
      endpoint,
      url,
      errorMessage: error instanceof Error ? error.message : String(error),
    })
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro desconhecido ao comunicar com a API Yampi')
  }
}

function mapYampiProduct(product: any, categories?: Category[]): Product {
  console.log('🔍 Mapeando produto - Dados brutos:', JSON.stringify(product, null, 2))
  
  const productData = product.data || product
  
  let category: Category | undefined = undefined
  
  if (productData.categories && productData.categories.data && Array.isArray(productData.categories.data) && productData.categories.data.length > 0) {
    const firstCategory = productData.categories.data[0]
    category = {
      id: String(firstCategory.id),
      name: firstCategory.name,
      slug: firstCategory.slug || firstCategory.name.toLowerCase().replace(/\s+/g, '-'),
      parentId: firstCategory.parent_id ? String(firstCategory.parent_id) : undefined,
    }
  } else if (productData.category_id || productData.category?.id) {
    category = categories?.find(cat => cat.id === String(productData.category_id || productData.category?.id))
  }
  
  let images: string[] = []
  
  if (productData.images && productData.images.data && Array.isArray(productData.images.data)) {
    images = productData.images.data.map((img: any) => {
      if (img.large && img.large.url) return img.large.url
      if (img.medium && img.medium.url) return img.medium.url
      if (img.thumb && img.thumb.url) return img.thumb.url
      if (img.small && img.small.url) return img.small.url
      if (typeof img === 'string') return img
      if (img.url) return img.url
      if (img.src) return img.src
      if (img.original_url) return img.original_url
      if (img.original) return img.original
      return ''
    }).filter(Boolean)
  } else if (productData.firstImage && productData.firstImage.data) {
    const firstImg = productData.firstImage.data
    if (firstImg.large && firstImg.large.url) {
      images = [firstImg.large.url]
    } else if (firstImg.medium && firstImg.medium.url) {
      images = [firstImg.medium.url]
    } else if (firstImg.thumb && firstImg.thumb.url) {
      images = [firstImg.thumb.url]
    }
  } else if (Array.isArray(productData.images)) {
    images = productData.images.map((img: any) => {
      if (typeof img === 'string') return img
      if (img.large && img.large.url) return img.large.url
      if (img.medium && img.medium.url) return img.medium.url
      if (img.url) return img.url
      if (img.src) return img.src
      return ''
    }).filter(Boolean)
  } else if (productData.media && Array.isArray(productData.media)) {
    images = productData.media.map((media: any) => 
      media.url || media.src || media.original_url || media.original || ''
    ).filter(Boolean)
  }

  let price = 0
  
  if (productData.prices && productData.prices.data) {
    const priceData = productData.prices.data
    if (priceData.price_sale !== undefined && priceData.price_sale !== null) {
      price = Number(priceData.price_sale)
    } else if (priceData.price !== undefined && priceData.price !== null) {
      price = Number(priceData.price)
    }
  } else if (productData.skus && productData.skus.data && Array.isArray(productData.skus.data) && productData.skus.data.length > 0) {
    const firstSku = productData.skus.data[0]
    if (firstSku.price_sale !== undefined && firstSku.price_sale !== null) {
      price = Number(firstSku.price_sale)
    } else if (firstSku.price !== undefined && firstSku.price !== null) {
      price = Number(firstSku.price)
    }
  } else if (productData.price !== undefined && productData.price !== null) {
    price = Number(productData.price)
  } else if (productData.sale_price !== undefined && productData.sale_price !== null) {
    price = Number(productData.sale_price)
  }

  let compareAtPrice: number | undefined = undefined
  
  if (productData.prices && productData.prices.data) {
    const priceData = productData.prices.data
    if (priceData.price_discount && priceData.price_discount > 0 && priceData.price > priceData.price_sale) {
      compareAtPrice = Number(priceData.price)
    }
  }
  
  if (!compareAtPrice && productData.compare_at_price !== undefined && productData.compare_at_price !== null) {
    compareAtPrice = Number(productData.compare_at_price)
  }

  const description = productData.description 
    || (productData.texts && productData.texts.data && productData.texts.data.description ? productData.texts.data.description : '')
    || productData.body_html 
    || productData.body 
    || productData.short_description
    || productData.excerpt
    || productData.content
    || productData.text
    || productData.summary
    || ''

  const isActive = productData.active !== false && productData.active !== 0 && productData.active !== '0'
  
  let stock: number | undefined = undefined
  
  if (productData.skus && productData.skus.data && Array.isArray(productData.skus.data) && productData.skus.data.length > 0) {
    const totalStock = productData.skus.data.reduce((sum: number, sku: any) => {
      const skuStock = sku.total_in_stock !== undefined && sku.total_in_stock !== null 
        ? Number(sku.total_in_stock)
        : sku.stock !== undefined && sku.stock !== null 
          ? Number(sku.stock)
          : sku.quantity !== undefined && sku.quantity !== null
            ? Number(sku.quantity)
            : 0
      return sum + skuStock
    }, 0)
    stock = totalStock >= 0 ? totalStock : undefined
  } else if (productData.stock !== undefined && productData.stock !== null) {
    stock = Number(productData.stock)
  } else if (productData.inventory_quantity !== undefined && productData.inventory_quantity !== null) {
    stock = Number(productData.inventory_quantity)
  } else if (productData.available_quantity !== undefined && productData.available_quantity !== null) {
    stock = Number(productData.available_quantity)
  } else if (productData.quantity !== undefined && productData.quantity !== null) {
    stock = Number(productData.quantity)
  }


  let dimensions: { width?: number; height?: number; length?: number } | undefined = undefined
  
  if (productData.skus && productData.skus.data && Array.isArray(productData.skus.data) && productData.skus.data.length > 0) {
    const firstSku = productData.skus.data[0]
    if (firstSku.width || firstSku.height || firstSku.length || firstSku.dimensions) {
      dimensions = {
        width: firstSku.width ? Number(firstSku.width) : (firstSku.dimensions?.width ? Number(firstSku.dimensions.width) : undefined),
        height: firstSku.height ? Number(firstSku.height) : (firstSku.dimensions?.height ? Number(firstSku.dimensions.height) : undefined),
        length: firstSku.length ? Number(firstSku.length) : (firstSku.dimensions?.length ? Number(firstSku.dimensions.length) : undefined),
      }
    }
  }
  
  if (!dimensions && (productData.width || productData.height || productData.length || productData.dimensions)) {
    dimensions = {
      width: productData.width ? Number(productData.width) : (productData.dimensions?.width ? Number(productData.dimensions.width) : undefined),
      height: productData.height ? Number(productData.height) : (productData.dimensions?.height ? Number(productData.dimensions.height) : undefined),
      length: productData.length ? Number(productData.length) : (productData.dimensions?.length ? Number(productData.dimensions.length) : undefined),
    }
  }
  
  if (!dimensions && productData.description) {
    const dimensionMatch = productData.description.match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[x×]\s*(\d+))?\s*cm/i)
    if (dimensionMatch) {
      dimensions = {
        width: Number(dimensionMatch[1]),
        height: Number(dimensionMatch[2]),
        length: dimensionMatch[3] ? Number(dimensionMatch[3]) : undefined,
      }
    }
  }

  const mappedProduct = {
    id: String(productData.id || product.id),
    name: productData.name || productData.title || product.name || product.title || 'Produto sem nome',
    description: description,
    price: price,
    compareAtPrice: compareAtPrice,
    images: images.filter(Boolean),
    categoryId: productData.category_id 
      || (productData.categories && productData.categories.data && productData.categories.data.length > 0 ? String(productData.categories.data[0].id) : undefined)
      || productData.category?.id ? String(productData.category?.id) : undefined,
    category,
    stock: stock,
    sku: productData.sku || productData.variant_sku || product.sku || undefined,
    rating: productData.rating ? Number(productData.rating) : undefined,
    reviewCount: productData.review_count || productData.reviews_count ? Number(productData.review_count || productData.reviews_count) : undefined,
    dimensions,
    active: productData.active === true || productData.active === 1 || productData.active === '1' || productData.active === undefined,
    variants: (productData.skus && productData.skus.data && Array.isArray(productData.skus.data) 
      ? productData.skus.data.map((sku: any) => {
          let variantPrice = price
          if (sku.price_sale !== undefined && sku.price_sale !== null) {
            variantPrice = Number(sku.price_sale)
          } else if (sku.price !== undefined && sku.price !== null) {
            variantPrice = Number(sku.price)
          }
          
          return {
            id: String(sku.id),
            name: sku.title || sku.name || sku.sku || '',
            price: variantPrice,
            stock: sku.total_in_stock !== undefined ? Number(sku.total_in_stock) : sku.stock !== undefined ? Number(sku.stock) : sku.quantity !== undefined ? Number(sku.quantity) : stock || 0,
            sku: sku.sku || sku.code || '',
          }
        })
      : (productData.variations || productData.variants)?.map((v: any) => ({
          id: String(v.id),
          name: v.name || v.title || '',
          price: v.price ? Number(v.price) : price,
          stock: v.stock !== undefined ? Number(v.stock) : stock || 0,
          sku: v.sku || '',
        }))),
  }

  console.log('✅ Produto mapeado:', {
    id: mappedProduct.id,
    name: mappedProduct.name,
    price: mappedProduct.price,
    compareAtPrice: mappedProduct.compareAtPrice,
    description: mappedProduct.description.substring(0, 50) + (mappedProduct.description.length > 50 ? '...' : ''),
    imagesCount: mappedProduct.images.length,
    images: mappedProduct.images.slice(0, 2),
    stock: mappedProduct.stock,
  })

  return mappedProduct
}

export async function getProducts(params?: {
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{ products: Product[]; totalPages: number; totalCount: number }> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.categoryId) queryParams.append('category_id[]', String(params.categoryId))
    if (params?.search) queryParams.append('q', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('per_page', params.limit.toString())
    queryParams.append('active', '1')
    queryParams.append('include', 'images,skus,prices,brand,categories,firstImage,texts')

    let categories: Category[] = []
    try {
      categories = await getCategories()
    } catch (error) {
      console.warn('Erro ao buscar categorias, continuando sem elas:', error)
    }

    const endpoint = queryParams.toString() 
      ? `/catalog/products?${queryParams.toString()}`
      : '/catalog/products'
    
    console.log('🌐 Fazendo requisição para:', endpoint)
    
    let response: any
    try {
      response = await fetchYampi<any>(endpoint)
    } catch (error) {
      console.error('❌ Erro na requisição getProducts:', error)
      throw error
    }

    console.log('📦 Resposta completa da API Yampi (getProducts):', {
      endpoint,
      responseKeys: Object.keys(response),
      hasData: !!response.data,
      dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      firstProduct: Array.isArray(response.data) && response.data[0] ? {
        keys: Object.keys(response.data[0]),
        sample: response.data[0]
      } : null,
      fullResponse: JSON.stringify(response, null, 2),
    })

    let productsData = response.data || response.products || response.items || response

    console.log('🔍 Analisando estrutura de dados:', {
      hasResponseData: !!response.data,
      hasResponseProducts: !!response.products,
      hasResponseItems: !!response.items,
      responseDataType: typeof response.data,
      responseDataIsArray: Array.isArray(response.data),
      responseKeys: Object.keys(response),
    })

    if (!productsData) {
      console.error('❌ Resposta da API Yampi não contém dados:', {
        response,
        responseKeys: Object.keys(response),
        responseString: JSON.stringify(response, null, 2),
      })
      return { products: [], totalPages: 1, totalCount: 0 }
    }

    if (!Array.isArray(productsData)) {
      console.log('⚠️ productsData não é array, tentando extrair...', {
        productsDataType: typeof productsData,
        productsDataKeys: Object.keys(productsData),
      })
      
      if (productsData.products && Array.isArray(productsData.products)) {
        productsData = productsData.products
        console.log('✅ Produtos encontrados em products:', productsData.length)
      } else if (productsData.items && Array.isArray(productsData.items)) {
        productsData = productsData.items
        console.log('✅ Produtos encontrados em items:', productsData.length)
      } else if (productsData.data && Array.isArray(productsData.data)) {
        productsData = productsData.data
        console.log('✅ Produtos encontrados em data:', productsData.length)
      } else if (typeof productsData === 'object' && productsData.id) {
        productsData = [productsData]
        console.log('✅ Produto único encontrado')
      } else {
        console.error('❌ Resposta da API Yampi não contém array de produtos:', {
          productsData,
          productsDataKeys: Object.keys(productsData),
          fullResponse: JSON.stringify(response, null, 2),
        })
        return { products: [], totalPages: 1, totalCount: 0 }
      }
    } else {
      console.log('✅ Array de produtos encontrado diretamente:', productsData.length)
    }

    const products = await Promise.all(
      productsData.map(async (product: any) => {
        const mapped = mapYampiProduct(product, categories)
        
        if (mapped.price === 0 || mapped.images.length === 0 || !mapped.description) {
          console.log(`⚠️ Produto ${mapped.id} sem informações completas. Buscando detalhes...`)
          try {
            const fullProduct = await getProduct(String(mapped.id))
            if (fullProduct && (fullProduct.price > 0 || fullProduct.images.length > 0 || fullProduct.description)) {
              console.log(`✅ Detalhes encontrados para produto ${mapped.id}`)
              return fullProduct
            }
          } catch (error) {
            console.warn(`Erro ao buscar detalhes do produto ${mapped.id}:`, error)
          }
        }
        
        return mapped
      })
    )

    const pagination = response.meta?.pagination || response.meta
    
    return {
      products,
      totalPages: pagination?.total_pages || pagination?.total ? Math.ceil((pagination.total || products.length) / (pagination.per_page || products.length)) : 1,
      totalCount: pagination?.total || pagination?.total_count || products.length,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], totalPages: 1, totalCount: 0 }
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    let categories: Category[] = []
    try {
      categories = await getCategories()
    } catch (error) {
      console.warn('Erro ao buscar categorias:', error)
    }

    const endpoints = [
      `/catalog/products/${id}?include=images,skus,prices,brand,categories,firstImage,texts,seo`,
      `/catalog/products/${id}`,
      `/catalog/products/${id}/details`,
      `/products/${id}?include=images,skus,prices,brand,categories,firstImage,texts,seo`,
      `/products/${id}`,
      `/products/${id}/details`,
    ]

    let productData: any = null
    let lastError: Error | null = null

    for (const endpoint of endpoints) {
      try {
        const response = await fetchYampi<any>(endpoint)
        console.log(`✅ Endpoint ${endpoint} retornou dados:`, {
          hasData: !!response.data,
          keys: response.data ? Object.keys(response.data) : Object.keys(response),
        })

        productData = response.data || response.product || response

        if (productData && productData.id) {
          if (productData.data && productData.data.id) {
            productData = productData.data
          }
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.log(`❌ Endpoint ${endpoint} falhou:`, lastError.message)
        continue
      }
    }

    if (!productData || !productData.id) {
      console.warn('Produto não encontrado em nenhum endpoint:', id, lastError)
      return null
    }

    console.log('📦 Dados completos do produto:', JSON.stringify(productData, null, 2))

    const mapped = mapYampiProduct(productData, categories)
    
    if (mapped.price === 0 || mapped.images.length === 0) {
      console.log('🔍 Buscando informações adicionais...')
      
      if (productData.variations && Array.isArray(productData.variations) && productData.variations.length > 0) {
        console.log('📋 Encontradas variações:', productData.variations.length)
        const firstVariation = productData.variations[0]
        if (firstVariation.price) {
          mapped.price = Number(firstVariation.price)
          console.log('💰 Preço encontrado em variação:', mapped.price)
        }
        if (firstVariation.images && Array.isArray(firstVariation.images)) {
          mapped.images = firstVariation.images.map((img: any) => 
            typeof img === 'string' ? img : img.url || img.src || img.original_url || ''
          ).filter(Boolean)
          console.log('🖼️ Imagens encontradas em variação:', mapped.images.length)
        }
      }
      
      if (productData.prices && Array.isArray(productData.prices) && productData.prices.length > 0) {
        console.log('💰 Encontrados preços:', productData.prices.length)
        const firstPrice = productData.prices[0]
        if (firstPrice.value) {
          mapped.price = Number(firstPrice.value)
        } else if (firstPrice.price) {
          mapped.price = Number(firstPrice.price)
        }
      }
      
      if (productData.media && Array.isArray(productData.media)) {
        console.log('🖼️ Encontrada media:', productData.media.length)
        mapped.images = productData.media.map((media: any) => 
          media.url || media.src || media.original_url || media.original || ''
        ).filter(Boolean)
      }

      if (productData.images && Array.isArray(productData.images)) {
        console.log('🖼️ Encontradas imagens diretas:', productData.images.length)
        mapped.images = productData.images.map((img: any) => 
          typeof img === 'string' ? img : img.url || img.src || img.original_url || img.original || ''
        ).filter(Boolean)
      }
    }

    console.log('✅ Produto final mapeado:', {
      id: mapped.id,
      name: mapped.name,
      price: mapped.price,
      images: mapped.images.length,
      description: mapped.description.length,
    })

    return mapped
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetchYampi<YampiResponse<YampiCategory[]>>(
      '/catalog/categories'
    )

    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Resposta da API Yampi não contém array de categorias:', response)
      return []
    }

    const categories = response.data.map(cat => ({
      id: String(cat.id),
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parent_id ? String(cat.parent_id) : undefined,
    }))

    const categoryMap = new Map<string, Category>()
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    const rootCategories: Category[] = []
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(category)
        }
      } else {
        rootCategories.push(category)
      }
    })

    return rootCategories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function createProduct(product: Partial<Product>): Promise<Product | null> {
  try {
    const yampiProduct: any = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      status: 'active',
    }

    if (product.compareAtPrice) {
      yampiProduct.compare_at_price = product.compareAtPrice
    }

    if (product.categoryId) {
      yampiProduct.category_id = product.categoryId
    }

    if (product.stock !== undefined) {
      yampiProduct.stock = product.stock
    }

    if (product.sku) {
      yampiProduct.sku = product.sku
    }

    if (product.images && product.images.length > 0) {
      yampiProduct.images = product.images.map(url => ({ url }))
    }

    const response = await fetchYampi<YampiResponse<YampiProduct>>(
      '/catalog/products',
      {
        method: 'POST',
        body: JSON.stringify(yampiProduct),
      }
    )

    if (!response.data) {
      console.error('Produto criado mas resposta vazia:', response)
      return null
    }

    let categories: Category[] = []
    try {
      categories = await getCategories()
    } catch (error) {
      console.warn('Erro ao buscar categorias após criar produto:', error)
    }

    return mapYampiProduct(response.data, categories)
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
}

export async function getCheckoutUrl(items: Array<{ productId: string; skuId?: string; quantity: number }>): Promise<string | null> {
  try {
    if (items.length === 0) {
      return null
    }

    if (items.length === 1) {
      const item = items[0]
      const fullProduct = await fetchYampi<any>(`/catalog/products/${item.productId}?include=skus`)
      const productData = fullProduct.data || fullProduct

      if (productData.skus && productData.skus.data && productData.skus.data.length > 0) {
        const sku = productData.skus.data.find((s: any) => 
          String(s.id) === String(item.skuId) || s.sku === item.skuId
        ) || productData.skus.data[0]

        if (sku && sku.purchase_url) {
          console.log('✅ Usando purchase_url do SKU:', sku.purchase_url)
          return sku.purchase_url
        }
      }

      if (productData.redirect_url_card) {
        console.log('✅ Usando redirect_url_card:', productData.redirect_url_card)
        return productData.redirect_url_card
      }

      if (productData.redirect_url_billet) {
        console.log('✅ Usando redirect_url_billet:', productData.redirect_url_billet)
        return productData.redirect_url_billet
      }

      if (productData.url) {
        console.log('✅ Usando url do produto:', productData.url)
        return productData.url
      }
    }

    // Múltiplos produtos - buscar tokens dos SKUs e construir URL de checkout
    // Formato Yampi: seguro.seudominio.com.br/r/TOKEN1:QTY1,TOKEN2:QTY2,TOKEN3:QTY3
    console.log('🛒 Múltiplos produtos detectados (' + items.length + '), construindo URL de checkout...')
    
    // Extrair domínio seguro da URL base ou usar padrão
    const storeUrl = process.env.NEXT_PUBLIC_YAMPI_STORE_URL || `https://www.studiomyt.com.br`
    let secureDomain = process.env.NEXT_PUBLIC_YAMPI_SECURE_DOMAIN
    
    // Se não tiver domínio seguro configurado, tentar extrair do primeiro produto
    if (!secureDomain) {
      try {
        const firstItem = items[0]
        const firstProduct = await fetchYampi<any>(`/catalog/products/${firstItem.productId}?include=skus`)
        const firstProductData = firstProduct.data || firstProduct
        
        if (firstProductData.skus && firstProductData.skus.data && firstProductData.skus.data.length > 0) {
          const firstSku = firstProductData.skus.data[0]
          if (firstSku.purchase_url) {
            // Extrair domínio de purchase_url (ex: https://seguro.studiomyt.com.br/r/TOKEN)
            const urlMatch = firstSku.purchase_url.match(/https?:\/\/([^\/]+)/)
            if (urlMatch) {
              secureDomain = urlMatch[1]
              console.log('✅ Domínio seguro extraído:', secureDomain)
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao extrair domínio seguro, usando padrão')
      }
    }
    
    // Fallback para domínio padrão se não conseguir extrair
    if (!secureDomain) {
      // Tentar construir baseado no store alias ou usar padrão
      secureDomain = `seguro.${YAMPI_STORE_ALIAS || 'studiomyt.com.br'}`
    }
    
    const secureBaseUrl = `https://${secureDomain}`
    
    try {
      // Buscar informações de todos os produtos para obter os tokens dos SKUs
      const productInfos = await Promise.all(
        items.map(async (item) => {
          try {
            console.log(`🔍 Buscando produto ${item.productId} com SKU ${item.skuId}...`)
            const fullProduct = await fetchYampi<any>(`/catalog/products/${item.productId}?include=skus`)
            const productData = fullProduct.data || fullProduct
            
            if (productData.skus && productData.skus.data && productData.skus.data.length > 0) {
              const sku = productData.skus.data.find((s: any) => 
                String(s.id) === String(item.skuId) || s.sku === item.skuId
              ) || productData.skus.data[0]
              
              if (sku && sku.token) {
                console.log(`✅ Token encontrado para produto ${item.productId}: ${sku.token} (quantidade: ${item.quantity})`)
                return {
                  token: sku.token,
                  skuId: sku.id,
                  quantity: item.quantity,
                  purchaseUrl: sku.purchase_url,
                }
              } else {
                console.warn(`⚠️ SKU sem token para produto ${item.productId}`)
              }
            } else {
              console.warn(`⚠️ Produto ${item.productId} sem SKUs`)
            }
            
            return null
          } catch (error) {
            console.error(`❌ Erro ao buscar produto ${item.productId}:`, error)
            return null
          }
        })
      )

      const validItems = productInfos.filter(Boolean) as Array<{ token: string; skuId: number; quantity: number; purchaseUrl?: string }>
      
      console.log(`📦 Itens válidos encontrados: ${validItems.length} de ${items.length}`)
      
      if (validItems.length > 0) {
        // Formato Yampi: TOKEN1:QTY1,TOKEN2:QTY2,TOKEN3:QTY3
        const tokensWithQuantities = validItems.map(item => `${item.token}:${item.quantity}`).join(',')
        const checkoutUrl = `${secureBaseUrl}/r/${tokensWithQuantities}`
        
        console.log('✅ URL de checkout gerada (formato Yampi):', checkoutUrl)
        console.log('📦 Itens no checkout:', validItems.map(t => ({ 
          token: t.token, 
          quantity: t.quantity,
          skuId: t.skuId 
        })))
        
        return checkoutUrl
      } else {
        console.error('❌ Nenhum item válido encontrado para checkout')
      }
    } catch (error) {
      console.error('❌ Erro ao construir URL de checkout com múltiplos produtos:', error)
    }

    // Fallback: usar URL do primeiro produto ou checkout geral
    const firstItem = items[0]
    const fullProduct = await fetchYampi<any>(`/catalog/products/${firstItem.productId}?include=skus`)
    const productData = fullProduct.data || fullProduct

    if (productData.redirect_url_card) {
      console.log('⚠️ Usando redirect_url_card do primeiro produto como fallback:', productData.redirect_url_card)
      return productData.redirect_url_card
    }

    const checkoutUrl = `${baseUrl}/checkout`
    console.log('⚠️ Usando URL base de checkout como fallback:', checkoutUrl)
    return checkoutUrl
  } catch (error) {
    console.error('Error generating checkout URL:', error)
    return null
  }
}

export async function createOrder(order: Order): Promise<{ id: string; status: string } | null> {
  try {
    const yampiOrder = {
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
        city: order.customer.city,
        state: order.customer.state,
        zip_code: order.customer.zipCode,
      },
      items: order.items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shipping_cost: order.shipping,
      total: order.total,
    }

    const response = await fetchYampi<YampiResponse<{ id: string; status: string }>>(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(yampiOrder),
      }
    )

    if (!response.data) {
      console.error('Pedido criado mas resposta vazia:', response)
      return null
    }

    return response.data
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function syncProducts(): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = []
  let count = 0

  try {
    const result = await getProducts({ limit: 100 })
    count = result.products.length
    return { success: true, count, errors }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    errors.push(errorMessage)
    return { success: false, count, errors }
  }
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!YAMPI_STORE_ALIAS) {
      return {
        success: false,
        message: 'YAMPI_STORE_ALIAS não configurada. Configure a variável de ambiente NEXT_PUBLIC_YAMPI_STORE_ALIAS',
      }
    }

    if (!YAMPI_USER_TOKEN || !YAMPI_USER_SECRET) {
      return {
        success: false,
        message: 'YAMPI_USER_TOKEN ou YAMPI_USER_SECRET não configuradas. Configure as variáveis de ambiente',
      }
    }

    const baseUrl = `${YAMPI_API_URL}/${YAMPI_API_VERSION}/${YAMPI_STORE_ALIAS}`
    const response = await fetch(`${baseUrl}/catalog/brands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Alias': YAMPI_STORE_ALIAS,
        'User-Token': YAMPI_USER_TOKEN,
        'User-Secret-Key': YAMPI_USER_SECRET,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    await response.json()
    
    return {
      success: true,
      message: 'Conexão com a API Yampi estabelecida com sucesso!',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return {
      success: false,
      message: `Erro ao conectar com a API Yampi: ${errorMessage}`,
    }
  }
}

export interface ShippingCostRequest {
  zipcode: string
  total: number
  skus_ids: number[]
  quantities: number[]
  order_id?: number
  origin?: string
  utm_email?: string
}

export interface ShippingCostResponse {
  success: boolean
  data?: {
    price?: number
    cost?: number
    delivery_days?: number
    days?: number
    delivery_time?: string
    carrier?: string
    service?: string
  }
  message?: string
  error?: string
}

export async function calculateShippingCost(request: ShippingCostRequest): Promise<ShippingCostResponse> {
  try {
    const cleanZipcode = request.zipcode.replace(/\D/g, '')
    
    if (cleanZipcode.length !== 8) {
      return {
        success: false,
        message: 'CEP inválido. Deve conter 8 dígitos.',
      }
    }

    if (!request.skus_ids || request.skus_ids.length === 0) {
      return {
        success: false,
        message: 'Nenhum SKU informado.',
      }
    }

    if (!request.quantities || request.quantities.length === 0) {
      return {
        success: false,
        message: 'Nenhuma quantidade informada.',
      }
    }

    if (request.skus_ids.length !== request.quantities.length) {
      return {
        success: false,
        message: 'Número de SKUs e quantidades não correspondem.',
      }
    }

    const skusIds = request.skus_ids.map(id => {
      const numId = Number(id)
      if (isNaN(numId) || numId <= 0) {
        throw new Error(`SKU ID inválido: ${id}`)
      }
      return numId
    })

    const quantities = request.quantities.map(qty => {
      const numQty = Number(qty)
      if (isNaN(numQty) || numQty <= 0) {
        throw new Error(`Quantidade inválida: ${qty}`)
      }
      return numQty
    })

    const total = Number(request.total)
    if (isNaN(total) || total < 0) {
      throw new Error(`Total inválido: ${request.total}`)
    }

    let orderId = request.order_id

    if (!orderId || orderId <= 0) {
      console.log('⚠️ Nenhum order_id fornecido. A API exige um pedido válido.')
      console.log('💡 Tentando usar um valor padrão ou criar pedido temporário...')
      
      try {
        const tempOrderData = {
          items: skusIds.map((skuId, index) => ({
            sku_id: skuId,
            quantity: quantities[index],
          })),
          total: parseFloat(total.toFixed(2)),
          status: 'draft',
        }
        
        console.log('📝 Tentando criar pedido temporário:', JSON.stringify(tempOrderData, null, 2))
        
        const tempOrderResponse = await fetchYampi<any>('/orders', {
          method: 'POST',
          body: JSON.stringify(tempOrderData),
        })
        
        console.log('📦 Resposta da criação de pedido:', JSON.stringify(tempOrderResponse, null, 2))
        
        if (tempOrderResponse.data && tempOrderResponse.data.id) {
          orderId = Number(tempOrderResponse.data.id)
          console.log('✅ Pedido temporário criado com sucesso:', orderId)
        } else {
          console.warn('⚠️ Resposta não contém ID do pedido')
          orderId = null
        }
      } catch (orderError: any) {
        console.warn('⚠️ Erro ao criar pedido temporário:', orderError?.message || orderError)
        console.warn('⚠️ Continuando sem order_id - a API pode rejeitar')
        orderId = null
      }
    }

    const requestBody: any = {
      zipcode: String(cleanZipcode),
      total: parseFloat(total.toFixed(2)),
      skus_ids: skusIds,
      quantities: quantities,
      origin: request.origin || 'product_page',
    }

    if (orderId && orderId > 0) {
      requestBody.order_id = Number(orderId)
      console.log('✅ Usando order_id:', orderId)
    } else {
      requestBody.order_id = null
      console.warn('⚠️ Usando order_id = null (pode causar erro 422)')
    }

    if (request.utm_email && request.utm_email.trim() && request.utm_email !== '') {
      requestBody.utm_email = request.utm_email.trim()
    }
    
    console.log('📋 Campos no requestBody:', Object.keys(requestBody))
    console.log('📋 order_id incluído?', 'order_id' in requestBody, 'valor:', requestBody.order_id)

    const fullUrl = `${YAMPI_API_URL}/${YAMPI_API_VERSION}/${YAMPI_STORE_ALIAS}/logistics/shipping-costs`
    
    console.log('🚚 Calculando frete - Dados enviados:', {
      zipcode: cleanZipcode,
      total: request.total,
      totalFormatted: requestBody.total,
      skus_ids: request.skus_ids,
      quantities: request.quantities,
      origin: request.origin || 'product_page',
    })

    console.log('📤 Corpo da requisição (JSON):', JSON.stringify(requestBody, null, 2))
    console.log('📤 Tipos dos dados:', {
      zipcode: typeof requestBody.zipcode,
      total: typeof requestBody.total,
      skus_ids: Array.isArray(requestBody.skus_ids) ? requestBody.skus_ids.map((id: any) => typeof id) : 'não é array',
      quantities: Array.isArray(requestBody.quantities) ? requestBody.quantities.map((qty: any) => typeof qty) : 'não é array',
      origin: typeof requestBody.origin,
    })
    console.log('📤 URL completa:', fullUrl)
    console.log('📤 Headers:', {
      'Content-Type': 'application/json',
      'User-Token': YAMPI_USER_TOKEN ? '***' : 'não configurado',
      'User-Secret-Key': YAMPI_USER_SECRET ? '***' : 'não configurado',
    })

    const response = await fetchYampi<any>('/logistics/shipping-costs', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    console.log('📦 Resposta completa do cálculo de frete:', JSON.stringify(response, null, 2))

    if (response.data) {
      const shippingData = Array.isArray(response.data) ? response.data[0] : response.data
      console.log('✅ Dados de frete processados:', shippingData)
      return {
        success: true,
        data: shippingData,
      }
    }

    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ')
      console.error('❌ Erros na resposta:', response.errors)
      return {
        success: false,
        message: errorMessages,
      }
    }

    console.warn('⚠️ Resposta sem dados ou erros:', response)
    return {
      success: false,
      message: 'Resposta inválida da API - nenhum dado de frete retornado',
    }
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      request: {
        zipcode: request.zipcode,
        total: request.total,
        skus_ids: request.skus_ids,
        quantities: request.quantities,
      },
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: error instanceof Error ? error.message : 'Erro desconhecido ao calcular frete',
    }
  }
}

