'use client'

import { useEffect, useState } from 'react'

/**
 * Duyuru şeridi.
 *
 * Metin sunucudan geliyor ve yerini baştan kaplıyor: sonradan eklenmiş
 * olsaydı altındaki bölümleri aşağı iter, düzen kayması (CLS) olurdu.
 * Kayan animasyon ise sayfa tamamen yüklenene kadar başlamıyor; böylece
 * ilk boyama ve LCP sırasında tarayıcı sürekli yeni kare çizmiyor.
 *
 * Şeridin yerleşim kuralları neden globals.css'te: `<style jsx>` bloğu
 * tarayıcıya ancak hydrate sırasında ulaşıyordu. O ana kadar şeridin üç
 * metin kopyası `display: flex` olmadan alt alta diziliyor, şerit üç satır
 * yüksekliğinde çiziliyor, stil gelince tek satıra düşüyordu. Bu 56
 * piksellik daralma altındaki bütün bölümleri yukarı çekiyor ve tek
 * başına 0,20 CLS üretiyordu. Kurallar artık ilk boyamadan önce yüklenen
 * gerçek CSS dosyasında.
 */
export default function AnnouncementBar({ duyurular }) {
  const [animasyon, setAnimasyon] = useState(false)

  useEffect(() => {
    if (document.readyState === 'complete') {
      setAnimasyon(true)
      return
    }
    const baslat = () => setAnimasyon(true)
    window.addEventListener('load', baslat, { once: true })
    return () => window.removeEventListener('load', baslat)
  }, [])

  if (!duyurular || duyurular.length === 0) return null

  const text = duyurular.map(d => d.metin).join('   •   ')
  
  return (
    <div className="overflow-hidden py-3" style={{ backgroundColor: '#d4ed31' }}>
      <div className="announcement-wrapper">
        <div className={`announcement-content${animasyon ? ' animasyonlu' : ''}`}>
          {[1, 2, 3].map((_, idx) => (
            <span key={idx} className="inline-block whitespace-nowrap px-8">
              {duyurular.map((d, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="font-semibold" style={{ color: '#1e3a5f' }}>
                    {d.icon && <span className="mr-2">{d.icon}</span>}
                    {d.metin}
                  </span>
                  {i < duyurular.length - 1 && (
                    <span className="mx-6 text-xl" style={{ color: '#1e3a5f' }}>•</span>
                  )}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
