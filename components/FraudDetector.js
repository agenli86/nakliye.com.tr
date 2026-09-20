'use client'

import { useEffect, useRef, useState } from 'react'
import { FaExclamationTriangle, FaPhone, FaShieldAlt } from 'react-icons/fa'
import { getFingerprint, getIpInfo, isAutomatedClient, runWhenIdle } from '@/lib/visitor-signals'

/**
 * Sahte tıklama tespiti.
 *
 * Önemli davranış değişiklikleri:
 *  - Tarama botlarında ve ölçüm araçlarında (Googlebot, Lighthouse,
 *    PageSpeed Insights) hiç çalışmaz. Eskiden "fare oynatmadı + kaydırma
 *    yapmadı + eklenti yok" kuralları bu istemcilerde 70 puanı geçtiği için
 *    Google'a ve PageSpeed'e siyah engelleme ekranı gösteriliyordu.
 *  - navigator.plugins kontrolü kaldırıldı: modern tarayıcılarda eklenti
 *    listesi zaten boş/sahte, gerçek kullanıcıyı yanlışlıkla engelliyordu.
 *  - Engelleme kararı yalnızca kullanıcı davranışı dışındaki somut
 *    sinyallere (datacenter IP, VPN, 10 dakikada 3+ farklı IP) dayanıyor.
 *  - IP ve parmak izi sorguları VisitorTracker ile paylaşılıyor, sayfa
 *    başına 4 dış istek yerine 1 istek yapılıyor.
 */

const BLOCK_THRESHOLD = 90
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000

export default function FraudDetector() {
  const [blockedInfo, setBlockedInfo] = useState(null)

  const mouseMovedRef = useRef(false)
  const scrolledRef = useRef(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    if (isAutomatedClient()) return

    const handleMouseMove = () => { mouseMovedRef.current = true }
    const handleScroll = () => { scrolledRef.current = true }

    window.addEventListener('mousemove', handleMouseMove, { passive: true, once: true })
    window.addEventListener('scroll', handleScroll, { passive: true, once: true })

    let botTimer = null
    const cancelIdle = runWhenIdle(() => {
      checkFraud({ mouseMovedRef, scrolledRef, startTimeRef, setBlockedInfo, setBotTimer: t => { botTimer = t } })
        .catch(() => {})
    })

    return () => {
      cancelIdle()
      if (botTimer) clearTimeout(botTimer)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (!blockedInfo) return null

  return <BlockedScreen info={blockedInfo} />
}

async function checkFraud({ mouseMovedRef, scrolledRef, startTimeRef, setBlockedInfo, setBotTimer }) {
  const [fingerprint, ipInfo] = await Promise.all([getFingerprint(), getIpInfo()])
  const now = Date.now()

  // Daha önce engellenmiş mi?
  const blockKey = `blocked_${fingerprint}`
  const blockExpiry = safeGet(blockKey)
  if (blockExpiry && parseInt(blockExpiry, 10) > now) {
    setBlockedInfo({ fingerprint, ip: ipInfo?.ip, location: ipInfo })
    return
  }

  // Geçmiş girişler (son 1 saat)
  const historyKey = `fraud_history_${fingerprint}`
  let history = []
  try { history = JSON.parse(safeGet(historyKey) || '[]') } catch {}
  history = history.filter(h => h.time > now - 60 * 60 * 1000)
  history.push({ ip: ipInfo?.ip, time: now, page: window.location.pathname })
  safeSet(historyKey, JSON.stringify(history))

  // Davranış sinyalleri için biraz bekle
  const timer = setTimeout(() => {
    evaluate({ fingerprint, ipInfo, history, mouseMovedRef, scrolledRef, startTimeRef, setBlockedInfo })
      .catch(() => {})
  }, 8000)
  setBotTimer(timer)
}

async function evaluate({ fingerprint, ipInfo, history, mouseMovedRef, scrolledRef, startTimeRef, setBlockedInfo }) {
  const now = Date.now()
  const timeOnPage = (now - startTimeRef.current) / 1000

  let score = 0
  const reasons = []

  // Somut sinyaller — tek başına belirleyici olabilenler
  if (ipInfo?.isDatacenter) {
    score += 60
    reasons.push('Datacenter IP')
  }
  if (ipInfo?.isVPN && !ipInfo?.isDatacenter) {
    score += 40
    reasons.push('VPN/Proxy tespit edildi')
  }

  if (ipInfo?.ulke && !['Turkey', 'Türkiye', 'TR'].includes(ipInfo.ulke)) {
    score += 30
    reasons.push(`Yurt dışı: ${ipInfo.ulke}`)
  }

  const recentEntries = history.filter(h => h.time > now - 10 * 60 * 1000)
  const uniqueIPs = [...new Set(recentEntries.map(h => h.ip).filter(Boolean))]
  if (uniqueIPs.length >= 3) {
    score += 50
    reasons.push(`${uniqueIPs.length} farklı IP (10dk)`)
  }

  // Davranış sinyalleri — tek başına yeterli değil, yalnızca destekleyici.
  // Bu yüzden toplamları eşiğin (90) altında kalacak şekilde ağırlıklandırıldı.
  if (!mouseMovedRef.current && !scrolledRef.current && timeOnPage > 8) {
    score += 25
    reasons.push('Hiç etkileşim yok')
  }
  if (timeOnPage < 3 && history.length > 1) {
    score += 20
    reasons.push('Çok kısa ziyaret')
  }

  if (score < BLOCK_THRESHOLD) return

  safeSet(`blocked_${fingerprint}`, (now + BLOCK_DURATION_MS).toString())

  try {
    // Bu noktaya yalnızca eşiği aşan ziyaretlerde geliniyor; Supabase
    // istemcisi de ancak o zaman indiriliyor.
    const { createClient } = await import('@/lib/supabase-browser')
    const supabase = createClient()
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
      notlar: reasons.join(', '),
    })
  } catch {}

  setBlockedInfo({ fingerprint, ip: ipInfo?.ip, location: ipInfo, reasons })
}

function safeGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}

function BlockedScreen({ info }) {
  const turkiyeSaati = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

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
            <p>📍 Konum: <strong>{info?.location?.ulke} / {info?.location?.il}</strong></p>
            <p>🌐 IP Adresi: <strong>{info?.ip}</strong></p>
            <p>🔖 Cihaz ID: <strong>{info?.fingerprint}</strong></p>
            <p>📅 Tarih: <strong>{turkiyeSaati}</strong></p>
            {info?.location?.isp && (
              <p>🏢 ISP: <strong>{info.location.isp}</strong></p>
            )}
          </div>

          {info?.reasons?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-red-600 font-medium">🚨 Tespit Edilen Sorunlar:</p>
              <ul className="list-disc ml-6 text-red-600 mt-1">
                {info.reasons.map((r, i) => <li key={i}>{r}</li>)}
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
