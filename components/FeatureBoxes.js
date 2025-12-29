'use client'

import { FaAward, FaShieldAlt, FaMoneyBillWave, FaTruck, FaClock, FaHeadset } from 'react-icons/fa'

const iconMap = {
  award: FaAward,
  shield: FaShieldAlt,
  money: FaMoneyBillWave,
  truck: FaTruck,
  clock: FaClock,
  headset: FaHeadset,
}

export default function FeatureBoxes({ kutucuklar }) {
  // Varsayılan kutucuklar (DB'den gelmezse)
  const defaultBoxes = [
    { icon: 'award', baslik: '%100 Garanti Veriyoruz', aciklama: 'Şehir içi ya da şehirler arası taşıdığımız her yük için %100 garanti veriyoruz.', link: '/hakkimizda' },
    { icon: 'shield', baslik: '%100 Sigortalı Taşıyoruz', aciklama: 'Eşyalarınızın boyutu ve değeri ne olursa olsun, teslim aldığımız andan itibaren sigorta güvencesi altında.', link: '/hizmetler' },
    { icon: 'money', baslik: 'En Uygun Fiyat Bizde', aciklama: 'Hem kaliteli hem de uygun fiyatlı taşımacılık hizmetini yalnızca bizimle yaşayabilirsiniz.', link: '/teklif-al' },
  ]

  const boxes = kutucuklar && kutucuklar.length > 0 ? kutucuklar : defaultBoxes

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {boxes.map((box, index) => {
            const IconComponent = iconMap[box.icon] || FaAward
            return (
              <div 
                key={index}
                className="group text-center p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#046ffb' }}>
                  <IconComponent className="text-3xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4 transition-colors" style={{ color: '#1e3a5f' }}>
                  {box.baslik}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {box.aciklama}
                </p>

                {/* CTA Button */}
                <a 
                  href={box.link || '/hizmetler'}
                  className="inline-flex items-center gap-2 font-semibold transition-all group-hover:gap-3"
                  style={{ color: '#046ffb' }}
                >
                  Devamı
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
