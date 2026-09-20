'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import HeroSlide from './HeroSlide'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

/**
 * Swiper carousel'i. Yalnızca birden fazla slayt varsa ve sayfa
 * yüklendikten sonra tarayıcıya indirilir (bkz. HeroSlider).
 */
export default function HeroSwiper({ sliders }) {
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Pagination]}
      effect="fade"
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{
        clickable: true,
        // Nokta 12 px görünüyor ama buton 44x44 px: mobilde parmakla
        // isabet ettirilebilir bir dokunma hedefi gerekiyor. Görünüm
        // globals.css'teki .hero-bullet kurallarında.
        bulletClass: 'hero-bullet',
        bulletActiveClass: 'hero-bullet-aktif',
        renderBullet: (index, className) =>
          `<button type="button" class="${className}" aria-label="Slayt ${index + 1}"><span></span></button>`,
      }}
      loop={true}
      className="h-full"
    >
      {sliders.map((slide, index) => (
        <SwiperSlide key={slide.id || index}>
          <HeroSlide slide={slide} index={index} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
