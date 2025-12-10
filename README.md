# Marketplace - Next.js

Marketplace moderno desenvolvido com Next.js, integrado com a API Yampi.

## Estrutura do Projeto

- `/app` - Páginas do Next.js App Router
  - `/` - Página inicial do marketplace
  - `/products` - Listagem de produtos
  - `/product/[id]` - Detalhes do produto
  - `/checkout` - Página de checkout
  - `/order-success` - Página de confirmação de pedido
  - `/lpwpc` - Site original movido para esta rota
- `/components` - Componentes React
  - `/marketplace` - Componentes específicos do marketplace (Navbar, Hero, CartSidebar)
  - `/ui` - Componentes UI reutilizáveis (Button, ProductCard)
- `/services` - Serviços de integração com APIs
- `/store` - Gerenciamento de estado (Zustand)
- `/types` - Definições TypeScript
- `/lib` - Utilitários

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_YAMPI_API_URL=https://api.dooki.com.br
NEXT_PUBLIC_YAMPI_API_VERSION=v2
NEXT_PUBLIC_YAMPI_STORE_ALIAS=seu_alias_aqui
NEXT_PUBLIC_YAMPI_USER_TOKEN=seu_user_token_aqui
NEXT_PUBLIC_YAMPI_USER_SECRET=seu_user_secret_aqui
```

**Onde obter as credenciais:**
- Acesse o painel da Yampi: https://www.yampi.com.br/
- Vá em **Perfil** > **Credenciais de API**
- Copie o **Alias**, **User Token** e **User Secret Key**

Para mais detalhes, consulte o arquivo `YAMPI_INTEGRATION.md`.

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades

- Página inicial com hero banner e produtos em destaque
- Listagem de produtos com filtros por categoria
- Página de detalhes do produto
- Carrinho de compras persistente (localStorage)
- Checkout completo
- Integração com API Yampi para:
  - Buscar produtos
  - Buscar categorias
  - Criar produtos
  - Criar pedidos

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand (gerenciamento de estado)
- Lucide React (ícones)

## Estrutura de Rotas

- `/` - Homepage do marketplace
- `/products` - Listagem de produtos
- `/product/[id]` - Detalhes do produto
- `/checkout` - Finalização de compra
- `/order-success` - Confirmação de pedido
- `/lpwpc` - Site original
