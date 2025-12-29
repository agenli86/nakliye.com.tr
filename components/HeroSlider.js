'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import Image from 'next/image'
import Link from 'next/link'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

export default function HeroSlider({ sliders }) {
  if (!sliders || sliders.length === 0) {
    return (
      <section className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-primary-500 to-primary-700 flex items-center">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Adana Evden Eve Nakliyat
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
            Güvenilir ve profesyonel taşımacılık hizmetleri
          </p>
          <Link href="/iletisim" className="btn-primary text-lg animate-fade-in-up animation-delay-400">
            Teklif Alın
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[600px] md:h-[700px]">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-white/50 !opacity-100',
          bulletActiveClass: '!bg-white !w-8 !rounded-full',
        }}
        loop={true}
        className="h-full"
      >
        {sliders.map((slide, index) => (
          <SwiperSlide key={slide.id || index}>
            <div className="relative h-full">
              {/* Background Image */}
              <Image
                src={slide.resim}
                alt={slide.baslik}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/90 via-secondary-900/70 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                      {slide.baslik}
                    </h1>
                    {slide.alt_baslik && (
                      <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up animation-delay-200">
                        {slide.alt_baslik}
                      </p>
                    )}
                    {slide.buton_link && (
                      <Link
                        href={slide.buton_link}
                        className="btn-primary text-lg animate-fade-in-up animation-delay-400"
                      >
                        {slide.buton_metin || 'İnceleyin'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  )
}
