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
 * slayt sunucudan düz HTML olarak geliyor. Tek slayt varsa Swiper hiç
 * indirilmiyor.
 *
 * Carousel'e geçiş neden `load` + idle değil de etkileşime bağlı: devir
 * anında sunucudan gelen <img> DOM'dan çıkıp yerine Swiper'ınki geliyor.
 * Bu yeni öğe tarayıcı için yeni bir LCP adayı ve boyanma zamanı sayfanın
 * LCP'si olarak kaydediliyordu — ölçümde "öğe oluşturma gecikmesi" olarak
 * görünen ~2 saniyenin muhtemel kaynağı bu. Devir artık kullanıcı sayfaya
 * dokunduğunda ya da 6. saniyede yapılıyor; ikisi de LCP penceresinin
 * dışında kalıyor.
 */

const DEVIR_GECIKMESI_MS = 6000
const OLAYLAR = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']
const HeroSwiper = dynamic(() => import('./HeroSwiper'), {
  ssr: false,
  loading: () => null,
})

export default function HeroSlider({ sliders }) {
  const [carouselReady, setCarouselReady] = useState(false)
  const hasCarousel = Array.isArray(sliders) && sliders.length > 1

  useEffect(() => {
    if (!hasCarousel) return

    let timer = null

    const devret = () => {
      temizle()
      setCarouselReady(true)
    }

    const temizle = () => {
      OLAYLAR.forEach((olay) => window.removeEventListener(olay, devret))
      if (timer) window.clearTimeout(timer)
    }

    OLAYLAR.forEach((olay) =>
      window.addEventListener(olay, devret, { once: true, passive: true })
    )
    timer = window.setTimeout(devret, DEVIR_GECIKMESI_MS)

    return temizle
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
