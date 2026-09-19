'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import HeroSlide from './HeroSlide'

/**
 * Hero alanı — sayfanın LCP öğesi.
 *
 * Eskiden Swiper (≈40 kB gzip) ilk render'ın parçasıydı; hero görseli
 * ancak JS indirilip hydrate olduktan sonra çizilebiliyordu. Artık ilk
 * slayt sunucudan düz HTML olarak geliyor, carousel ise sayfa yüklendikten
 * sonra arka planda indirilip yerine geçiyor. Tek slayt varsa Swiper hiç
 * indirilmiyor.
 */
const HeroSwiper = dynamic(() => import('./HeroSwiper'), {
  ssr: false,
  loading: () => null,
})

export default function HeroSlider({ sliders }) {
  const [carouselReady, setCarouselReady] = useState(false)
  const hasCarousel = Array.isArray(sliders) && sliders.length > 1

  useEffect(() => {
    if (!hasCarousel) return

    let handle = null
    let cancelled = false

    const schedule = () => {
      if (cancelled) return
      if ('requestIdleCallback' in window) {
        handle = window.requestIdleCallback(() => !cancelled && setCarouselReady(true), { timeout: 3000 })
      } else {
        handle = window.setTimeout(() => !cancelled && setCarouselReady(true), 600)
      }
    }

    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', schedule)
      if (handle == null) return
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
    }
  }, [hasCarousel])

  // Fallback (Yedek) Alanı
  if (!sliders || sliders.length === 0) {
    return (
      <section className="relative h-[450px] md:h-[500px] lg:h-[550px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Adana Evden Eve Nakliyat
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Güvenilir ve profesyonel taşımacılık hizmetleri
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/teklif-al"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
            >
              Teklif Alın
            </Link>
            <a
              href="tel:05057805551"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 border-2 border-white text-white"
            >
              Hemen Ara
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[450px] md:h-[500px] lg:h-[550px]">
      {carouselReady
        ? <HeroSwiper sliders={sliders} />
        : <HeroSlide slide={sliders[0]} index={0} />}

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  )
}
