'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function Sphere360() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      '/ED.VERUS.360.JD.ATC-standard-v2-9000w.png',
      (loadedTexture) => {
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.error('Erro ao carregar textura:', error)
      }
    )
  }, [])

  if (!texture) {
    return null
  }

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <Sphere360 />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
        rotateSpeed={-0.5}
      />
    </>
  )
}

export function Showroom360() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-white mb-2">
              Conheça nosso Showroom
            </h2>
            <div className="w-24 h-1 bg-brand-yellow mx-auto mb-4"></div>
            <p className="text-brand-white/80 text-lg">
              Explore nosso espaço em 360°
            </p>
          </div>
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="text-white">Carregando...</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-white mb-2">
            Conheça nosso Showroom
          </h2>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mb-4"></div>
          <p className="text-brand-white/80 text-lg">
            Explore nosso espaço em 360°
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full max-w-4xl mx-auto"
        >
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-white">Carregando visualização 360°...</div>
              </div>
            }>
              <Canvas
                camera={{ position: [0, 0, 0.1], fov: 75 }}
                gl={{ 
                  antialias: true,
                  alpha: false,
                  preserveDrawingBuffer: true
                }}
              >
                <Scene />
              </Canvas>
            </Suspense>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
              Arraste para rotacionar
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
