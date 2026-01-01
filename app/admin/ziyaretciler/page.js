'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import dynamic from 'next/dynamic'
import {
  FaUsers, FaMobile, FaDesktop, FaTablet, FaMapMarkerAlt, FaGlobe,
  FaClock, FaChrome, FaSafari, FaFirefox, FaEdge, FaEye, FaSync,
  FaAndroid, FaApple, FaWindows, FaLinux, FaSearch, FaFilter,
  FaBullhorn, FaLink, FaUserSecret, FaBan, FaTrash, FaCheckSquare, FaSquare
} from 'react-icons/fa'
import toast from 'react-hot-toast'

// VisitorMap'i client-side only yükle
const VisitorMap = dynamic(() => import('@/components/VisitorMap'), { ssr: false })

export default function AdminZiyaretcilerPage() {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, message: '' })
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
    }

    data.forEach(v => {
      if (v.il) stats.cities[v.il] = (stats.cities[v.il] || 0) + 1
      if (v.cihaz_markasi) stats.brands[v.cihaz_markasi] = (stats.brands[v.cihaz_markasi] || 0) + 1
      if (v.tarayici) stats.browsers[v.tarayici] = (stats.browsers[v.tarayici] || 0) + 1
      if (v.isletim_sistemi) stats.os[v.isletim_sistemi] = (stats.os[v.isletim_sistemi] || 0) + 1
      
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
      v.fingerprint?.toLowerCase().includes(searchLower)
    )
  })

  const topItems = (obj, limit = 5) => {
    return Object.entries(obj || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
  }

  // IP Engelle
  const blockIP = async (ip, sebep = 'Admin tarafından engellendi') => {
    try {
      const { error } = await supabase.from('engelli_ipler').insert([{ ip_adresi: ip, sebep }])
      if (error) {
        if (error.code === '23505') {
          toast.error('Bu IP zaten engellenmiş')
        } else {
          throw error
        }
      } else {
        toast.success(`${ip} engellendi`)
      }
    } catch (error) {
      console.error('IP engelleme hatası:', error)
      toast.error('IP engellenemedi')
    }
  }

  // Ziyaretçi Sil
  const deleteVisitor = async (id) => {
    setConfirmModal({
      show: true,
      message: 'Bu ziyaretçiyi silmek istediğinizden emin misiniz?',
      action: async () => {
        try {
          const { error } = await supabase.from('ziyaretciler').delete().eq('id', id)
          if (error) throw error
          toast.success('Ziyaretçi silindi')
          fetchData()
        } catch (error) {
          console.error('Silme hatası:', error)
          toast.error('Ziyaretçi silinemedi')
        }
        setConfirmModal({ show: false, action: null, message: '' })
      }
    })
  }

  // Seçilenleri Sil
  const deleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Lütfen silinecek kayıtları seçin')
      return
    }
    setConfirmModal({
      show: true,
      message: `${selectedIds.length} ziyaretçiyi silmek istediğinizden emin misiniz?`,
      action: async () => {
        try {
          const { error } = await supabase.from('ziyaretciler').delete().in('id', selectedIds)
          if (error) throw error
          toast.success(`${selectedIds.length} ziyaretçi silindi`)
          setSelectedIds([])
          fetchData()
        } catch (error) {
          console.error('Silme hatası:', error)
          toast.error('Ziyaretçiler silinemedi')
        }
        setConfirmModal({ show: false, action: null, message: '' })
      }
    })
  }

  // Tümünü Sil
  const deleteAll = async () => {
    setConfirmModal({
      show: true,
      message: 'TÜM ziyaretçileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
      action: async () => {
        try {
          const { error } = await supabase.from('ziyaretciler').delete().neq('id', 0)
          if (error) throw error
          toast.success('Tüm ziyaretçiler silindi')
          setSelectedIds([])
          fetchData()
        } catch (error) {
          console.error('Silme hatası:', error)
          toast.error('Ziyaretçiler silinemedi')
        }
        setConfirmModal({ show: false, action: null, message: '' })
      }
    })
  }

  // Tümünü Seç/Kaldır
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVisitors.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredVisitors.map(v => v.id))
    }
  }

  // Tekli Seç/Kaldır
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ziyaretçi Analizi</h1>
          <p className="text-gray-500 text-sm mt-1">Detaylı ziyaretçi takibi ve analiz</p>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

        {/* Kaynaklar */}
        <div className="admin-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaBullhorn className="text-orange-500" /> Trafik Kaynağı
          </h3>
          <div className="space-y-2">
            {topItems(stats.sources).map(([source, count]) => (
              <div key={source} className="flex justify-between items-center">
                <span className="text-sm truncate">{source}</span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="IP, İl, Marka veya Fingerprint ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
      </div>

      {/* Yönetim Butonları */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className="admin-btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTrash /> Seçilenleri Sil ({selectedIds.length})
        </button>
        <button
          onClick={deleteAll}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
        >
          <FaTrash /> Tümünü Sil
        </button>
      </div>

      {/* Ziyaretçi Listesi */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-center py-3 px-2 w-10">
                <button onClick={toggleSelectAll} className="text-blue-600 hover:text-blue-700">
                  {selectedIds.length === filteredVisitors.length && filteredVisitors.length > 0 ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
                </button>
              </th>
              <th className="text-left py-3 px-2">Zaman</th>
              <th className="text-left py-3 px-2">IP</th>
              <th className="text-left py-3 px-2">Konum</th>
              <th className="text-left py-3 px-2">Cihaz</th>
              <th className="text-left py-3 px-2">Tarayıcı</th>
              <th className="text-left py-3 px-2">Kaynak</th>
              <th className="text-left py-3 px-2">Sayfa</th>
              <th className="text-center py-3 px-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map((v) => {
              const DeviceIcon = getDeviceIcon(v.cihaz_turu)
              const BrowserIcon = getBrowserIcon(v.tarayici)
              const OSIcon = getOSIcon(v.isletim_sistemi)
              
              return (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 text-center">
                    <button onClick={() => toggleSelect(v.id)} className="text-blue-600 hover:text-blue-700">
                      {selectedIds.includes(v.id) ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
                    </button>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-gray-400 text-xs" />
                      <span>{formatDate(v.created_at)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <code className="text-xs bg-gray-100 px-1 rounded">{v.ip_adresi || '-'}</code>
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
                    <div className="flex flex-wrap items-center gap-1">
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
                      {v.reklam_trafigi && (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                          ADS
                        </span>
                      )}
                      {v.telefon_tiklama && (
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                          📞
                        </span>
                      )}
                      {v.whatsapp_tiklama && (
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                          💬
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 max-w-[150px] truncate">
                    {v.giris_sayfasi || '/'}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => blockIP(v.ip_adresi, `Ziyaretçi ID: ${v.id}`)}
                        className="p-2 bg-red-600 text-white hover:bg-red-700 rounded transition"
                        title="IP Engelle"
                      >
                        <FaBan size={14} />
                      </button>
                      <button
                        onClick={() => deleteVisitor(v.id)}
                        className="p-2 border border-red-600 text-red-600 hover:bg-red-50 rounded transition"
                        title="Sil"
                      >
                        <FaTrash size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedVisitor(v)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Detay"
                      >
                        <FaEye size={14} />
                      </button>
                    </div>
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
                </div>
              </div>

              {/* Konum */}
              <div>
                <h3 className="font-bold mb-3 text-green-600">📍 Konum</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">İzin:</span> {selectedVisitor.konum_izni ? '✅ Verildi' : '❌ Verilmedi'}</p>
                  <p><span className="text-gray-500">Konum Tipi:</span> {selectedVisitor.konum_tipi || 'IP'}</p>
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
                    pinColor={selectedVisitor.reklam_trafigi ? '#e74c3c' : '#27ae60'}
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
                  <p><span className="text-gray-500">Reklam Trafiği:</span> {selectedVisitor.reklam_trafigi ? '✅ Evet' : '❌ Hayır'}</p>
                  {selectedVisitor.gclid && (
                    <p><span className="text-gray-500">GCLID:</span> <code className="bg-gray-100 px-1 rounded text-xs">{selectedVisitor.gclid}</code></p>
                  )}
                  {selectedVisitor.utm_source && (
                    <>
                      <p><span className="text-gray-500">UTM Source:</span> {selectedVisitor.utm_source}</p>
                      <p><span className="text-gray-500">UTM Medium:</span> {selectedVisitor.utm_medium || '-'}</p>
                      <p><span className="text-gray-500">UTM Campaign:</span> {selectedVisitor.utm_campaign || '-'}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Dönüşüm */}
              <div>
                <h3 className="font-bold mb-3 text-pink-600">🎯 Dönüşüm</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Telefon Tıklama:</span> {selectedVisitor.telefon_tiklama ? '✅ Evet' : '❌ Hayır'}</p>
                  <p><span className="text-gray-500">WhatsApp Tıklama:</span> {selectedVisitor.whatsapp_tiklama ? '✅ Evet' : '❌ Hayır'}</p>
                  {selectedVisitor.donusum_zamani && (
                    <p><span className="text-gray-500">Dönüşüm Zamanı:</span> {formatDate(selectedVisitor.donusum_zamani)}</p>
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

      {/* Onay Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmModal({ show: false, action: null, message: '' })}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Onay</h3>
            <p className="text-gray-700 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ show: false, action: null, message: '' })}
                className="admin-btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={confirmModal.action}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
