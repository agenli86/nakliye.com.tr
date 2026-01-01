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
  }, [])

  const trackVisitor = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      // Google Ads parametrelerini kontrol et
      const gclid = urlParams.get('gclid') || urlParams.get('gad_source') || urlParams.get('gbraid')
      
      const ua = navigator.userAgent
      const fp = await generateFingerprint()
      localStorage.setItem('last_fp', fp) // Tıklama takibi için sakla

      const data = {
        fingerprint: fp,
        ip_adresi: await getIPAddress(),
        ...parseUserAgent(ua),
        ekran_genislik: window.screen.width,
        ekran_yukseklik: window.screen.height,
        referrer: document.referrer || 'Direkt',
        giris_sayfasi: window.location.pathname,
        // REKLAM TAKİBİ BURADA
        reklam_trafigi: !!gclid, 
        gclid: gclid,
        utm_source: gclid ? 'Google Ads' : urlParams.get('utm_source'),
        utm_medium: gclid ? 'cpc' : urlParams.get('utm_medium'),
        dil: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        konum_izni: false
      }

      // 1. KAYDI OLUŞTUR
      const { data: insertedData, error } = await supabase.from('ziyaretciler').insert([data]).select().single()

      // 2. TELEFON VE WHATSAPP TIKLAMA TAKİBİNİ BAŞLAT
      setupClickTracking(fp)

      // 3. KONUM İSTE (5 Saniye Sonra)
      setTimeout(async () => {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          
          await supabase.from('ziyaretciler').update({
            konum_izni: true,
            enlem: pos.coords.latitude,
            boylam: pos.coords.longitude,
            il: address?.il,
            ilce: address?.ilce
          }).eq('id', insertedData.id)
        } catch (e) { /* İzin yok */ }
      }, 5000)

    } catch (error) { console.error('Hata:', error) }
  }

  const setupClickTracking = (fp) => {
    const handleAction = async (type) => {
      await supabase.from('ziyaretciler')
        .update({ [type]: true, donusum_zamani: new Date().toISOString() })
        .eq('fingerprint', fp).order('created_at', { ascending: false }).limit(1)
    }

    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a')
      if (!link) return
      if (link.href.startsWith('tel:')) handleAction('telefon_tiklama')
      if (link.href.includes('wa.me') || link.href.includes('whatsapp')) handleAction('whatsapp_tiklama')
    })
  }

  // YARDIMCI FONKSİYONLAR (IP, Fingerprint, UA)
  const getIPAddress = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const d = await res.json()
      return d.ip
    } catch { return null }
  }

  const generateFingerprint = async () => {
    return 'fp_' + Math.random().toString(36).substring(2, 15)
  }

  const parseUserAgent = (ua) => {
    return {
      cihaz_turu: /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop',
      isletim_sistemi: ua.includes('Windows') ? 'Windows' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'Diğer',
      tarayici: ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Diğer'
    }
  }

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=tr`)
      const d = await res.json()
      return { il: d.address?.province || d.address?.city, ilce: d.address?.town || d.address?.district }
    } catch { return null }
  }

  return null
}
