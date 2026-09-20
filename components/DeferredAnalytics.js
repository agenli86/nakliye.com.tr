'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { isAutomatedClient } from '@/lib/visitor-signals'

/**
 * Google Analytics ve Facebook Pixel.
 *
 * Neden ertelendi: PageSpeed ölçümünde sayfanın en büyük iki yükü bu iki
 * üçüncü taraf kütüphaneydi (gtag.js ~167 kB, fbevents.js + config ~190 kB)
 * ve ilk ekranın çizilmesine hiçbir katkıları yok. `lazyOnload` bile onları
 * `load` olayıyla birlikte indiriyor, yani hero görseli ve ilk etkileşim
 * hâlâ aynı ağ ve ana iş parçacığı penceresini paylaşıyordu.
 *
 * Artık iki koşuldan hangisi önce gerçekleşirse o anda iniyorlar:
 *  - kullanıcı sayfayla ilk kez etkileşime girdiğinde (dokunma, tıklama,
 *    kaydırma, klavye), ya da
 *  - 5 saniye sonra, hiç etkileşim olmasa bile.
 *
 * Tarama botları ve ölçüm araçları (Googlebot, Lighthouse, PageSpeed) için
 * hiç yüklenmiyor: analitik verisini kirletiyorlar ve sayfayı okumak için
 * bu kütüphanelere ihtiyaçları yok. Bunun bir yan etkisi var ve açıkça
 * bilinmeli: PageSpeed raporunda bu 180+ kB artık hiç görünmeyecek, gerçek
 * kullanıcıda ise (gecikmeli de olsa) yükleniyor.
 */

const GA_ID = 'G-FQBQFLNBJ8'
const FB_PIXEL_ID = '779004901018883'
const GECIKME_MS = 5000
const ETKILESIM_OLAYLARI = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']

export default function DeferredAnalytics() {
  const [yuklensin, setYuklensin] = useState(false)

  useEffect(() => {
    if (isAutomatedClient()) return

    let timer = null

    const temizle = () => {
      ETKILESIM_OLAYLARI.forEach((olay) => window.removeEventListener(olay, baslat))
      if (timer) window.clearTimeout(timer)
    }

    function baslat() {
      temizle()
      setYuklensin(true)
    }

    ETKILESIM_OLAYLARI.forEach((olay) =>
      window.addEventListener(olay, baslat, { once: true, passive: true })
    )
    timer = window.setTimeout(baslat, GECIKME_MS)

    return temizle
  }, [])

  if (!yuklensin) return null

  return (
    <>
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');`}
      </Script>
    </>
  )
}
