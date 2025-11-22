'use client'

import { motion } from 'framer-motion'

const advantages = [
  'Não Empena',
  'Não Mofa',
  'Não Cria Cupim',
  'Fácil Instalação',
  'Acabamento Premium',
  'Fácil de Limpar'
]

export default function AdvantagesSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-brand-white text-center mb-12"
        >
          Vantagens
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-brand-yellow rounded-2xl p-6 sm:p-8 border-2 border-brand-yellow hover:border-brand-blue/50 transition-all duration-300 shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                <h3 className="text-lg sm:text-xl font-bold text-brand-blue flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-white flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {advantage}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

