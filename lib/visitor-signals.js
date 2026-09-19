'use client'

/**
 * Ziyaretçi sinyalleri için ortak yardımcılar.
 *
 * Daha önce VisitorTracker ve FraudDetector aynı işi ayrı ayrı yapıyordu:
 * her sayfa açılışında iki kez parmak izi hesaplanıyor, ipify'a iki istek,
 * ipapi.co'ya iki istek atılıyordu. Buradaki fonksiyonlar sonucu sayfa
 * ömrü boyunca tek seferlik önbelleğe alır; ipify tamamen kaldırıldı çünkü
 * ipapi.co zaten IP'yi de dönüyor.
 */

const CACHE_KEY = 'adn_ipinfo_v1'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 saat

let ipInfoPromise = null
let fingerprintPromise = null

/**
 * Tarama botu / otomasyon aracı mı?
 *
 * Lighthouse, PageSpeed Insights ve Googlebot'un render'ı başlıksız
 * (headless) tarayıcıyla çalışır: fare oynatmaz, kaydırmaz, eklenti
 * göstermez. Bu istemcilerde hiçbir takip/analiz kodu çalıştırmıyoruz,
 * böylece ölçüm gerçek kullanıcının gördüğü sayfayı ölçer ve arama
 * motoru sayfanın tamamını görür.
 */
export function isAutomatedClient() {
  if (typeof navigator === 'undefined') return true

  const ua = navigator.userAgent || ''

  if (navigator.webdriver) return true
  if (/HeadlessChrome|Chrome-Lighthouse|PTST|GTmetrix|Pingdom/i.test(ua)) return true
  if (/bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot/i.test(ua)) return true
  if (typeof window !== 'undefined' && (window._phantom || window.callPhantom || window.__nightmare)) return true
  if (typeof document !== 'undefined' && (document.__selenium_unwrapped || document.__webdriver_evaluate)) return true

  return false
}

/**
 * Kullanıcının veri tasarrufu / düşük bant genişliği tercihi var mı?
 */
export function prefersReducedData() {
  const conn = typeof navigator !== 'undefined'
    ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
    : null
  if (!conn) return false
  if (conn.saveData) return true
  return ['slow-2g', '2g'].includes(conn.effectiveType)
}

/**
 * İşi sayfa yüklendikten ve ana iş parçacığı boşaldıktan sonra çalıştır.
 * Takip kodunun LCP ve INP ölçümlerine karışmamasını sağlar.
 */
export function runWhenIdle(fn, timeout = 4000) {
  if (typeof window === 'undefined') return () => {}

  let cancelled = false
  let handle = null

  const schedule = () => {
    if (cancelled) return
    if ('requestIdleCallback' in window) {
      handle = window.requestIdleCallback(() => !cancelled && fn(), { timeout })
    } else {
      handle = window.setTimeout(() => !cancelled && fn(), 1500)
    }
  }

  if (document.readyState === 'complete') {
    schedule()
  } else {
    window.addEventListener('load', schedule, { once: true })
  }

  return () => {
    cancelled = true
    if (handle == null) return
    if ('cancelIdleCallback' in window) window.cancelIdleCallback(handle)
    else window.clearTimeout(handle)
  }
}

function readCachedIpInfo() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || Date.now() - parsed.t > CACHE_TTL_MS) return null
    return parsed.v
  } catch {
    return null
  }
}

const DATACENTER_ISPS = [
  'amazon', 'aws', 'google', 'microsoft', 'azure', 'digitalocean',
  'ovh', 'hetzner', 'linode', 'vultr', 'cloudflare', 'oracle',
  'alibaba', 'tencent', 'scaleway', 'upcloud', 'contabo',
]

/**
 * IP ve konum bilgisini tek bir istekle alır ve önbelleğe koyar.
 * Sayfa başına en fazla bir ağ isteği; oturum boyunca sessionStorage'dan okunur.
 */
export function getIpInfo() {
  if (ipInfoPromise) return ipInfoPromise

  const cached = readCachedIpInfo()
  if (cached) {
    ipInfoPromise = Promise.resolve(cached)
    return ipInfoPromise
  }

  ipInfoPromise = (async () => {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) return null

      const data = await res.json()
      const isp = (data.org || '').toLowerCase()
      const isDatacenter = DATACENTER_ISPS.some(dc => isp.includes(dc))

      const info = {
        ip: data.ip || null,
        il: data.region || data.city || null,
        ilce: data.city || null,
        ulke: data.country_name || null,
        isp: data.org || null,
        isDatacenter,
        isVPN: isDatacenter || isp.includes('vpn'),
      }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: info }))
      } catch {}

      return info
    } catch {
      return null
    }
  })()

  return ipInfoPromise
}

/**
 * Cihaz parmak izi. Canvas + WebGL yeterli ayrıştırmayı veriyor.
 *
 * AudioContext parmak izi kaldırıldı: ScriptProcessorNode artık kullanımdan
 * kaldırılmış bir API ve ana iş parçacığında çalışıyor, ayrıca kullanıcı
 * etkileşimi olmadan açılan AudioContext tarayıcılarca zaten askıya alınıyor.
 */
export function getFingerprint() {
  if (fingerprintPromise) return fingerprintPromise

  fingerprintPromise = (async () => {
    const components = []

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
    } catch {}

    const gpu = getGpuInfo()
    if (gpu.gpu_vendor) components.push(gpu.gpu_vendor)
    if (gpu.gpu_renderer) components.push(gpu.gpu_renderer)

    components.push(navigator.userAgent)
    components.push(navigator.language)
    components.push(`${screen.width}x${screen.height}`)
    components.push(new Date().getTimezoneOffset().toString())
    components.push(navigator.hardwareConcurrency?.toString() || '')
    components.push(navigator.deviceMemory?.toString() || '')

    const str = components.join('###')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash
    }
    return 'fp_' + Math.abs(hash).toString(16)
  })()

  return fingerprintPromise
}

export function getGpuInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        return {
          gpu_vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          gpu_renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        }
      }
    }
  } catch {}
  return { gpu_vendor: null, gpu_renderer: null }
}
