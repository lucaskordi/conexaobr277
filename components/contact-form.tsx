'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' })
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: '',
        })
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Erro ao enviar mensagem. Tente novamente.' })
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Erro ao enviar mensagem. Tente novamente mais tarde.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="pt-16 pb-24 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-2">
            Entre em Contato
          </h2>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Preencha o formulário abaixo e nossa equipe entrará em contato em breve
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-full min-h-[400px] lg:min-h-[600px]"
          >
            <div className="w-full h-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <iframe
                src="https://www.google.com/maps?q=R.+Atílio+Piotto,+622+-+Uberaba,+Curitiba+-+PR&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Localização Conexão BR277"
              />
            </div>
          </motion.div>
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-6 border border-gray-100"
          >
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
              placeholder="Seu nome completo"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                placeholder="(41) 99999-9999"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none"
              placeholder="Conte-nos como podemos ajudar..."
            />
          </div>
          {submitStatus.type && (
            <div
              className={`p-4 rounded-xl ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 border-2 border-green-200 text-green-800'
                  : 'bg-red-50 border-2 border-red-200 text-red-800'
              }`}
            >
              <p className="font-semibold">{submitStatus.message}</p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(9, 73, 169, 0.4)' } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className={`w-full px-6 py-4 bg-gradient-to-r from-brand-blue to-blue-700 text-brand-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
          </motion.button>
        </motion.form>
        </div>
      </div>
    </section>
  )
}

