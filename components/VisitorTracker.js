'use client'

import { useEffect, useRef } from 'react'
import {
  getFingerprint,
  getGpuInfo,
  getIpInfo,
  isAutomatedClient,
  prefersReducedData,
  runWhenIdle,
} from '@/lib/visitor-signals'

/**
 * Ziyaretçi kaydı.
 *
 * Sayfa yüklenip ana iş parçacığı boşaldıktan sonra tek seferlik çalışır.
 * Tarama botlarında ve veri tasarrufu açık cihazlarda hiç çalışmaz.
 */
export default function VisitorTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    if (isAutomatedClient() || prefersReducedData()) return
    tracked.current = true

    return runWhenIdle(() => {
      trackVisitor().catch(() => {})
    })
  }, [])

  return null
}

async function trackVisitor() {
  // Supabase istemcisi (~52 kB) modül düzeyinde içe aktarıldığında her
  // sayfanın ilk JavaScript paketine giriyor ve anasayfada %95'i hiç
  // çalıştırılmıyordu. Artık yalnızca kayıt gerçekten yapılacağı anda,
  // sayfa yüklenip ana iş parçacığı boşaldıktan sonra indiriliyor.
  const { createClient } = await import('@/lib/supabase-browser')
  const supabase = createClient()
  const data = await collectVisitorData()
  await saveVisitorData(supabase, data)
}

async function collectVisitorData() {
  const ua = navigator.userAgent
  const [fingerprint, ipInfo] = await Promise.all([getFingerprint(), getIpInfo()])

  return {
    fingerprint,
    ip_adresi: ipInfo?.ip || null,

    // Cihaz bilgileri
    ...parseUserAgent(ua),

    // Ekran
    ekran_genislik: window.screen.width,
    ekran_yukseklik: window.screen.height,
    ekran_pixel_ratio: window.devicePixelRatio,

    // Donanım
    cpu_core: navigator.hardwareConcurrency || null,
    ram_gb: navigator.deviceMemory || null,
    ...getGpuInfo(),

    // Kaynak
    referrer: document.referrer || null,
    giris_sayfasi: window.location.pathname,
    ...getUTMParams(),

    // Ek bilgiler
    dil: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    baglanti_turu: getConnectionType(),

    // Konum: yalnızca IP üzerinden.
    // Tarayıcı konum izni (getCurrentPosition) kaldırıldı — her ziyaretçiye
    // izin penceresi açıyor ve enableHighAccuracy ile 10 saniyeye kadar
    // bekliyordu. IP tabanlı konum aynı raporlama için yeterli.
    konum_izni: false,
    il: ipInfo?.il || null,
    ilce: ipInfo?.ilce || null,
    ulke: ipInfo?.ulke || null,
    enlem: null,
    boylam: null,
  }
}

function parseUserAgent(ua) {
  const result = {
    cihaz_turu: 'desktop',
    cihaz_markasi: null,
    cihaz_modeli: null,
    isletim_sistemi: null,
    isletim_versiyonu: null,
    tarayici: null,
    tarayici_versiyonu: null,
  }

  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    result.cihaz_turu = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile'
  }

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

  if (/Windows NT 10/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '10/11' }
  else if (/Windows NT 6.3/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '8.1' }
  else if (/Windows NT 6.2/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '8' }
  else if (/Windows NT 6.1/i.test(ua)) { result.isletim_sistemi = 'Windows'; result.isletim_versiyonu = '7' }
  else if (/Mac OS X ([0-9._]+)/i.test(ua)) { result.isletim_sistemi = 'macOS'; result.isletim_versiyonu = ua.match(/Mac OS X ([0-9._]+)/i)?.[1] }
  else if (/Android ([0-9.]+)/i.test(ua)) { result.isletim_sistemi = 'Android'; result.isletim_versiyonu = ua.match(/Android ([0-9.]+)/i)?.[1] }
  else if (/iPhone OS ([0-9_]+)/i.test(ua)) { result.isletim_sistemi = 'iOS'; result.isletim_versiyonu = ua.match(/iPhone OS ([0-9_]+)/i)?.[1]?.replace(/_/g, '.') }
  else if (/Linux/i.test(ua)) { result.isletim_sistemi = 'Linux' }

  if (/Edg\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Edge'; result.tarayici_versiyonu = ua.match(/Edg\/([0-9.]+)/i)?.[1] }
  else if (/Chrome\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Chrome'; result.tarayici_versiyonu = ua.match(/Chrome\/([0-9.]+)/i)?.[1] }
  else if (/Firefox\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Firefox'; result.tarayici_versiyonu = ua.match(/Firefox\/([0-9.]+)/i)?.[1] }
  else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) { result.tarayici = 'Safari'; result.tarayici_versiyonu = ua.match(/Version\/([0-9.]+)/i)?.[1] }
  else if (/Opera|OPR\/([0-9.]+)/i.test(ua)) { result.tarayici = 'Opera'; result.tarayici_versiyonu = ua.match(/OPR\/([0-9.]+)/i)?.[1] }

  return result
}

function getUTMParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  }
}

function getConnectionType() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  return conn ? (conn.effectiveType || conn.type || null) : null
}

async function saveVisitorData(supabase, data) {
  // Son 24 saatte aynı cihazdan kayıt var mı?
  const { data: existing } = await supabase
    .from('ziyaretciler')
    .select('id, sayfa_goruntulenme')
    .eq('fingerprint', data.fingerprint)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle()

  if (existing) {
    await supabase
      .from('ziyaretciler')
      .update({
        sayfa_goruntulenme: existing.sayfa_goruntulenme + 1,
        son_giris: new Date().toISOString(),
        son_sayfa: window.location.pathname,
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('ziyaretciler').insert([data])
  }
}
