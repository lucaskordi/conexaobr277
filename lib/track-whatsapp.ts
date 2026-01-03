export function trackWhatsAppClick(source: string) {
  fetch('/api/track-whatsapp-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source,
      timestamp: new Date().toISOString(),
    }),
  }).catch(error => {
    console.error('Error tracking WhatsApp click:', error)
  })
}

