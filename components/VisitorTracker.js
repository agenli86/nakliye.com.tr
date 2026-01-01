'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function VisitorTracker() {
  const tracked = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    trackVisitor()
    
    // Tıklama takibini başlat
    const timer = setTimeout(trackClicks, 2000)
    return () => clearTimeout(timer)
  }, [])

  const trackClicks = () => {
    // Telefon ve WhatsApp takibi
    const selectors = [
      { sel: 'a[href^="tel:"]', field: 'telefon_tiklama' },
      { sel: 'a[href*="wa.me"], a[href*="whatsapp"]', field: 'whatsapp_tiklama' }
    ]

    selectors.forEach(({ sel, field }) => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.dataset.tracked) {
          el.dataset.tracked = 'true'
          el.addEventListener('click', async () => {
            const fp = localStorage.getItem('visitor_fingerprint')
            if (fp) {
              await supabase.from('ziyaretciler')
                .update({ [field]: true, donusum_zamani: new Date().toISOString() })
                .eq('fingerprint', fp).order('created_at', { ascending: false }).limit(1)
            }
          })
        }
      })
    })
  }

  const trackVisitor = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const gclid = urlParams.get('gclid') || urlParams.get('gad_source')
      
      // Parmak izi ve IP al (IP gelmezse de devam et)
      const fp = await generateFingerprint()
      localStorage.setItem('visitor_fingerprint', fp)
      
      let ip = null
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipRes.json()
        ip = ipData.ip
      } catch (e) { console.log("IP servisi meşgul") }

      const visitorData = {
        fingerprint: fp,
        ip_adresi: ip,
        reklam_trafigi: !!gclid,
        gclid: gclid ? gclid.substring(0, 100) : null,
        utm_source: gclid ? 'Google Ads' : (urlParams.get('utm_source') || 'Direkt'),
        giris_sayfasi: window.location.pathname,
        referrer: document.referrer || 'Direkt',
        cihaz_turu: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        isletim_sistemi: navigator.platform,
        tarayici: navigator.userAgent.includes("Chrome") ? "Chrome" : "Diğer",
        created_at: new Date().toISOString()
      }

      // HER GİRİŞTE YENİ KAYIT AÇ (Update değil Insert)
      await supabase.from('ziyaretciler').insert([visitorData])

      // Konum izni iste (Araya kaynatma)
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          await supabase.from('ziyaretciler')
            .update({
              konum_izni: true,
              enlem: pos.coords.latitude,
              boylam: pos.coords.longitude,
              konum_tipi: 'GPS'
            }).eq('fingerprint', fp).order('created_at', { ascending: false }).limit(1)
        }, null, { enableHighAccuracy: true })
      }, 3000)

    } catch (error) { console.error('Hata:', error) }
  }

  const generateFingerprint = async () => {
    return 'fp_' + Math.random().toString(36).substring(2, 15)
  }

  return null
}
