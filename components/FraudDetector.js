'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaExclamationTriangle, FaPhone, FaShieldAlt } from 'react-icons/fa'

export default function FraudDetector() {
  const [isBlocked, setIsBlocked] = useState(false)
  const [visitorInfo, setVisitorInfo] = useState(null)
  const supabase = createClient()
  
  // Bot tespit değişkenleri
  const mouseMovedRef = useRef(false)
  const scrolledRef = useRef(false)
  const clickCountRef = useRef(0)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    // Mouse hareketi dinle
    const handleMouseMove = () => { mouseMovedRef.current = true }
    const handleScroll = () => { scrolledRef.current = true }
    const handleClick = () => { clickCountRef.current++ }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('click', handleClick)
    
    // Fraud kontrolü başlat
    checkFraud()
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const checkFraud = async () => {
    try {
      const fingerprint = await generateFingerprint()
      const currentIP = await getIPAddress()
      const ipInfo = await getIPInfo(currentIP)
      const now = Date.now()
      
      // Daha önce engellenmiş mi kontrol et
      const blockKey = `blocked_${fingerprint}`
      const blockExpiry = localStorage.getItem(blockKey)
      
      if (blockExpiry && parseInt(blockExpiry) > now) {
        setVisitorInfo({
          fingerprint,
          ip: currentIP,
          location: ipInfo
        })
        setIsBlocked(true)
        return
      }
      
      // Geçmiş verileri al
      const historyKey = `fraud_history_${fingerprint}`
      const historyStr = localStorage.getItem(historyKey)
      let history = historyStr ? JSON.parse(historyStr) : []
      
      // 1 saatten eski kayıtları temizle
      const oneHourAgo = now - (60 * 60 * 1000)
      history = history.filter(h => h.time > oneHourAgo)
      
      // Şu anki girişi ekle
      history.push({
        ip: currentIP,
        time: now,
        page: window.location.pathname,
        country: ipInfo?.ulke,
        isVPN: ipInfo?.isVPN,
        isDatacenter: ipInfo?.isDatacenter
      })
      
      localStorage.setItem(historyKey, JSON.stringify(history))
      
      // 5 saniye sonra bot kontrolü yap
      setTimeout(() => {
        checkBotBehavior(fingerprint, currentIP, ipInfo, history)
      }, 5000)
      
    } catch (error) {
      console.error('Fraud detection error:', error)
    }
  }

  const checkBotBehavior = async (fingerprint, ip, ipInfo, history) => {
    const now = Date.now()
    const timeOnPage = (now - startTimeRef.current) / 1000 // saniye
    
    let suspicionScore = 0
    let reasons = []
    
    // 1. Bot Davranış Kontrolü
    if (!mouseMovedRef.current && timeOnPage > 3) {
      suspicionScore += 30
      reasons.push('Mouse hareketi yok')
    }
    
    if (!scrolledRef.current && timeOnPage > 5) {
      suspicionScore += 20
      reasons.push('Scroll yapılmadı')
    }
    
    // 2. Yurt Dışı Kontrolü (Türkiye dışı)
    if (ipInfo?.ulke && !['Turkey', 'Türkiye', 'TR'].includes(ipInfo.ulke)) {
      suspicionScore += 40
      reasons.push(`Yurt dışı: ${ipInfo.ulke}`)
    }
    
    // 3. Datacenter IP Kontrolü
    if (ipInfo?.isDatacenter) {
      suspicionScore += 50
      reasons.push('Datacenter IP')
    }
    
    // 4. VPN/Proxy Kontrolü
    if (ipInfo?.isVPN) {
      suspicionScore += 30
      reasons.push('VPN/Proxy tespit edildi')
    }
    
    // 5. Çoklu IP Kontrolü (uçak modu)
    const recentEntries = history.filter(h => h.time > now - (10 * 60 * 1000))
    const uniqueIPs = [...new Set(recentEntries.map(h => h.ip))]
    
    if (uniqueIPs.length >= 3) {
      suspicionScore += 40
      reasons.push(`${uniqueIPs.length} farklı IP (10dk)`)
    }
    
    // 6. Çok kısa süre kontrolü
    if (timeOnPage < 3 && history.length > 1) {
      suspicionScore += 25
      reasons.push('Çok kısa ziyaret')
    }
    
    // 7. Headless browser kontrolü
    if (isHeadlessBrowser()) {
      suspicionScore += 60
      reasons.push('Headless browser')
    }
    
    // ENGELLEME KARARI (skor 70+)
    if (suspicionScore >= 70) {
      // 24 saat engelle
      const blockKey = `blocked_${fingerprint}`
      localStorage.setItem(blockKey, (now + 24 * 60 * 60 * 1000).toString())
      
      // Veritabanına kaydet
      try {
        await supabase.from('sahte_tiklamalar').insert({
          fingerprint,
          ip_listesi: uniqueIPs,
          toplam_giris: history.length,
          farkli_ip_sayisi: uniqueIPs.length,
          ortalama_sure_sn: Math.round(timeOnPage),
          il: ipInfo?.il,
          ilce: ipInfo?.ilce,
          engellendi: true,
          engel_tarihi: new Date().toISOString(),
          notlar: reasons.join(', ')
        })
      } catch (e) {
        console.log('DB kayıt hatası (tablo olmayabilir)')
      }
      
      setVisitorInfo({
        fingerprint,
        ip,
        location: ipInfo,
        reasons
      })
      setIsBlocked(true)
    }
  }

  // Headless browser kontrolü
  const isHeadlessBrowser = () => {
    // WebDriver kontrolü
    if (navigator.webdriver) return true
    
    // Phantom JS
    if (window._phantom || window.callPhantom) return true
    
    // Nightmare
    if (window.__nightmare) return true
    
    // Selenium
    if (document.__selenium_unwrapped || document.__webdriver_evaluate) return true
    
    // Chrome headless
    if (/HeadlessChrome/.test(navigator.userAgent)) return true
    
    // Plugins kontrolü (headless'ta genelde 0)
    if (navigator.plugins.length === 0 && !/mobile/i.test(navigator.userAgent)) return true
    
    // Languages kontrolü
    if (!navigator.languages || navigator.languages.length === 0) return true
    
    return false
  }

  // Fingerprint oluştur
  const generateFingerprint = async () => {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '',
      navigator.deviceMemory?.toString() || ''
    ]
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('FraudCheck', 2, 2)
      components.push(canvas.toDataURL().slice(-50))
    } catch (e) {}
    
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
      return 'unknown'
    }
  }

  // IP bilgileri al (ülke, datacenter, VPN kontrolü)
  const getIPInfo = async (ip) => {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await res.json()
      
      // Datacenter ISP'leri
      const datacenterISPs = [
        'amazon', 'aws', 'google', 'microsoft', 'azure', 'digitalocean',
        'ovh', 'hetzner', 'linode', 'vultr', 'cloudflare', 'oracle',
        'alibaba', 'tencent', 'scaleway', 'upcloud', 'contabo'
      ]
      
      const ispLower = (data.org || '').toLowerCase()
      const isDatacenter = datacenterISPs.some(dc => ispLower.includes(dc))
      
      return {
        il: data.region || data.city,
        ilce: data.city,
        ulke: data.country_name,
        isp: data.org,
        isDatacenter,
        isVPN: isDatacenter || data.org?.toLowerCase().includes('vpn')
      }
    } catch {
      return null
    }
  }

  // Engellenmediyse hiçbir şey gösterme
  if (!isBlocked) return null

  // Türkiye saati
  const turkiyeSaati = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  // KORKUTMA EKRANI
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-red-600 text-4xl" />
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          ⚠️ ERİŞİMİNİZ ENGELLENDİ
        </h1>
        
        <p className="text-gray-700 mb-6">
          Sistemimiz tarafından <strong>şüpheli aktivite</strong> tespit edilmiştir.
        </p>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left text-sm">
          <div className="flex items-center gap-2 mb-2">
            <FaShieldAlt className="text-red-500" />
            <span className="font-bold text-gray-700">Kayıtlı Bilgiler:</span>
          </div>
          <div className="space-y-1 text-gray-600 ml-6">
            <p>📍 Konum: <strong>{visitorInfo?.location?.ulke} / {visitorInfo?.location?.il}</strong></p>
            <p>🌐 IP Adresi: <strong>{visitorInfo?.ip}</strong></p>
            <p>🔖 Cihaz ID: <strong>{visitorInfo?.fingerprint}</strong></p>
            <p>📅 Tarih: <strong>{turkiyeSaati}</strong></p>
            {visitorInfo?.location?.isp && (
              <p>🏢 ISP: <strong>{visitorInfo.location.isp}</strong></p>
            )}
          </div>
          
          {visitorInfo?.reasons?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-red-600 font-medium">🚨 Tespit Edilen Sorunlar:</p>
              <ul className="list-disc ml-6 text-red-600 mt-1">
                {visitorInfo.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">
            <strong>⚖️ Yasal Uyarı:</strong> Tüm erişim bilgileriniz kayıt altına alınmıştır. 
            Sahte tıklama ve kötü niyetli aktiviteler <strong>5651 sayılı kanun</strong> kapsamında 
            değerlendirilerek gerekli yasal işlemler başlatılabilir.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <p className="text-gray-500 text-sm mb-3">
            Bu engellenmenin hatalı olduğunu düşünüyorsanız:
          </p>
          <a 
            href="tel:05057805551" 
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
          >
            <FaPhone /> 0505 780 55 51
          </a>
        </div>
      </div>
    </div>
  )
}
