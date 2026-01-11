'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import {
  FaUsers, FaMobile, FaDesktop, FaTablet, FaTrash, FaSync,
  FaCalendar, FaChrome, FaSafari, FaFirefox, FaEdge,
  FaAndroid, FaApple, FaWindows, FaLinux
} from 'react-icons/fa'

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('today')
  const supabase = createClient()

  useEffect(() => { fetchData() }, [filter])

  const fetchData = async () => {
    setLoading(true)

    let query = supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })

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
      unique: new Set(data.map(v => v.session_id)).size,
      mobile: data.filter(v => v.device_type === 'mobile').length,
      desktop: data.filter(v => v.device_type === 'desktop').length,
      tablet: data.filter(v => v.device_type === 'tablet').length,
      ads: data.filter(v => v.source === 'ads').length,
      facebook: data.filter(v => v.source === 'face').length,
      direct: data.filter(v => v.source === 'direk').length,

      // Mobil operatörler
      turkcell: data.filter(v => v.mobile_operator === 'Türkcell').length,
      vodafone: data.filter(v => v.mobile_operator === 'Vodafone').length,
      turktelekom: data.filter(v => v.mobile_operator === 'Turk Telekom').length,

      // Tarayıcılar
      browsers: {},
      // OS
      os: {},
    }

    data.forEach(v => {
      if (v.browser) stats.browsers[v.browser] = (stats.browsers[v.browser] || 0) + 1
      if (v.os) stats.os[v.os] = (stats.os[v.os] || 0) + 1
    })

    setStats(stats)
  }

  // TEK ZİYARETÇİ SİL
  const deleteVisitor = async (id) => {
    if (!confirm('Bu ziyareti silmek istediğinize emin misiniz?')) return

    setLoading(true)
    const { error } = await supabase
      .from('visitors')
      .delete()
      .eq('id', id)

    if (!error) {
      alert('Ziyaret silindi!')
      fetchData()
    } else {
      alert('Hata: ' + error.message)
    }
    setLoading(false)
  }

  // TÜM ZİYARETLERİ SİL - ÖNEMLİ!
  const deleteAllVisitors = async () => {
    const confirmText = 'TÜM ZİYARETLERİ SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!\n\nDevam etmek için "SIFIRLA" yazın:'

    const userInput = prompt(confirmText)

    if (userInput !== 'SIFIRLA') {
      alert('İşlem iptal edildi.')
      return
    }

    setLoading(true)

    // Tüm kayıtları sil
    const { error } = await supabase
      .from('visitors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Tüm ziyaretler silindi!')
      setVisitors([])
      setStats({})
    }

    setLoading(false)
  }

  // TARİH ARALIĞINA GÖRE SİL
  const deleteByDateRange = async () => {
    const startDate = prompt('Başlangıç tarihi (YYYY-MM-DD):')
    if (!startDate) return

    const endDate = prompt('Bitiş tarihi (YYYY-MM-DD):')
    if (!endDate) return

    if (!confirm(`${startDate} ile ${endDate} arasındaki kayıtlar silinecek. Emin misiniz?`)) return

    setLoading(true)
    const { error } = await supabase
      .from('visitors')
      .delete()
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')

    if (!error) {
      alert('Seçili tarih aralığındaki kayıtlar silindi!')
      fetchData()
    } else {
      alert('Hata: ' + error.message)
    }
    setLoading(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getSourceBadge = (source) => {
    const badges = {
      'ads': 'bg-green-100 text-green-800',
      'face': 'bg-blue-100 text-blue-800',
      'direk': 'bg-gray-100 text-gray-800',
      'instagram': 'bg-pink-100 text-pink-800',
      'twitter': 'bg-sky-100 text-sky-800',
      'google_organik': 'bg-yellow-100 text-yellow-800',
    }
    return badges[source] || 'bg-purple-100 text-purple-800'
  }

  const getOperatorBadge = (operator) => {
    const badges = {
      'Türkcell': 'bg-yellow-100 text-yellow-800',
      'Vodafone': 'bg-red-100 text-red-800',
      'Turk Telekom': 'bg-blue-100 text-blue-800',
    }
    return badges[operator] || 'bg-gray-100 text-gray-800'
  }

  const getBrowserIcon = (browser) => {
    if (browser?.includes('Chrome')) return <FaChrome className="text-yellow-500" />
    if (browser?.includes('Safari')) return <FaSafari className="text-blue-500" />
    if (browser?.includes('Firefox')) return <FaFirefox className="text-orange-500" />
    if (browser?.includes('Edge')) return <FaEdge className="text-blue-600" />
    return null
  }

  const getOSIcon = (os) => {
    if (os?.includes('Android')) return <FaAndroid className="text-green-500" />
    if (os?.includes('iOS') || os?.includes('macOS')) return <FaApple className="text-gray-700" />
    if (os?.includes('Windows')) return <FaWindows className="text-blue-500" />
    if (os?.includes('Linux')) return <FaLinux className="text-black" />
    return null
  }

  const getDeviceIcon = (type) => {
    if (type === 'mobile') return <FaMobile className="text-blue-500" />
    if (type === 'tablet') return <FaTablet className="text-purple-500" />
    return <FaDesktop className="text-gray-600" />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ziyaretçi Takibi (Yeni)</h1>
          <p className="text-gray-500 text-sm mt-1">Reklam kaynağı ve mobil operatör takibi</p>
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
          <button onClick={fetchData} className="admin-btn-secondary p-2" disabled={loading}>
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="admin-card text-center">
          <FaUsers className="text-3xl text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.total || 0}</p>
          <p className="text-sm text-gray-500">Toplam</p>
        </div>
        <div className="admin-card text-center">
          <div className="text-2xl mx-auto mb-2">🟢</div>
          <p className="text-2xl font-bold">{stats.ads || 0}</p>
          <p className="text-sm text-gray-500">Google Ads</p>
        </div>
        <div className="admin-card text-center">
          <div className="text-2xl mx-auto mb-2">🔵</div>
          <p className="text-2xl font-bold">{stats.facebook || 0}</p>
          <p className="text-sm text-gray-500">Facebook</p>
        </div>
        <div className="admin-card text-center">
          <FaMobile className="text-3xl text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.mobile || 0}</p>
          <p className="text-sm text-gray-500">Mobil</p>
        </div>
        <div className="admin-card text-center">
          <div className="text-2xl mx-auto mb-2">🟡</div>
          <p className="text-2xl font-bold">{stats.turkcell || 0}</p>
          <p className="text-sm text-gray-500">Türkcell</p>
        </div>
        <div className="admin-card text-center">
          <div className="text-2xl mx-auto mb-2">🔴</div>
          <p className="text-2xl font-bold">{stats.vodafone || 0}</p>
          <p className="text-sm text-gray-500">Vodafone</p>
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={deleteByDateRange}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
        >
          <FaCalendar /> Tarih Aralığı Sil
        </button>

        <button
          onClick={deleteAllVisitors}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold flex items-center gap-2"
        >
          <FaTrash /> TÜM ZİYARETLERİ SİL
        </button>
      </div>

      {/* Ziyaretçi Tablosu */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Tarih</th>
              <th className="text-left py-3 px-2">Kaynak</th>
              <th className="text-left py-3 px-2">Kampanya</th>
              <th className="text-left py-3 px-2">Operatör</th>
              <th className="text-left py-3 px-2">Cihaz</th>
              <th className="text-left py-3 px-2">Tarayıcı</th>
              <th className="text-left py-3 px-2">OS</th>
              <th className="text-left py-3 px-2">IP</th>
              <th className="text-center py-3 px-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 whitespace-nowrap text-xs">
                  {formatDate(v.created_at)}
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSourceBadge(v.source)}`}>
                    {v.source}
                  </span>
                </td>
                <td className="py-3 px-2 text-xs">{v.campaign || '-'}</td>
                <td className="py-3 px-2">
                  {v.mobile_operator ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getOperatorBadge(v.mobile_operator)}`}>
                      {v.mobile_operator}
                    </span>
                  ) : '-'}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    {getDeviceIcon(v.device_type)}
                    <span className="text-xs">{v.device_type}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    {getBrowserIcon(v.browser)}
                    <span className="text-xs">{v.browser}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    {getOSIcon(v.os)}
                    <span className="text-xs">{v.os}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <code className="text-xs bg-gray-100 px-1 rounded">{v.ip_address}</code>
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => deleteVisitor(v.id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visitors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {loading ? 'Yükleniyor...' : 'Henüz ziyaretçi kaydı yok'}
          </div>
        )}
      </div>

      {/* Footer İstatistikler */}
      {visitors.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="admin-card">
            <h3 className="font-bold mb-3">Tarayıcı Dağılımı</h3>
            <div className="space-y-2">
              {Object.entries(stats.browsers || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([browser, count]) => (
                  <div key={browser} className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      {getBrowserIcon(browser)}
                      {browser}
                    </span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="admin-card">
            <h3 className="font-bold mb-3">İşletim Sistemi Dağılımı</h3>
            <div className="space-y-2">
              {Object.entries(stats.os || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([os, count]) => (
                  <div key={os} className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      {getOSIcon(os)}
                      {os}
                    </span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
