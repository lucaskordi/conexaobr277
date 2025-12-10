'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/marketplace/navbar'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue via-brand-blue to-blue-900">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-brand-yellow mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-white mb-4">
              Página não encontrada
            </h2>
            <p className="text-lg text-brand-white/80 mb-8">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="bg-white/10 text-brand-white border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <Link href="/">
              <Button className="bg-brand-yellow text-brand-blue hover:bg-yellow-400">
                <Home className="w-4 h-4 mr-2" />
                Ir para Home
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-brand-white/60 text-sm mb-4">
              Páginas disponíveis:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/products">
                <Button variant="ghost" className="text-brand-white hover:bg-white/10">
                  Produtos
                </Button>
              </Link>
              <Link href="/lpwpc">
                <Button variant="ghost" className="text-brand-white hover:bg-white/10">
                  Site Original
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




