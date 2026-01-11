'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import dynamic from 'next/dynamic'
import { 
  FaUsers, FaMobile, FaDesktop, FaTablet, FaMapMarkerAlt, FaGlobe, 
  FaClock, FaChrome, FaSafari, FaFirefox, FaEdge, FaEye, FaSync,
  FaAndroid, FaApple, FaWindows, FaLinux, FaSearch, FaFilter,
  FaBullhorn, FaLink, FaUserSecret, FaTrash
} from 'react-icons/fa'

// VisitorMap'i client-side only yükle
const VisitorMap = dynamic(() => import('@/components/VisitorMap'), { ssr: false })

export default function AdminZiyaretcilerPage() {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [filter])

  const fetchData = async () => {
    setLoading(true)
    
    let query = supabase.from('ziyaretciler').select('*').order('created_at', { ascending: false })
    
    // Filtre uygula
    const now = new Date()
    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      query = query.gte('created_at', startOfDay.toISOString())
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      query = query.gte('created_at', weekAgo.toISOString())
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      query = query.gte('created_at', monthAgo.toISOString())
    }

    const { data } = await query.limit(500)
    setVisitors(data || [])
    calculateStats(data || [])
    setLoading(false)
  }

  // TÜM ZİYARETLERİ SİL - YENİ FONKSİYON!
  const deleteAllVisitors = async () => {
    const confirmText = 'TÜM ZİYARETLERİ SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!\n\nDevam etmek için "SIFIRLA" yazın:'
    
    const userInput = prompt(confirmText)
    
    if (userInput !== 'SIFIRLA') {
      alert('İşlem iptal edildi.')
      return
    }
    
    setLoading(true)
    
    try {
      // Tüm kayıtları sil
      const { error } = await supabase
        .from('ziyaretciler')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      if (error) {
        alert('Hata: ' + error.message)
      } else {
        alert('Tüm ziyaretler silindi!')
        setVisitors([])
        setStats({})
      }
    } catch (error) {
      alert('Hata: ' + error.message)
    }
    
    setLoading(false)
  }

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      unique: new Set(data.map(v => v.fingerprint)).size,
      mobile: data.filter(v => v.cihaz_turu === 'mobile').length,
      desktop: data.filter(v => v.cihaz_turu === 'desktop').length,
      tablet: data.filter(v => v.cihaz_turu === 'tablet').length,
      withLocation: data.filter(v => v.konum_izni).length,
      fromAds: data.filter(v => v.utm_source).length,
      direct: data.filter(v => !v.referrer && !v.utm_source).length,
      mobileOperator: data.filter(v => v.mobil_operator).length, // YENİ!
      
      // İl bazlı
      cities: {},
      // Marka bazlı
      brands: {},
      // Tarayıcı bazlı
      browsers: {},
      // OS bazlı
      os: {},
      // Kaynak bazlı
      sources: {},
      // Operatör bazlı - YENİ!
      operators: {},
    }

    data.forEach(v => {
      if (v.il) stats.cities[v.il] = (stats.cities[v.il] || 0) + 1
      if (v.cihaz_markasi) stats.brands[v.cihaz_markasi] = (stats.brands[v.cihaz_markasi] || 0) + 1
      if (v.tarayici) stats.browsers[v.tarayici] = (stats.browsers[v.tarayici] || 0) + 1
      if (v.isletim_sistemi) stats.os[v.isletim_sistemi] = (stats.os[v.isletim_sistemi] || 0) + 1
      if (v.mobil_operator) stats.operators[v.mobil_operator] = (stats.operators[v.mobil_operator] || 0) + 1 // YENİ!
      
      const source = v.utm_source || (v.referrer ? 'Referrer' : 'Direkt')
      stats.sources[source] = (stats.sources[source] || 0) + 1
    })

    setStats(stats)
  }

  const getBrowserIcon = (browser) => {
    if (!browser) return FaGlobe
    if (browser.includes('Chrome')) return FaChrome
    if (browser.includes('Safari')) return FaSafari
    if (browser.includes('Firefox')) return FaFirefox
    if (browser.includes('Edge')) return FaEdge
    return FaGlobe
  }

  const getOSIcon = (os) => {
    if (!os) return FaDesktop
    if (os.includes('Android')) return FaAndroid
    if (os.includes('iOS') || os.includes('macOS')) return FaApple
    if (os.includes('Windows')) return FaWindows
    if (os.includes('Linux')) return FaLinux
    return FaDesktop
  }

  const getDeviceIcon = (type) => {
    if (type === 'mobile') return FaMobile
    if (type === 'tablet') return FaTablet
    return FaDesktop
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filteredVisitors = visitors.filter(v => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      v.ip_adresi?.toLowerCase().includes(searchLower) ||
      v.il?.toLowerCase().includes(searchLower) ||
      v.cihaz_markasi?.toLowerCase().includes(searchLower) ||
      v.fingerprint?.toLowerCase().includes(searchLower) ||
      v.mobil_operator?.toLowerCase().includes(searchLower) // YENİ!
    )
  })

  const topItems = (obj, limit = 5) => {
    return Object.entries(obj || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ziyaretçi Analizi</h1>
          <p className="text-gray-500 text-sm mt-1">Detaylı ziyaretçi takibi ve analiz</p>
        </div>
        <div className="flex items-center gap-3">
          {/* TÜM ZİYARETLERİ SİL BUTONU - YENİ! */}
          <button 
            onClick={deleteAllVisitors} 
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold flex items-center gap-2"
          >
            <FaTrash /> Tüm Ziyaretleri Sil
          </button>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="admin-input py-2"
          >
            <option value="today">Bugün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
            <option value="all">Tümü</option>
          </select>
          <button onClick={fetchData} className="admin-btn-secondary p-2">
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="admin-card text-center">
          <FaUsers className="text-3xl text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.total || 0}</p>
          <p className="text-sm text-gray-500">Toplam Ziyaret</p>
        </div>
        <div className="admin-card text-center">
          <FaUserSecret className="text-3xl text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.unique || 0}</p>
          <p className="text-sm text-gray-500">Tekil Ziyaretçi</p>
        </div>
        <div className="admin-card text-center">
          <FaMobile className="text-3xl text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.mobile || 0}</p>
          <p className="text-sm text-gray-500">Mobil</p>
        </div>
        <div className="admin-card text-center">
          <FaDesktop className="text-3xl text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.desktop || 0}</p>
          <p className="text-sm text-gray-500">Masaüstü</p>
        </div>
        {/* MOBİL OPERATÖR KARTI - YENİ! */}
        <div className="admin-card text-center">
          <FaMobile className="text-3xl text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.mobileOperator || 0}</p>
          <p className="text-sm text-gray-500">Operatör Tespit</p>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* İller */}
        <div className="admin-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" /> İllere Göre
          </h3>
          <div className="space-y-2">
            {topItems(stats.cities).map(([city, count]) => (
              <div key={city} className="flex justify-between items-center">
                <span className="text-sm">{city}</span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(stats.cities || {}).length === 0 && (
              <p className="text-sm text-gray-400">Veri yok</p>
            )}
          </div>
        </div>

        {/* Markalar */}
        <div className="admin-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaMobile className="text-blue-500" /> Cihaz Markaları
          </h3>
          <div className="space-y-2">
            {topItems(stats.brands).map(([brand, count]) => (
              <div key={brand} className="flex justify-between items-center">
                <span className="text-sm">{brand}</span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(stats.brands || {}).length === 0 && (
              <p className="text-sm text-gray-400">Veri yok</p>
            )}
          </div>
        </div>

        {/* Tarayıcılar */}
        <div className="admin-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaGlobe className="text-green-500" /> Tarayıcılar
          </h3>
          <div className="space-y-2">
            {topItems(stats.browsers).map(([browser, count]) => (
              <div key={browser} className="flex justify-between items-center">
                <span className="text-sm">{browser}</span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MOBİL OPERATÖRLER - YENİ KART! */}
        <div className="admin-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaMobile className="text-yellow-500" /> Mobil Operatörler
          </h3>
          <div className="space-y-2">
            {topItems(stats.operators).map(([operator, count]) => (
              <div key={operator} className="flex justify-between items-center">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  operator === 'Türkcell' ? 'bg-yellow-100 text-yellow-800' :
                  operator === 'Vodafone' ? 'bg-red-100 text-red-800' :
                  operator === 'Turk Telekom' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {operator}
                </span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(stats.operators || {}).length === 0 && (
              <p className="text-sm text-gray-400">Veri yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="IP, İl, Marka, Operatör veya Fingerprint ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
      </div>

      {/* Ziyaretçi Listesi */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Zaman</th>
              <th className="text-left py-3 px-2">IP</th>
              <th className="text-left py-3 px-2">Operatör</th> {/* YENİ KOLON! */}
              <th className="text-left py-3 px-2">Konum</th>
              <th className="text-left py-3 px-2">Cihaz</th>
              <th className="text-left py-3 px-2">Tarayıcı</th>
              <th className="text-left py-3 px-2">Kaynak</th>
              <th className="text-left py-3 px-2">Sayfa</th>
              <th className="text-center py-3 px-2">Detay</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map((v) => {
              const DeviceIcon = getDeviceIcon(v.cihaz_turu)
              const BrowserIcon = getBrowserIcon(v.tarayici)
              const OSIcon = getOSIcon(v.isletim_sistemi)
              
              return (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-gray-400 text-xs" />
                      <span>{formatDate(v.created_at)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <code className="text-xs bg-gray-100 px-1 rounded">{v.ip_adresi || '-'}</code>
                  </td>
                  {/* MOBİL OPERATÖR KOLONU - YENİ! */}
                  <td className="py-3 px-2">
                    {v.mobil_operator ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        v.mobil_operator === 'Türkcell' ? 'bg-yellow-100 text-yellow-800' :
                        v.mobil_operator === 'Vodafone' ? 'bg-red-100 text-red-800' :
                        v.mobil_operator === 'Turk Telekom' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {v.mobil_operator}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      {v.konum_izni ? (
                        <FaMapMarkerAlt className="text-green-500 text-xs" />
                      ) : (
                        <FaMapMarkerAlt className="text-gray-300 text-xs" />
                      )}
                      <span>{v.il || '-'}</span>
                      {v.ilce && <span className="text-gray-400">/ {v.ilce}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="text-gray-500" />
                      <div>
                        <p className="font-medium">{v.cihaz_markasi || v.cihaz_turu}</p>
                        <p className="text-xs text-gray-400">{v.cihaz_modeli || v.isletim_sistemi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <BrowserIcon className="text-gray-500" />
                      <span>{v.tarayici || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {v.utm_source ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        {v.utm_source}
                      </span>
                    ) : v.referrer ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Referrer
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        Direkt
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 max-w-[150px] truncate">
                    {v.giris_sayfasi || '/'}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => setSelectedVisitor(v)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredVisitors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {loading ? 'Yükleniyor...' : 'Ziyaretçi bulunamadı'}
          </div>
        )}
      </div>

      {/* Detay Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVisitor(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Ziyaretçi Detayı</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedVisitor.created_at)}</p>
              </div>
              <button onClick={() => setSelectedVisitor(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Kimlik */}
              <div>
                <h3 className="font-bold mb-3 text-blue-600">🔑 Kimlik</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Fingerprint:</span> <code className="bg-gray-100 px-1 rounded">{selectedVisitor.fingerprint}</code></p>
                  <p><span className="text-gray-500">IP:</span> {selectedVisitor.ip_adresi}</p>
                  {/* MOBİL OPERATÖR - YENİ! */}
                  {selectedVisitor.mobil_operator && (
                    <p>
                      <span className="text-gray-500">Operatör:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedVisitor.mobil_operator === 'Türkcell' ? 'bg-yellow-100 text-yellow-800' :
                        selectedVisitor.mobil_operator === 'Vodafone' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedVisitor.mobil_operator}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Konum */}
              <div>
                <h3 className="font-bold mb-3 text-green-600">📍 Konum</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">İzin:</span> {selectedVisitor.konum_izni ? '✅ Verildi' : '❌ Verilmedi'}</p>
                  <p><span className="text-gray-500">Ülke:</span> {selectedVisitor.ulke || '-'}</p>
                  <p><span className="text-gray-500">İl:</span> {selectedVisitor.il || '-'}</p>
                  <p><span className="text-gray-500">İlçe:</span> {selectedVisitor.ilce || '-'}</p>
                  {selectedVisitor.enlem && (
                    <p><span className="text-gray-500">Koordinat:</span> {selectedVisitor.enlem}, {selectedVisitor.boylam}</p>
                  )}
                </div>
                {/* Mini Harita */}
                {selectedVisitor.enlem && selectedVisitor.boylam && (
                  <VisitorMap 
                    lat={selectedVisitor.enlem} 
                    lng={selectedVisitor.boylam}
                    il={selectedVisitor.il}
                    ilce={selectedVisitor.ilce}
                    className="mt-3 h-40 rounded-lg overflow-hidden"
                  />
                )}
              </div>

              {/* Cihaz */}
              <div>
                <h3 className="font-bold mb-3 text-purple-600">📱 Cihaz</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Tür:</span> {selectedVisitor.cihaz_turu}</p>
                  <p><span className="text-gray-500">Marka:</span> {selectedVisitor.cihaz_markasi || '-'}</p>
                  <p><span className="text-gray-500">Model:</span> {selectedVisitor.cihaz_modeli || '-'}</p>
                  <p><span className="text-gray-500">OS:</span> {selectedVisitor.isletim_sistemi} {selectedVisitor.isletim_versiyonu}</p>
                  <p><span className="text-gray-500">Tarayıcı:</span> {selectedVisitor.tarayici} {selectedVisitor.tarayici_versiyonu}</p>
                </div>
              </div>

              {/* Donanım */}
              <div>
                <h3 className="font-bold mb-3 text-orange-600">⚙️ Donanım</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Ekran:</span> {selectedVisitor.ekran_genislik}x{selectedVisitor.ekran_yukseklik}</p>
                  <p><span className="text-gray-500">Pixel Ratio:</span> {selectedVisitor.ekran_pixel_ratio}</p>
                  <p><span className="text-gray-500">CPU Core:</span> {selectedVisitor.cpu_core || '-'}</p>
                  <p><span className="text-gray-500">RAM:</span> {selectedVisitor.ram_gb ? `${selectedVisitor.ram_gb} GB` : '-'}</p>
                  <p><span className="text-gray-500">GPU:</span> {selectedVisitor.gpu_renderer || '-'}</p>
                </div>
              </div>

              {/* Kaynak */}
              <div>
                <h3 className="font-bold mb-3 text-red-600">🔗 Kaynak</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Referrer:</span> {selectedVisitor.referrer || 'Direkt'}</p>
                  <p><span className="text-gray-500">Giriş Sayfası:</span> {selectedVisitor.giris_sayfasi}</p>
                  {selectedVisitor.utm_source && (
                    <>
                      <p><span className="text-gray-500">UTM Source:</span> {selectedVisitor.utm_source}</p>
                      <p><span className="text-gray-500">UTM Medium:</span> {selectedVisitor.utm_medium || '-'}</p>
                      <p><span className="text-gray-500">UTM Campaign:</span> {selectedVisitor.utm_campaign || '-'}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Ek Bilgiler */}
              <div>
                <h3 className="font-bold mb-3 text-teal-600">ℹ️ Diğer</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Dil:</span> {selectedVisitor.dil}</p>
                  <p><span className="text-gray-500">Timezone:</span> {selectedVisitor.timezone}</p>
                  <p><span className="text-gray-500">Bağlantı:</span> {selectedVisitor.baglanti_turu || '-'}</p>
                  {selectedVisitor.pil_seviyesi && (
                    <p><span className="text-gray-500">Pil:</span> %{selectedVisitor.pil_seviyesi} {selectedVisitor.sarjda_mi ? '🔌' : '🔋'}</p>
                  )}
                  <p><span className="text-gray-500">Sayfa Görüntüleme:</span> {selectedVisitor.sayfa_goruntulenme}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
