'use client'

import { useState } from 'react'
import { FaTimes, FaChevronLeft, FaChevronRight, FaSearchPlus } from 'react-icons/fa'
import Image from 'next/image'

export default function HomeGallery({ galeri }) {
  const [lightbox, setLightbox] = useState({ open: false, index: 0 })
  
  if (!galeri || galeri.length === 0) return null
  
  const items = galeri.slice(0, 9)
  
  const openLightbox = (index) => setLightbox({ open: true, index })
  const closeLightbox = () => setLightbox({ open: false, index: 0 })
  
  const nextImage = () => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % items.length }))
  const prevImage = () => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + items.length) % items.length }))

  const overlayTexts = ['Adana Nakliye', 'Güvenli Taşıma', 'Profesyonel Ekip', 'Evden Eve', 'Asansörlü Nakliyat', 'Sigortalı Hizmet', 'Hızlı Teslimat', '7/24 Destek', 'Uygun Fiyat']

  return (
    <>
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1e3a5f' }}>Çalışmalarımız</h2>
            <p className="text-gray-600">Profesyonel nakliyat hizmetlerimizden görüntüler</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-3 max-w-4xl mx-auto">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={item.resim}
                  alt={item.baslik || 'Adana Nakliye'}
                  fill
                  sizes="(max-width: 768px) 33vw, 250px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#d4ed31' }}>
                    <FaSearchPlus className="text-sm" style={{ color: '#1e3a5f' }} />
                  </div>
                  <span className="text-white text-xs md:text-sm font-medium text-center px-2">
                    {item.baslik || overlayTexts[index % overlayTexts.length]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
            <FaTimes size={20} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <FaChevronLeft size={20} />
          </button>
          <div className="max-w-4xl max-h-[80vh] px-12" onClick={(e) => e.stopPropagation()}>
            <img src={items[lightbox.index].resim} alt={items[lightbox.index].baslik || 'Galeri'} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <p className="text-white text-center mt-3">{lightbox.index + 1} / {items.length}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <FaChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  )
}
