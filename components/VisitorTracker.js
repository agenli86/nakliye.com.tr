'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function VisitorTracker() {
  const tracked = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    
    const runTracker = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const gclid = urlParams.get('gclid') || urlParams.get('gad_source')
        
        // Rastgele bir ID oluştur (Supabase'e boş gitmesin)
        const fp = 'fp_' + Math.random().toString(36).substring(2, 11)
        localStorage.setItem('visitor_fingerprint', fp)

        // Veri paketini hemen hazırla
        const visitorData = {
          fingerprint: fp,
          ip_adresi: 'Yükleniyor...', // İlk etapta boş gitmesin
          reklam_trafigi: !!gclid,
          gclid: gclid ? gclid.substring(0, 50) : null,
          utm_source: gclid ? 'Google Ads' : (urlParams.get('utm_source') || 'Direkt'),
          giris_sayfasi: window.location.pathname,
          referrer: document.referrer || 'Direkt',
          cihaz_turu: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          created_at: new Date().toISOString()
        }

        // 1. KAYDI HEMEN AÇ (HİÇ BEKLEME)
        const { data, error } = await supabase.from('ziyaretciler').insert([visitorData]).select()
        console.log("Kayıt denemesi:", data, error)

        // 2. IP ADRESİNİ ARKA PLANDA AL VE GÜNCELLE
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(async (ipData) => {
             await supabase.from('ziyaretciler').update({ ip_adresi: ipData.ip }).eq('fingerprint', fp)
          }).catch(e => console.log("IP alınamadı"))

      } catch (err) { console.error("Sistem hatası:", err) }
    }

    runTracker()
  }, [])

  return null
}
