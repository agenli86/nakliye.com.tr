'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VisitorTracker() {
  const tracked = useRef(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    trackVisitor()
  }, [searchParams])

  const trackVisitor = async () => {
    try {
      // URL parametrelerini al
      const utmSource = searchParams?.get('utm_source')
      const utmMedium = searchParams?.get('utm_medium')
      const utmCampaign = searchParams?.get('utm_campaign')
      const gclid = searchParams?.get('gclid') // Google Ads tracking
      const fbclid = searchParams?.get('fbclid') // Facebook tracking
      
      // Referrer kontrol
      const referrer = typeof document !== 'undefined' ? document.referrer : ''
      
      // KAYNAK BELİRLE
      let source = 'direk'
      
      // Google Ads kontrolü
      if (gclid ||
          utmSource?.toLowerCase().includes('google') ||
          utmSource?.toLowerCase().includes('ads') ||
          utmMedium?.toLowerCase() === 'cpc' ||
          referrer.includes('google.com/aclk') ||
          referrer.includes('googleadservices')) {
        source = 'ads'
      }
      // Facebook kontrolü
      else if (fbclid ||
               utmSource?.toLowerCase().includes('facebook') ||
               utmSource?.toLowerCase().includes('fb') ||
               utmMedium?.toLowerCase().includes('social') ||
               referrer.includes('facebook.com') ||
               referrer.includes('fb.com')) {
        source = 'face'
      }
      // Instagram
      else if (referrer.includes('instagram.com') || utmSource?.toLowerCase().includes('instagram')) {
        source = 'instagram'
      }
      // Twitter/X
      else if (referrer.includes('twitter.com') ||
               referrer.includes('x.com') ||
               utmSource?.toLowerCase().includes('twitter')) {
        source = 'twitter'
      }
      // Organik Google arama (reklam değil)
      else if (referrer.includes('google.com') && !gclid) {
        source = 'google_organik'
      }
      // Diğer arama motorları
      else if (referrer.includes('yandex') ||
               referrer.includes('bing') ||
               referrer.includes('yahoo')) {
        source = 'arama_motoru'
      }
      // Referans (başka siteden)
      else if (referrer && !referrer.includes(window.location.hostname)) {
        source = 'referans'
      }

      // KONUM İZNİ AL - YENİ!
      let location = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000, // 5 dakika cache
              enableHighAccuracy: true
            })
          })
          
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        } catch (geoError) {
          console.log('Konum izni verilmedi:', geoError.message)
        }
      }

      // API'ye gönder
      const response = await fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          medium: utmMedium || 'none',
          campaign: utmCampaign || null,
          referrer,
          gclid: gclid || null,
          fbclid: fbclid || null,
          page: window.location.pathname,
          fullUrl: window.location.href,
          userAgent: navigator.userAgent,
          location: location // Konum bilgisi eklendi
        })
      })

      if (!response.ok) {
        console.error('Visitor tracking failed:', response.statusText)
      }
    } catch (error) {
      console.error('Visitor tracking error:', error)
    }
  }

  return null
}
