import Image from 'next/image'
import Link from 'next/link'

/**
 * Tek bir hero slaytı. Hem sunucuda basılan ilk slayt hem de Swiper
 * içindeki slaytlar bu bileşeni kullanır, böylece carousel devreye
 * girdiğinde görsel olarak hiçbir şey kaymaz.
 */
export default function HeroSlide({ slide, index = 0 }) {
  return (
    <div className="relative h-full">
      <Image
        src={slide.resim}
        alt={`${slide.baslik} - Adana Nakliye Hizmeti`}
        fill
        className="object-cover object-center"
        priority={index === 0}
        fetchPriority={index === 0 ? 'high' : 'low'}
        loading={index === 0 ? 'eager' : 'lazy'}
        // Hero fotoğrafının üstünde koyu bir degrade var; 60 kalite ile 75
        // arasındaki fark gözle görülmüyor ama dosya belirgin küçülüyor.
        quality={60}
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {slide.baslik}
            </h1>
            {slide.alt_baslik && (
              <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6">
                {slide.alt_baslik}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <Link
                href="/teklif-al"
                className="inline-block px-6 py-3 rounded-lg font-semibold text-base transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
              >
                TEKLİF AL
              </Link>

              {slide.buton_link && (
                <Link
                  href={slide.buton_link}
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-base transition-all hover:scale-105 shadow-lg border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  {slide.buton_metin || 'HEMEN ARA'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
