# Guia de Integração com Yampi

Este guia explica como configurar e usar a integração com a API Yampi no marketplace.

## Configuração Inicial

### 1. Obter Credenciais da API

1. Acesse o painel da Yampi: https://www.yampi.com.br/
2. Vá em **Perfil** > **Credenciais de API**
3. Anote as seguintes credenciais:
   - **Alias**: Alias da sua loja (obrigatório)
   - **User Token**: Token de autenticação (obrigatório)
   - **User Secret Key**: Chave secreta de autenticação (obrigatório)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_YAMPI_API_URL=https://api.dooki.com.br
NEXT_PUBLIC_YAMPI_API_VERSION=v2
NEXT_PUBLIC_YAMPI_STORE_ALIAS=seu_alias_aqui
YAMPI_API_URL=https://api.dooki.com.br
YAMPI_API_VERSION=v2
YAMPI_STORE_ALIAS=seu_alias_aqui
YAMPI_USER_TOKEN=seu_user_token_aqui
YAMPI_USER_SECRET=seu_user_secret_aqui
NEXT_PUBLIC_SITE_URL=https://conexaobr277.com.br
```

**Variáveis obrigatórias (Server-Side - SEM NEXT_PUBLIC_):**
- `YAMPI_STORE_ALIAS` - Alias da sua loja (usado apenas no servidor)
- `YAMPI_USER_TOKEN` - Token de usuário (usado apenas no servidor - SEGURO)
- `YAMPI_USER_SECRET` - Chave secreta (usada apenas no servidor - SEGURO)

**Variáveis opcionais (Server-Side):**
- `YAMPI_API_URL` - URL base da API (padrão: https://api.dooki.com.br)
- `YAMPI_API_VERSION` - Versão da API (padrão: v2)

**Variáveis públicas (Client-Side - COM NEXT_PUBLIC_):**
- `NEXT_PUBLIC_YAMPI_STORE_ALIAS` - Alias da loja (apenas para referência)
- `NEXT_PUBLIC_YAMPI_API_URL` - URL base (apenas para referência)
- `NEXT_PUBLIC_YAMPI_API_VERSION` - Versão (apenas para referência)

**⚠️ IMPORTANTE - SEGURANÇA:**
- **NUNCA** use `NEXT_PUBLIC_` nas credenciais sensíveis (TOKEN e SECRET)
- Credenciais sensíveis (`YAMPI_USER_TOKEN` e `YAMPI_USER_SECRET`) devem **SEMPRE** ser sem `NEXT_PUBLIC_`
- As credenciais sensíveis ficam apenas no servidor e nunca são expostas ao cliente
- Nunca commite o arquivo `.env.local` no Git

### 3. Reiniciar o Servidor

Após configurar as variáveis de ambiente, reinicie o servidor:

```bash
npm run dev
```

## Endpoints da API

A estrutura base da API Yampi é:
```
https://api.dooki.com.br/v2/{merchantAlias}/...
```

### Produtos

- **Listar produtos**: `GET /catalog/products`
  - Parâmetros: `category_id`, `q` (busca), `page`, `per_page`, `status`, `published`
- **Buscar produto**: `GET /catalog/products/:id`
- **Criar produto**: `POST /catalog/products`

### Categorias

- **Listar categorias**: `GET /catalog/categories`

### Pedidos

- **Criar pedido**: `POST /orders`

### Outros Endpoints Úteis

- **Testar conexão**: `GET /catalog/brands` (endpoint simples para testar autenticação)

## Funções Disponíveis

### `getProducts(params?)`

Busca produtos da API Yampi.

```typescript
const result = await getProducts({
  categoryId: '123',
  search: 'termo de busca',
  page: 1,
  limit: 20,
})

console.log(result.products) // Array de produtos
console.log(result.totalPages) // Total de páginas
console.log(result.totalCount) // Total de produtos
```

### `getProduct(id)`

Busca um produto específico por ID.

```typescript
const product = await getProduct('product-id-123')
```

### `getCategories()`

Busca todas as categorias organizadas hierarquicamente.

```typescript
const categories = await getCategories()
```

### `createProduct(product)`

Cria um novo produto na Yampi.

```typescript
const newProduct = await createProduct({
  name: 'Produto Exemplo',
  description: 'Descrição do produto',
  price: 99.90,
  compareAtPrice: 149.90,
  stock: 100,
  sku: 'PROD-001',
  categoryId: 'cat-123',
  images: ['https://exemplo.com/imagem.jpg'],
})
```

### `createOrder(order)`

Cria um novo pedido na Yampi.

```typescript
const order = await createOrder({
  id: '',
  items: [...],
  subtotal: 100,
  shipping: 10,
  total: 110,
  customer: {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '41999999999',
    address: 'Rua Exemplo, 123',
    city: 'Curitiba',
    state: 'PR',
    zipCode: '80000-000',
  },
  status: 'pending',
  createdAt: new Date().toISOString(),
})
```

### `testConnection()`

Testa a conexão com a API Yampi.

```typescript
const result = await testConnection()
console.log(result.success) // true ou false
console.log(result.message) // Mensagem de status
```

### `syncProducts()`

Sincroniza produtos da API.

```typescript
const result = await syncProducts()
console.log(result.success) // true ou false
console.log(result.count) // Número de produtos sincronizados
console.log(result.errors) // Array de erros, se houver
```

## Tratamento de Erros

A integração inclui tratamento de erros robusto:

- Erros de autenticação são logados
- Erros de validação são capturados e exibidos
- Falhas na API retornam valores padrão (arrays vazios, null, etc.)
- Todos os erros são logados no console para debug

## Debugging

Para ver logs detalhados da integração:

1. Abra o console do navegador (F12)
2. Procure por mensagens que começam com "Yampi" ou "Error fetching"
3. Verifique se as variáveis de ambiente estão configuradas corretamente

## Testando a Integração

Crie uma página de teste para verificar a conexão:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { testConnection, getProducts } from '@/services/yampi'

export default function TestPage() {
  const [status, setStatus] = useState('Testando...')

  useEffect(() => {
    async function test() {
      const connection = await testConnection()
      setStatus(connection.message)

      if (connection.success) {
        const products = await getProducts({ limit: 5 })
        console.log('Produtos encontrados:', products)
      }
    }
    test()
  }, [])

  return <div>{status}</div>
}
```

## Suporte

Se encontrar problemas:

1. Verifique se as credenciais estão corretas
2. Confirme que a URL da API está correta
3. Verifique os logs do console para mensagens de erro
4. Consulte a documentação oficial da Yampi: https://help.yampi.com.br

