'use client'

import { useState, useEffect, useRef } from 'react'
import { FaTruck, FaBuilding, FaCalendarAlt, FaUsers } from 'react-icons/fa'

function useCountUp(end, duration = 2000, startCounting) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!startCounting) return
    
    let startTime = null
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration, startCounting])
  
  return count
}

export default function CounterSection({ ayarlar }) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || '0'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const stats = [
    { icon: FaTruck, value: parseInt(getAyar('arac_sayisi')) || 3, label: 'Araç Sayısı', suffix: '' },
    { icon: FaBuilding, value: parseInt(getAyar('asansor_sayisi')) || 1, label: 'Mobil Asansör', suffix: '' },
    { icon: FaCalendarAlt, value: parseInt(getAyar('tecrube_yili')) || 17, label: 'Tecrübe Yılı', suffix: '' },
    { icon: FaUsers, value: parseInt(getAyar('mutlu_musteri')) || 7800, label: 'Mutlu Müşteri', suffix: '+' },
  ]

  return (
    <section 
      ref={sectionRef} 
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #046ffb 0%, #1e3a5f 100%)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Rakamlarla Biz</h2>
          <p className="text-white/80 text-lg">Yılların tecrübesi ve binlerce mutlu müşteri</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const count = useCountUp(stat.value, 2000, isVisible)
            return (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#d4ed31' }}>
                  <stat.icon className="text-3xl" style={{ color: '#1e3a5f' }} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {count.toLocaleString('tr-TR')}{stat.suffix}
                </div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
