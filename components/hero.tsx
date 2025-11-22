'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8"
      style={{ zIndex: 1, paddingTop: '140px' }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-white mb-6 leading-tight -mt-20"
        >
          <span className="block mb-2">Elegância e sofisticação com o</span>
          <span className="block text-brand-yellow drop-shadow-lg">menor preço do mercado</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
            ✓ Qualidade Garantida
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
            ✓ Entrega Rápida
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
            ✓ Melhor Preço
          </span>
        </motion.div>
      </div>
    </motion.section>
  )
}

