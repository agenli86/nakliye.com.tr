'use client'
import { useEffect, useRef } from 'react'

export default function VisitorTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    // Sadece client-side'da ve bir kez çalışsın
    if (tracked.current || typeof window === 'undefined') return
    tracked.current = true
    
    console.log('🔵 ZİYARETÇİ TAKİP BAŞLADI!')
    trackVisitor()
  }, [])

  const trackVisitor = async () => {
    try {
      console.log('🟡 Tracking fonksiyonu çalıştı')
      
      // URL parametrelerini direkt window.location'dan al
      const urlParams = new URLSearchParams(window.location.search)
      const utmSource = urlParams.get('utm_source')
      const utmMedium = urlParams.get('utm_medium')
      const utmCampaign = urlParams.get('utm_campaign')
      const gclid = urlParams.get('gclid')
      const fbclid = urlParams.get('fbclid')
      
      const referrer = document.referrer || ''
      
      console.log('🟡 URL Parametreleri:', { utmSource, gclid, fbclid, referrer })
      
      // KAYNAK BELİRLE
      let source = 'direk'
      
      if (gclid ||
          utmSource?.toLowerCase().includes('google') ||
          utmSource?.toLowerCase().includes('ads') ||
          utmMedium?.toLowerCase() === 'cpc' ||
          referrer.includes('google.com/aclk') ||
          referrer.includes('googleadservices')) {
        source = 'ads'
      }
      else if (fbclid ||
               utmSource?.toLowerCase().includes('facebook') ||
               utmSource?.toLowerCase().includes('fb') ||
               utmMedium?.toLowerCase().includes('social') ||
               referrer.includes('facebook.com') ||
               referrer.includes('fb.com')) {
        source = 'face'
      }
      else if (referrer.includes('instagram.com') || utmSource?.toLowerCase().includes('instagram')) {
        source = 'instagram'
      }
      else if (referrer.includes('twitter.com') ||
               referrer.includes('x.com') ||
               utmSource?.toLowerCase().includes('twitter')) {
        source = 'twitter'
      }
      else if (referrer.includes('google.com') && !gclid) {
        source = 'google_organik'
      }
      else if (referrer.includes('yandex') ||
               referrer.includes('bing') ||
               referrer.includes('yahoo')) {
        source = 'arama_motoru'
      }
      else if (referrer && !referrer.includes(window.location.hostname)) {
        source = 'referans'
      }

      console.log('🟢 Belirlenen kaynak:', source)

      // KONUM İZNİ AL
      let location = null
      if (navigator.geolocation) {
        try {
          console.log('🟡 Konum izni isteniyor...')
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000,
              enableHighAccuracy: true
            })
          })
          
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          console.log('✅ Konum alındı:', location)
        } catch (geoError) {
          console.log('⚠️ Konum izni verilmedi:', geoError.message)
        }
      }

      // API'ye gönder
      const payload = {
        source,
        medium: utmMedium || 'none',
        campaign: utmCampaign || null,
        referrer,
        gclid: gclid || null,
        fbclid: fbclid || null,
        page: window.location.pathname,
        fullUrl: window.location.href,
        userAgent: navigator.userAgent,
        location: location
      }

      console.log('🔵 API\'ye gönderiliyor:', payload)

      const response = await fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('🔵 API Response Status:', response.status)

      if (!response.ok) {
        console.error('❌ Visitor tracking failed:', response.statusText)
      } else {
        const data = await response.json()
        console.log('✅ ZİYARETÇİ KAYDEDİLDİ:', data)
      }
    } catch (error) {
      console.error('❌ Visitor tracking error:', error)
    }
  }

  return null
}
