'use client'

import { FaWhatsapp, FaPhone } from 'react-icons/fa'

export default function StickyButtons({ whatsapp = '905057805551', telefon = '05057805551' }) {
  
  // Google Ads Dönüşüm Takip Fonksiyonu
  const handleConversion = () => {
    if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-10842738572/28z6CO6-69sbEIyfnLIo'
      });
    }
  }

  return (
    <div className="sticky-icons">
      {/* WhatsApp - Artık takipli */}
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="sticky-icon whatsapp"
        aria-label="WhatsApp ile iletişime geçin"
        onClick={handleConversion}
      >
        <FaWhatsapp size={28} />
      </a>

      {/* Phone - Artık takipli */}
      <a
        href={`tel:${telefon}`}
        className="sticky-icon phone"
        aria-label="Telefon ile arayın"
        onClick={handleConversion}
      >
        <FaPhone size={24} />
      </a>
    </div>
  )
}
