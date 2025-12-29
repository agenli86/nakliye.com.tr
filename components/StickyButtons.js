'use client'

import { FaWhatsapp, FaPhone } from 'react-icons/fa'

export default function StickyButtons({ whatsapp = '905057805551', telefon = '05057805551' }) {
  return (
    <div className="sticky-icons">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="sticky-icon whatsapp"
        aria-label="WhatsApp ile iletişime geçin"
      >
        <FaWhatsapp size={28} />
      </a>

      {/* Phone */}
      <a
        href={`tel:${telefon}`}
        className="sticky-icon phone"
        aria-label="Telefon ile arayın"
      >
        <FaPhone size={24} />
      </a>
    </div>
  )
}
