'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import { 
  FaUsers, FaEnvelope, FaNewspaper, FaConciergeBell, FaImages, FaEye,
  FaMobile, FaDesktop, FaMapMarkerAlt, FaBullhorn, FaLink, FaClock,
  FaChrome, FaSafari, FaFirefox, FaEdge, FaGlobe, FaArrowRight
} from 'react-icons/fa'

export default function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [todayVisitors, setTodayVisitors] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [
      { count: hizmetCount },
      { count: makaleCount },
      { count: mesajCount },
      { count: galeriCount },
      { data: todayVisitorData },
      { data: messages }
    ] = await Promise.all([
      supabase.from('hizmetler').select('*', { count: 'exact', head: true }),
      supabase.from('makaleler').select('*', { count: 'exact', head: true }),
      supabase.from('iletisim_mesajlari').select('*', { count: 'exact', head: true }).eq('okundu', false),
      supabase.from('galeri').select('*', { count: 'exact', head: true }),
      supabase.from('ziyaretciler').select('*').gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false }).limit(50),
      supabase.from('iletisim_mesajlari').select('*').order('created_at', { ascending: false }).limit(5)
    ])

    // Ziyaretçi istatistikleri
    const visitors = todayVisitorData || []
    const visitorStats = {
      total: visitors.length,
      unique: new Set(visitors.map(v => v.fingerprint)).size,
      mobile: visitors.filter(v => v.cihaz_turu === 'mobile').length,
      desktop: visitors.filter(v => v.cihaz_turu === 'desktop').length,
      fromAds: visitors.filter(v => v.utm_source).length,
      withLocation: visitors.filter(v => v.konum_izni).length,
    }

    setStats({
      hizmetler: hizmetCount || 0,
      makaleler: makaleCount || 0,
      mesajlar: mesajCount || 0,
      galeri: galeriCount || 0,
      visitors: visitorStats
    })
    setTodayVisitors(visitors.slice(0, 10))
    setRecentMessages(messages || [])
    setLoading(false)
  }

  const getBrowserIcon = (browser) => {
    if (!browser) return FaGlobe
    if (browser.includes('Chrome')) return FaChrome
    if (browser.includes('Safari')) return FaSafari
    if (browser.includes('Firefox')) return FaFirefox
    if (browser.includes('Edge')) return FaEdge
    return FaGlobe
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Bugünün Ziyaretçi İstatistikleri */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaUsers className="text-blue-600" /> Bugünkü Ziyaretçiler
          </h2>
          <Link href="/admin/ziyaretciler" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            Tümünü Gör <FaArrowRight />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="admin-card text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-3xl font-bold">{stats.visitors?.total || 0}</p>
            <p className="text-sm opacity-90">Toplam Ziyaret</p>
          </div>
          <div className="admin-card text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-3xl font-bold">{stats.visitors?.unique || 0}</p>
            <p className="text-sm opacity-90">Tekil Ziyaretçi</p>
          </div>
          <div className="admin-card text-center bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-3xl font-bold">{stats.visitors?.mobile || 0}</p>
            <p className="text-sm opacity-90">Mobil</p>
          </div>
          <div className="admin-card text-center bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <p className="text-3xl font-bold">{stats.visitors?.desktop || 0}</p>
            <p className="text-sm opacity-90">Masaüstü</p>
          </div>
          <div className="admin-card text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <p className="text-3xl font-bold">{stats.visitors?.fromAds || 0}</p>
            <p className="text-sm opacity-90">Reklamdan</p>
          </div>
          <div className="admin-card text-center bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <p className="text-3xl font-bold">{stats.visitors?.withLocation || 0}</p>
            <p className="text-sm opacity-90">Konum İzinli</p>
          </div>
        </div>
      </div>

      {/* İçerik İstatistikleri */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/hizmetler" className="admin-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaConciergeBell className="text-xl text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.hizmetler}</p>
              <p className="text-sm text-gray-500">Hizmet</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/makaleler" className="admin-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FaNewspaper className="text-xl text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.makaleler}</p>
              <p className="text-sm text-gray-500">Makale</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/mesajlar" className="admin-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FaEnvelope className="text-xl text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.mesajlar}</p>
              <p className="text-sm text-gray-500">Okunmamış Mesaj</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/galeri" className="admin-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaImages className="text-xl text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.galeri}</p>
              <p className="text-sm text-gray-500">Galeri</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Son Ziyaretçiler */}
        <div className="admin-card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FaEye className="text-blue-600" /> Son Ziyaretçiler
          </h3>
          <div className="space-y-3">
            {todayVisitors.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Bugün henüz ziyaretçi yok</p>
            ) : (
              todayVisitors.map((v, i) => {
                const BrowserIcon = getBrowserIcon(v.tarayici)
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.cihaz_turu === 'mobile' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {v.cihaz_turu === 'mobile' ? <FaMobile /> : <FaDesktop />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {v.cihaz_markasi || v.cihaz_turu}
                          {v.il && <span className="text-gray-400 ml-2">• {v.il}</span>}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <BrowserIcon className="text-xs" /> {v.tarayici || 'Bilinmiyor'}
                          {v.utm_source && (
                            <span className="px-1 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px]">
                              {v.utm_source}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FaClock /> {formatTime(v.created_at)}
                      </p>
                      {v.konum_izni && (
                        <FaMapMarkerAlt className="text-green-500 text-xs mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Son Mesajlar */}
        <div className="admin-card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FaEnvelope className="text-red-600" /> Son Mesajlar
          </h3>
          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Henüz mesaj yok</p>
            ) : (
              recentMessages.map((m) => (
                <Link key={m.id} href="/admin/mesajlar" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{m.ad_soyad}</p>
                      <p className="text-xs text-gray-400">{m.telefon}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${m.okundu ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                      {m.okundu ? 'Okundu' : 'Yeni'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.mesaj}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
