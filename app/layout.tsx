import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Painel Ripado Curitiba | WPC, Interno e Externo | Conexão BR 277",
    template: "%s | Conexão BR 277",
  },
  description: "Compre painel ripado em Curitiba. Painel ripado WPC, interno e externo. Os melhores preços e qualidade. Entrega rápida. Conheça nossa linha completa de painéis ripados para revestimento.",
  keywords: [
    "painel ripado",
    "painel ripado curitiba",
    "painel ripado wpc",
    "painel ripado interno",
    "painel ripado externo",
    "painel ripado preço",
    "painel ripado onde comprar",
    "painel ripado revestimento",
    "painel ripado para parede",
    "painel ripado para teto",
    "painel ripado madeira",
    "painel ripado pvc",
    "painel ripado composto",
    "painel ripado deck",
    "painel ripado fachada",
    "painel ripado área externa",
    "painel ripado área interna",
    "painel ripado banheiro",
    "painel ripado cozinha",
    "painel ripado sala",
    "painel ripado quarto",
    "painel ripado varanda",
    "painel ripado pergolado",
    "painel ripado garagem",
    "painel ripado comercial",
    "painel ripado residencial",
    "painel ripado wpc curitiba",
    "painel ripado interno curitiba",
    "painel ripado externo curitiba",
    "revestimento painel ripado",
    "instalação painel ripado",
    "painel ripado medidas",
    "painel ripado cores",
    "painel ripado marrom",
    "painel ripado cinza",
    "painel ripado natural",
    "painel ripado envelhecido",
    "painel wpc curitiba",
    "deck wpc curitiba",
    "materiais de construção curitiba",
    "revestimento parede curitiba",
    "conexão br 277",
    "materiais de construção",
    "tintas",
    "forro PVC",
    "ferramentas",
    "churrasqueiras",
  ],
  authors: [{ name: "Conexão BR 277" }],
  creator: "Conexão BR 277",
  publisher: "Conexão BR 277",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://conexaobr277.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Conexão BR 277',
    title: "Painel Ripado Curitiba | WPC, Interno e Externo | Conexão BR 277",
    description: "Compre painel ripado em Curitiba. Painel ripado WPC, interno e externo. Os melhores preços e qualidade. Entrega rápida. Conheça nossa linha completa de painéis ripados para revestimento.",
    images: [
      {
        url: '/conexaologo.svg',
        width: 1200,
        height: 630,
        alt: 'Painel Ripado Curitiba - Conexão BR 277',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Painel Ripado Curitiba | WPC, Interno e Externo | Conexão BR 277",
    description: "Compre painel ripado em Curitiba. Painel ripado WPC, interno e externo. Os melhores preços e qualidade. Entrega rápida.",
    images: ['/conexaologo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/conexaologo.svg',
    apple: '/conexaologo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5R7K3CWC');`
        }} />
        {/* End Google Tag Manager */}
      </head>
      <GoogleAnalytics />
      <body
        className={`${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5R7K3CWC"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}
