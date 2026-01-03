import type { Metadata } from "next";
import { Navbar } from '@/components/marketplace/navbar'
import Footer from '@/components/footer'
import WhatsAppButton from '@/components/whatsapp-button'

export const metadata: Metadata = {
  title: "Política de Troca e Devolução | Conexão BR 277",
  description: "Conheça nossa política de troca e devolução baseada no Código de Defesa do Consumidor. Garantia de qualidade e satisfação para seus produtos.",
};

export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Política de Troca e Devolução
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Nossa política de troca e devolução é baseada no Código de Defesa do Consumidor (Lei nº 8.078/1990) para garantir total transparência e segurança na sua compra.
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Direito de Arrependimento (Devolução)
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Conforme o Artigo 49 do CDC, você tem o direito de desistir da compra em até 7 (sete) dias corridos após o recebimento do produto, sem necessidade de justificativa.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Condição:</p>
                    <p className="text-gray-700">O produto deve estar em sua embalagem original, sem indícios de uso e acompanhado de nota fiscal.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold text-gray-900 mb-2">Reembolso:</p>
                    <p className="text-gray-700">O valor total pago (produto + frete) será devolvido através do mesmo método de pagamento utilizado na compra.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Troca por Defeito de Fabricação
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Para produtos com defeito de fabricação (bens duráveis), o prazo de garantia legal é de 90 (noventa) dias (Artigo 26 do CDC).
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Procedimento:</p>
                    <p className="text-gray-700">Após o contato, temos o prazo de até 30 dias para sanar o defeito. Caso não seja resolvido, o cliente poderá escolher entre a substituição do produto, a restituição do valor pago ou o abatimento proporcional do preço.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Como solicitar
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Para iniciar qualquer processo de troca ou devolução, entre em contato conosco através dos nossos canais oficiais:
                  </p>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-blue-900">WhatsApp: </span>
                        <span className="text-blue-800">(41) 99527-8067</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-900">Telefone: </span>
                        <span className="text-blue-800">(41) 99527-8067</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-900">Endereço: </span>
                        <span className="text-blue-800">R. Atílio Piotto, 622 - Uberaba, Curitiba - PR</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
