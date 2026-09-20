'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCookieBite, FaTimes } from 'react-icons/fa'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Daha önce kabul edilmiş mi kontrol et
    let consent = null
    try { consent = localStorage.getItem('cookie_consent') } catch {}
    if (consent) return

    // Kutu, sayfa tamamen yüklendikten 3 saniye sonra açılıyor. Eskiden
    // sabit 2 saniyelik zamanlayıcıyla açılıyordu; bu, LCP henüz
    // ölçülürken ekranın altına yeni bir katman çiziyordu.
    let timer = null
    const planla = () => { timer = window.setTimeout(() => setShowBanner(true), 3000) }

    if (document.readyState === 'complete') planla()
    else window.addEventListener('load', planla, { once: true })

    return () => {
      window.removeEventListener('load', planla)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined')
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* İkon ve Metin */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaCookieBite className="text-amber-500 text-xl" />
              <h3 className="font-bold text-gray-800">Çerez Kullanımı</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Size daha iyi hizmet sunabilmek için çerezler ve benzeri teknolojiler kullanıyoruz. 
              Ziyaretçi bilgilerini (cihaz, konum, tarayıcı) anonim olarak topluyoruz. 
              Detaylar için{' '}
              <Link href="/gizlilik-politikasi" className="text-blue-600 hover:underline font-medium">
                Gizlilik Politikası
              </Link>{' '}
              ve{' '}
              <Link href="/kvkk" className="text-blue-600 hover:underline font-medium">
                KVKK Aydınlatma Metni
              </Link>
              'ni inceleyebilirsiniz.
            </p>
          </div>
          
          {/* Butonlar */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={declineCookies}
              className="px-4 py-3 min-h-[44px] text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Reddet
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-3 min-h-[44px] bg-blue-700 text-white rounded-lg font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Kabul Et
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
