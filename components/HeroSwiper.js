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
        bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-white/50 !opacity-100',
        bulletActiveClass: '!bg-white !w-8 !rounded-full',
        renderBullet: (index, className) => `<button class="${className}" aria-label="Slayt ${index + 1}"></button>`,
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
