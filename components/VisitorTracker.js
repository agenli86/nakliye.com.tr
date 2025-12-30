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
      // Önce IP adresini al
      const ipAddress = await getIPAddress()

      // Engelli IP kontrolü yap
      if (ipAddress) {
        const { data: blockedIP } = await supabase
          .from('engelli_ipler')
          .select('id')
          .eq('ip_adresi', ipAddress)
          .single()

        // Eğer IP engelliyse, tracking yapma
        if (blockedIP) {
          console.log('IP engelli, ziyaretçi kaydedilmiyor:', ipAddress)
          return
        }
      }

      // IP engelli değilse, normal devam et
      const data = await collectVisitorData()
      await saveVisitorData(data)
    } catch (error) {
      console.error('Visitor tracking error:', error)
    }
  }

  const collectVisitorData = async () => {
    const ua = navigator.userAgent
    const data = {
      fingerprint: await generateFingerprint(),
      ip_adresi: await getIPAddress(),
      
      // Cihaz bilgileri
      ...parseUserAgent(ua),
      
      // Ekran
      ekran_genislik: window.screen.width,
      ekran_yukseklik: window.screen.height,
      ekran_pixel_ratio: window.devicePixelRatio,
      
      // Donanım
      cpu_core: navigator.hardwareConcurrency || null,
      ram_gb: navigator.deviceMemory || null,
      ...await getGPUInfo(),
      
      // Kaynak
      referrer: document.referrer || null,
      giris_sayfasi: window.location.pathname,
      ...getUTMParams(),
      
      // Ek bilgiler
      dil: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      baglanti_turu: getConnectionType(),
      ...await getBatteryInfo(),
      
      // Konum (izin istenecek)
      konum_izni: false,
      il: null,
      ilce: null,
      enlem: null,
      boylam: null,
    }

    // Konum izni iste (5 saniye gecikmeyle)
    setTimeout(async () => {
      try {
        const locationData = await requestLocation()
        if (locationData) {
          const addressData = await reverseGeocode(locationData.latitude, locationData.longitude)
          // Veritabanını güncelle
          await supabase
            .from('ziyaretciler')
            .update({
              konum_izni: true,
              enlem: locationData.latitude,
              boylam: locationData.longitude,
              il: addressData?.il || null,
              ilce: addressData?.ilce || null,
              ulke: addressData?.ulke || null
            })
            .eq('fingerprint', data.fingerprint)
        }
      } catch (e) {
        // Konum izni verilmedi
      }
    }, 5000)

    // IP'den konum (fallback)
    if (!data.il) {
      const ipLocation = await getIPLocation(data.ip_adresi)
      if (ipLocation) {
        data.il = ipLocation.il
        data.ilce = ipLocation.ilce
        data.ulke = ipLocation.ulke
      }
    }

    return data
  }

  // Fingerprint oluştur
  const generateFingerprint = async () => {
    const components = []
    
    // Canvas fingerprint
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Adana Nakliye', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Fingerprint', 4, 17)
      components.push(canvas.toDataURL())
    } catch (e) {}

    // WebGL fingerprint
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
          components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        }
      }
    } catch (e) {}


    // Diğer bilgiler
    components.push(navigator.userAgent)
    components.push(navigator.language)
    components.push(screen.width + 'x' + screen.height)
    components.push(new Date().getTimezoneOffset().toString())
    components.push(navigator.hardwareConcurrency?.toString() || '')
    components.push(navigator.deviceMemory?.toString() || '')

    // Hash oluştur
    const str = components.join('###')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return 'fp_' + Math.abs(hash).toString(16)
  }

  // IP adresi al
  const getIPAddress = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        return data.ip
      } catch {
        return null
      }
    }
  }

  // IP'den konum
  const getIPLocation = async (ip) => {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await res.json()
      return {
        il: data.region || data.city,
        ilce: data.city,
        ulke: data.country_name
      }
    } catch {
      return null
    }
  }

  // User Agent parse
  const parseUserAgent = (ua) => {
    const result = {
      cihaz_turu: 'desktop',
      cihaz_markasi: null,
      cihaz_modeli: null,
      isletim_sistemi: null,
      isletim_versiyonu: null,
      tarayici: null,
      tarayici_versiyonu: null,
    }

    // Cihaz türü
    if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      result.cihaz_turu = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile'
    }

    // Marka ve Model
    const brands = [
      { regex: /Samsung[^;)]*/, brand: 'Samsung' },
      { regex: /SM-[A-Z0-9]+/, brand: 'Samsung' },
      { regex: /iPhone/, brand: 'Apple' },
      { regex: /iPad/, brand: 'Apple' },
      { regex: /Xiaomi|Redmi|POCO|Mi \d/i, brand: 'Xiaomi' },
      { regex: /HUAWEI|Honor/i, brand: 'Huawei' },
      { regex: /OPPO/i, brand: 'Oppo' },
      { regex: /vivo/i, brand: 'Vivo' },
      { regex: /OnePlus/i, brand: 'OnePlus' },
      { regex: /Nokia/i, brand: 'Nokia' },
      { regex: /LG[- ]/i, brand: 'LG' },
      { regex: /Sony/i, brand: 'Sony' },
      { regex: /Pixel/i, brand: 'Google' },
      { regex: /Motorola|moto/i, brand: 'Motorola' },
      { regex: /Realme/i, brand: 'Realme' },
      { regex: /ASUS/i, brand: 'Asus' },
      { regex: /Lenovo/i, brand: 'Lenovo' },
    ]

    for (const b of brands) {
      if (b.regex.test(ua)) {
        result.cihaz_markasi = b.brand
        const modelMatch = ua.match(b.regex)
        if (modelMatch) result.cihaz_modeli = modelMatch[0]
        break
      }
    }

    // İşletim sistemi
    if (/Windows NT 10/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '10/11' }
    else if (/Windows NT 6.3/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '8.1' }
    else if (/Windows NT 6.2/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '8' }
    else if (/Windows NT 6.1/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '7' }
    else if (/Mac OS X ([0-9._]+)/i.test(ua)) { result.isletim_sistemi = 'macOS'; result.isletim_versiyonu = ua.match(/Mac OS X ([0-9._]+)/i)?.[1] }
    else if (/Android ([0-9.]+)/i.test(ua)) { result.isletim_sistemi = 'Android'; result.isletim_versiyonu = ua.match(/Android ([0-9.]+)/i)?.[1] }
    else if (/iPhone OS ([0-9_]+)/i.test(ua)) { result.isletim_sistemi = 'iOS'; result.isletim_versiyonu = ua.match(/iPhone OS ([0-9_]+)/i)?.[1]?.replace(/_/g, '.') }
    else if (/Linux/i.test(ua)) { result.isletim_sistemi = 'Linux' }

    // Tarayıcı
    if (/Edg\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Edge'; result.tarayici_versiyonu = ua.match(/Edg\/([0-9.]+)/i)?.[1] }
    else if (/Chrome\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Chrome'; result.tarayici_versiyonu = ua.match(/Chrome\/([0-9.]+)/i)?.[1] }
    else if (/Firefox\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Firefox'; result.tarayici_versiyonu = ua.match(/Firefox\/([0-9.]+)/i)?.[1] }
    else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) { result.tarayici = 'Safari'; result.tarayici_versiyonu = ua.match(/Version\/([0-9.]+)/i)?.[1] }
    else if (/Opera|OPR\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Opera'; result.tarayici_versiyonu = ua.match(/OPR\/([0-9.]+)/i)?.[1] }

    return result
  }

  // GPU bilgisi
  const getGPUInfo = async () => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          return {
            gpu_vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            gpu_renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          }
        }
      }
    } catch (e) {}
    return { gpu_vendor: null, gpu_renderer: null }
  }

  // UTM parametreleri
  const getUTMParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
    }
  }

  // Bağlantı türü
  const getConnectionType = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (conn) {
      return conn.effectiveType || conn.type || null
    }
    return null
  }

  // Pil bilgisi
  const getBatteryInfo = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery()
        return {
          pil_seviyesi: Math.round(battery.level * 100),
          sarjda_mi: battery.charging
        }
      }
    } catch (e) {}
    return { pil_seviyesi: null, sarjda_mi: null }
  }

  // Konum izni iste
  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  // Reverse geocoding
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=tr`)
      const data = await res.json()
      return {
        il: data.address?.province || data.address?.state || data.address?.city,
        ilce: data.address?.town || data.address?.county || data.address?.district,
        ulke: data.address?.country
      }
    } catch {
      return null
    }
  }

  // Veritabanına kaydet
  const saveVisitorData = async (data) => {
    // Önce fingerprint ile mevcut kayıt var mı kontrol et
    const { data: existing } = await supabase
      .from('ziyaretciler')
      .select('id, sayfa_goruntulenme')
      .eq('fingerprint', data.fingerprint)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Son 24 saat
      .single()

    if (existing) {
      // Mevcut kaydı güncelle
      await supabase
        .from('ziyaretciler')
        .update({
          sayfa_goruntulenme: existing.sayfa_goruntulenme + 1,
          son_giris: new Date().toISOString(),
          son_sayfa: window.location.pathname,
          // Konum izni yeni verildiyse güncelle
          ...(data.konum_izni && {
            konum_izni: true,
            il: data.il,
            ilce: data.ilce,
            enlem: data.enlem,
            boylam: data.boylam
          })
        })
        .eq('id', existing.id)
    } else {
      // Yeni kayıt
      await supabase.from('ziyaretciler').insert([data])
    }
  }

  return null // Görünür component yok
}
